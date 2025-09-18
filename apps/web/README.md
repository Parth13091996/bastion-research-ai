# Bastion Research Frontend

This is the frontend for the Bastion Research application, built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- User authentication (Login and Registration)
- Dashboard with Cashfree payment integration
- Payment history display
- Admin Analytics dashboard (Chart.js)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root of the project and add the following environment variable:
    ```
    VITE_API_BASE_URL=<your-backend-api-url>
    ```
    For example:
    ```
    VITE_API_BASE_URL=https://bastion-research-backend.onrender.com
    ```

### Analytics

The SPA automatically records page views to the backend on every route change (IP-based and user-based when a login cookie exists).

- Library: Chart.js via `react-chartjs-2`
- Admin page: `/admin/dashboard`
- Backend endpoints:
  - `POST /api/analytics/track` (public)
  - `GET /api/admin/analytics/summary?days=7` (admin only)

Ensure the backend has created the `analytics_pageviews` table (see `apps/server/sql/analytics.sql`).

### Running the Application

To start the development server, run the following command:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run lint`: Lints the code.
- `npm run preview`: Previews the production build.
