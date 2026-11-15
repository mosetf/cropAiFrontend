# CropAI Kenya: web front end

Next.js front end for CropAI Kenya. A farmer signs up, picks a crop and a Kenyan county, enters planting date, soil values and fertiliser use, and sees a predicted yield, harvest window, rough profit estimate, risk level and advice.

The API it talks to is in a separate repository: [`mosetf/CropAiBackend`](https://github.com/mosetf/CropAiBackend). The estimates are produced there; see that README for how they are made and their limitations. This is a working prototype, so treat results as illustrative.

## Tech stack

- Next.js 15 (App Router), React 18, TypeScript
- Tailwind CSS 3
- Zustand (auth state), TanStack React Query, Axios
- Lucide icons, Crimson Pro and DM Sans fonts (via Fontsource)

## Pages

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/signup`, `/login` | Account creation and sign-in (JWT) |
| `/dashboard` | List of the user's past predictions |
| `/predict` | New prediction form (crops and locations are loaded from the API) |
| `/results/[id]` | One prediction in detail, including a notice when fallback data was used |
| `/sessions` | Active login sessions |

API calls are made from `lib/api.ts`: Bearer token on each request, with automatic token refresh on a 401. An inactivity timer logs users out (`hooks/useInactivityTimer.ts`).

## Local setup

Requirements: Node.js 24.x (as declared in `package.json`; other recent versions may work with a warning) and npm.

```bash
git clone https://github.com/mosetf/cropAiFrontend.git
cd cropAiFrontend
npm ci
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

Open http://localhost:3000. You need the backend running at `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`) for sign-up and predictions to work; the backend README explains how to start it.

Other commands: `npm run build` (production build), `npm start` (serve the build).

## Configuration

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API. Falls back to `http://localhost:8000` if unset. |

`.env.production.example` shows the production variables. Do not commit real values.

## Deployment

The front end is deployed on Vercel. Set `NEXT_PUBLIC_API_URL` in the Vercel project settings to the backend's public HTTPS URL; the backend must list the front end's origin in its `CORS_ALLOWED_ORIGINS`. A GitHub Actions workflow (`.github/workflows/build.yml`) checks that the project builds on every push and pull request; it does not deploy.

## Project structure

- `app/`: pages and layouts
- `components/`: shared UI components
- `hooks/`: custom hooks
- `lib/`: API client
- `store/`: Zustand auth store
- `types/`: TypeScript types
- `utils/`: route protection

## Known gaps

- There are no automated tests and no ESLint configuration yet.
- `npm audit` still reports two advisories in the PostCSS copy bundled with Next.js; fixing them requires upgrading to Next.js 16.

## License

Private project for CropAI Kenya.
