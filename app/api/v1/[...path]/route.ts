import type { NextRequest } from 'next/server';

/**
 * Server-side proxy for the CropAI backend API.
 *
 * The browser only ever calls this site (/api/v1/...); this handler forwards
 * the request to BACKEND_URL, so the backend address is never sent to the
 * browser and no CORS is involved. Only /api/v1/ is reachable through it (not
 * the backend's admin or schema pages).
 *
 * Rules:
 * - the target is always BACKEND_URL + /api/v1/<validated segments>/, never
 *   anything taken from the request, so it cannot be pointed at another host
 * - only an allow-list of request and response headers is forwarded
 * - the real client IP is passed on as X-Forwarded-For (the backend records it
 *   for sessions and rate limits)
 * - Set-Cookie is passed through (Domain removed, Secure added on https)
 * - redirects from the backend are not followed or exposed
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // seconds; predictions can wait on an LLM

const UPSTREAM_TIMEOUT_MS = 55_000;
const MAX_BODY_BYTES = 4 * 1024 * 1024;
const SEGMENT = /^[A-Za-z0-9._~@+-]+$/;

const FORWARD_REQUEST_HEADERS = [
  'authorization',
  'content-type',
  'accept',
  'accept-language',
  'cookie',
  'user-agent',
];
const FORWARD_RESPONSE_HEADERS = ['content-type', 'content-language', 'retry-after'];

type Context = { params: Promise<{ path: string[] }> };

function json(status: number, detail: string): Response {
  return Response.json({ detail }, { status, headers: { 'cache-control': 'no-store' } });
}

/** Backend origin without a trailing slash, or null when it is not configured. */
function backendOrigin(): string | null {
  const raw = (process.env.BACKEND_URL || '').trim();
  if (!raw) {
    return process.env.NODE_ENV === 'production' ? null : 'http://localhost:8000';
  }
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return url.origin;
  } catch {
    return null;
  }
}

function clientIp(request: NextRequest): string | null {
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : null;
}

function isHttps(request: NextRequest): boolean {
  return (
    request.nextUrl.protocol === 'https:' ||
    request.headers.get('x-forwarded-proto')?.split(',')[0].trim() === 'https'
  );
}

/** Make a backend cookie belong to this site and be https-only when we are on https. */
function rewriteCookie(cookie: string, secure: boolean): string {
  let value = cookie.replace(/;\s*domain=[^;]*/i, '');
  if (secure && !/;\s*secure\b/i.test(value)) value += '; Secure';
  return value;
}

async function proxy(request: NextRequest, context: Context): Promise<Response> {
  const origin = backendOrigin();
  if (!origin) {
    console.error('[proxy] BACKEND_URL is missing or invalid');
    return json(500, 'The server is not configured to reach the backend.');
  }

  const { path } = await context.params;
  if (!path.length || !path.every((s) => SEGMENT.test(s) && s !== '.' && s !== '..')) {
    return json(400, 'Invalid API path.');
  }
  const target = `${origin}/api/v1/${path.map(encodeURIComponent).join('/')}/${request.nextUrl.search}`;

  const headers = new Headers();
  for (const name of FORWARD_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const ip = clientIp(request);
  if (ip) headers.set('x-forwarded-for', ip);

  let body: ArrayBuffer | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.arrayBuffer();
    if (body.byteLength > MAX_BODY_BYTES) return json(413, 'Request body too large.');
    if (body.byteLength === 0) body = undefined;
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body,
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (error) {
    const name = error instanceof Error ? error.name : 'Error';
    console.error(`[proxy] upstream request failed: ${name}`);
    return name === 'TimeoutError' || name === 'AbortError'
      ? json(504, 'The backend took too long to respond.')
      : json(502, 'The backend is unavailable.');
  }

  if (upstream.status >= 300 && upstream.status < 400) {
    console.error(`[proxy] unexpected redirect from backend (HTTP ${upstream.status})`);
    return json(502, 'Unexpected response from the backend.');
  }

  const responseHeaders = new Headers({ 'cache-control': 'no-store' });
  for (const name of FORWARD_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  const secure = isHttps(request);
  for (const cookie of upstream.headers.getSetCookie()) {
    responseHeaders.append('set-cookie', rewriteCookie(cookie, secure));
  }

  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
