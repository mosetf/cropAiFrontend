/**
 * BACKEND_URL is the address of the CropAI API. It is only ever read on the
 * server (the proxy in app/api/v1/[...path]/route.ts), so it never reaches the
 * browser. Production builds fail here, loudly, when it is missing or unsafe,
 * instead of quietly falling back to a localhost address.
 */
function checkBackendUrl() {
  const raw = (process.env.BACKEND_URL || '').trim();
  const isProduction = process.env.NODE_ENV === 'production';

  if (!raw) {
    if (isProduction) {
      throw new Error(
        'BACKEND_URL is not set. Set it to the backend origin, e.g. https://api.example.com ' +
          '(Vercel: Project Settings > Environment Variables, for the Production environment).'
      );
    }
    return; // development: the proxy defaults to http://localhost:8000
  }

  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('BACKEND_URL is not a valid URL. Use an origin such as https://api.example.com');
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('BACKEND_URL must start with https:// (or http:// for a local backend).');
  }
  if (url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
    throw new Error('BACKEND_URL must be a plain origin: no path, query, fragment or credentials.');
  }
  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (isProduction && url.protocol !== 'https:' && !isLocal) {
    throw new Error('BACKEND_URL must use https:// in production.');
  }
}

checkBackendUrl();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The backend routes end in "/". Keep the slash instead of redirecting the
  // browser to the slash-less form before the request reaches the proxy.
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
