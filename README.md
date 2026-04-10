# CropAI Kenya - Frontend

CropAI Kenya is a web-based platform designed to empower Kenyan farmers with data-driven crop yield forecasts. By leveraging local weather patterns, soil data, and crop information, the platform provides actionable insights to improve farming outcomes and profitability.

## Core Development Principles

### DRY (Don't Repeat Yourself)
Always follow DRY principles to ensure code reuse and maintainability. Extract common logic into helper functions or utilities rather than duplicating code.

### Git rules
Never commit code without user approval.

### PEP 8 Compliance
Strictly adhere to PEP 8 standards for Python and Django code formatting and style.

### Methodological Workflow
1. Plan before implementing - Never implement a solution without proper planning
2. Diagnose before fixing - Never fix a bug without proper diagnosis
3. No guessing - Base decisions on analysis, not assumptions

### Testing Standards
1. Always Write Tests - Write test using pytest suite cases for all new implementations and update existing tests for modifications. Note: we test endpoint behavior just how a normal user/frontend would use the endpoints.
2. Test Like a User - Test core fixtures and functionality as a normal user would interact with the system.
3. Verify Before Committing - Run relevant tests to ensure changes don't break existing functionality.

### Code Hygiene
1. Clean Up After Fixes - Remove debug statements, temporary files, and test artifacts after completing work.
2. No Debug Artifacts - Remove print statements, commented code, and temporary variables before finalizing.

### Documentation Standards
1. Minimalist Logic Comments - Only comment where logic is genuinely complex; avoid line-by-line commentary.
2. Concise Docstrings - Use clear, short, and focused docstrings where applicable.
3. README-First Approach - Document changes in the relevant app's README.md immediately.
4. No Random Documentation Files - Provide summaries in conversation; only create documentation files when explicitly instructed or when there's no alternative.
5. Well-Documented Code - Aim for high readability with minimal fluff.

### Communication Standards
1. No Emojis - Strictly avoid emojis in code, comments, or communication.
2. Explicit Identification - Always indicate the option number at the start of responses or solutions.

## Features

- Yield Estimation: Get accurate yield forecasts (kg/ha) based on crop type, location, planting date, and soil properties.
- Profit Calculator: Compare expected income against planting and fertilizer costs to make informed financial decisions.
- Historical Weather Data: Uses 10-year records of rainfall and temperature from specific Kenyan regions.
- Farmer Dashboard: Track and manage past predictions to monitor progress over time.
- Secure Authentication: User signup and login with JWT-based session management.
- Automatic Session Management: Inactivity timer for enhanced security.

## Tech Stack

- Framework: [Next.js 14](https://nextjs.org/) (App Router)
- Language: [TypeScript](https://www.typescriptlang.org/)
- Styling: [Tailwind CSS](https://tailwindcss.com/)
- State Management: [Zustand](https://github.com/pmndrs/zustand)
- Data Fetching: [Axios](https://axios-http.com/) & [TanStack React Query](https://tanstack.com/query/latest)
- Icons: [Lucide React](https://lucide.dev/)
- Fonts: [Crimson Pro](https://fontsource.org/fonts/crimson-pro) & [DM Sans](https://fontsource.org/fonts/dm-sans)

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd cropAiFrontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a .env.local file in the root directory (refer to .env.production.example for required variables):
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000 in your browser.

## Project Structure

- app/: Next.js App Router pages and layouts.
- components/: Reusable UI components (Buttons, Cards, Navbar, etc.).
- hooks/: Custom React hooks (e.g., useInactivityTimer).
- lib/: API client and configuration.
- store/: Zustand state management for authentication.
- types/: TypeScript interfaces and types.
- utils/: Helper functions and route protection.

## License

This project is private and intended for CropAI Kenya.
