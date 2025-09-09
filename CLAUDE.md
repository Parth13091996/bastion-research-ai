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