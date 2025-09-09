# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Primary development commands:**
- `pnpm dev` - Start all apps in development mode (parallel)
- `pnpm dev:web` - Start only web frontend (Vite React app)
- `pnpm dev:server` - Start only server (Node.js Express API)
- `pnpm build` - Build all apps and packages
- `pnpm build:web` - Build web app only
- `pnpm build:server` - Build server only
- `pnpm lint` - Run ESLint across all packages
- `pnpm format` - Format code with Prettier
- `pnpm check-types` - Run TypeScript type checking across all packages

**Package manager:** pnpm (version 10.4.1)
**Node.js:** Requires Node.js >=20

## Architecture Overview

This is a **Turborepo monorepo** with a full-stack application consisting of:

### Apps Structure
- **`apps/web/`** - React frontend (Vite + TypeScript)
  - Modern React app with Vite build system
  - Uses Radix UI components, TailwindCSS, Framer Motion
  - State management: Zustand, TanStack Query
  - Routing: React Router v7
  - Rich text editing: TipTap editor
  - Authentication via Supabase
  - Payment integration: Cashfree

- **`apps/server/`** - Node.js Express API server
  - Express.js with TypeScript
  - Database: PostgreSQL via Supabase
  - Authentication: JWT tokens
  - Payment processing: Cashfree integration
  - Email: Nodemailer
  - Development: nodemon with ts-node

### Packages Structure
- **`packages/types/`** - Shared TypeScript type definitions
  - Used by both web and server via workspace references (`@repo/types`)

### Key Technology Stack
- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, Radix UI
- **Backend:** Node.js, Express, TypeScript, PostgreSQL
- **Database/Auth:** Supabase (PostgreSQL + Auth)
- **Payments:** Cashfree integration
- **Monorepo:** Turborepo with pnpm workspaces
- **Development:** Hot reload via Vite (frontend) and nodemon (backend)

### Database
- Main database file: `db.sql` (PostgreSQL schema)
- Uses Supabase for database hosting and authentication

## Turborepo Configuration

The `turbo.json` defines task pipeline:
- **dev:** Cached, persistent (for development servers)
- **build:** Depends on package dependencies, outputs to `.next/**` and `dist/**`
- **lint:** Standard linting task

## Development Workflow

1. **Starting development:** Use `pnpm dev` to start both frontend and backend simultaneously
2. **Individual apps:** Use `pnpm dev:web` or `pnpm dev:server` for focused development
3. **Building:** Use `pnpm build` for production builds
4. **Type checking:** Run `pnpm check-types` before commits to ensure type safety

## Project Context

This appears to be **BastionResearch.in** - a web application with:
- User authentication and management system
- Subscription/payment processing
- Admin panel functionality
- Job applications and career features
- Analytics tracking
- Multi-role user system (admin, regular users)

The architecture supports a B2B/SaaS application with user management, subscriptions, and administrative features.
- Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
chunk-7W6PX2NL.js?v=2dc52620:1067 AG Grid: error #239 Theming API and CSS File Themes are both used in the same page. In v33 we released the Theming API as the new default method of styling the grid. See the migration docs https://www.ag-grid.com/react-data-grid/theming-migration/. Because no value was provided to the `theme` grid option it defaulted to themeQuartz. But the file (ag-grid.css) is also included and will cause styling issues. Either pass the string "legacy" to the theme grid option to use v32 style themes, or remove ag-grid.css from the page to use Theming API. 
See https://www.ag-grid.com/react-data-grid/errors/239?_version_=34.1.2
chunk-7W6PX2NL.js?v=2dc52620:1064 AG Grid: As of version 32.2.1, using `rowSelection` with the values "single" or "multiple" has been deprecated. Use the object value instead.
chunk-7W6PX2NL.js?v=2dc52620:1064 AG Grid: As of v32.2, suppressRowClickSelection is deprecated. Use `rowSelection.enableClickSelection` instead.
chunk-7W6PX2NL.js?v=2dc52620:1064 AG Grid: As of v32.2, checkboxSelection is deprecated. Use `rowSelection.checkboxes` in `GridOptions` instead.
chunk-7W6PX2NL.js?v=2dc52620:1064 AG Grid: As of v32.2, headerCheckboxSelection is deprecated. Use `rowSelection.headerCheckbox = true` in `GridOptions` instead.
chunk-7W6PX2NL.js?v=2dc52620:1064 AG Grid: error #94 'paginationPageSize=10', but 10 is not included in the default paginationPageSizeSelector=[20, 50, 100]. 
See https://www.ag-grid.com/react-data-grid/errors/94?_version_=34.1.2&pageSize…%220%22%3A20%2C%221%22%3A50%2C%222%22%3A100%7D&paginationPageSizeOption=10
chunk-7W6PX2NL.js?v=2dc52620:1064 AG Grid: error #95 Either set 'paginationPageSizeSelector' to an array that includes 10 or to 'false' to disable the page size selector. 
See https://www.ag-grid.com/react-data-grid/errors/95?_version_=34.1.2&paginationPageSizeOption=10&paginationPageSizeSelector=paginationPageSizeSelector
chunk-BOO3OOWN.js?v=2dc52620:16670 Uncaught TypeError: gridRef.current.api.setQuickFilter is not a function
    at ManageMembers.tsx:101:27
chunk-BOO3OOWN.js?v=2dc52620:14032 The above error occurred in the <MemberManagementDashboard> component:

    at MemberManagementDashboard (http://localhost:8080/src/pages/Admin/AR/ManageMembers.tsx:96:25)
    at RenderedRoute (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=2dc52620:5594:26)
    at Outlet (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=2dc52620:6291:26)
    at AdminRoute (http://localhost:8080/src/routes/AdminRoutes/AdminRoute.tsx:27:42)
    at RenderedRoute (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=2dc52620:5594:26)
    at Outlet (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=2dc52620:6291:26)
    at main
    at div
    at div
    at AdminLayout
    at RenderedRoute (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=2dc52620:5594:26)
    at AppRoutes (http://localhost:8080/src/App.tsx?t=1757408549171:29:21)
    at Router (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=2dc52620:6300:13)
    at BrowserRouter (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=2dc52620:9401:3)
    at App
    at AuthProvider (http://localhost:8080/src/contexts/AuthContext.tsx:29:32)
    at QueryClientProvider (http://localhost:8080/node_modules/.vite/deps/@tanstack_react-query.js?v=2dc52620:2934:3)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
chunk-BOO3OOWN.js?v=2dc52620:9129 Uncaught TypeError: gridRef.current.api.setQuickFilter is not a function
    at ManageMembers.tsx:101:27