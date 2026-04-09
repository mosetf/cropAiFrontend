# CropAI Kenya - Frontend

CropAI Kenya is a web-based platform designed to empower Kenyan farmers with data-driven crop yield forecasts. By leveraging local weather patterns, soil data, and crop information, the platform provides actionable insights to improve farming outcomes and profitability.

## 🌾 Features

- **Yield Estimation**: Get accurate yield forecasts (kg/ha) based on crop type, location, planting date, and soil properties.
- **Profit Calculator**: Compare expected income against planting and fertilizer costs to make informed financial decisions.
- **Historical Weather Data**: Uses 10-year records of rainfall and temperature from specific Kenyan regions.
- **Farmer Dashboard**: Track and manage past predictions to monitor progress over time.
- **Secure Authentication**: User signup and login with JWT-based session management.
- **Automatic Session Management**: Inactivity timer for enhanced security.

## 🚀 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [Axios](https://axios-http.com/) & [TanStack React Query](https://tanstack.com/query/latest)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Fonts**: [Crimson Pro](https://fontsource.org/fonts/crimson-pro) & [DM Sans](https://fontsource.org/fonts/dm-sans)

## 🛠️ Getting Started

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
   Create a `.env.local` file in the root directory (refer to `.env.production.example` for required variables):
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components (Buttons, Cards, Navbar, etc.).
- `hooks/`: Custom React hooks (e.g., `useInactivityTimer`).
- `lib/`: API client and configuration.
- `store/`: Zustand state management for authentication.
- `types/`: TypeScript interfaces and types.
- `utils/`: Helper functions and route protection.

## 📄 License

This project is private and intended for CropAI Kenya.
