# Bastion Research Monorepo

Monorepo for Bastion Research comprising a React frontend and a Node/Express API server, managed with Turborepo and pnpm workspaces.

## Apps and Packages

- `apps/web`: React + TypeScript + Vite + Tailwind CSS SPA
- `apps/server`: Node.js + Express + TypeScript API
- `packages/types`: Shared TypeScript types

## Prerequisites

- Node.js >= 20
- pnpm (repo uses `packageManager: pnpm`)

## Install

```
pnpm install
```

## Development

Run both apps in parallel:

```
pnpm dev
```

Or individually:

```
pnpm dev:web
pnpm dev:server
```

## Build

Build everything:

```
pnpm build
```

Build a single app:

```
pnpm build:web
pnpm build:server
```

## Deployment

### Frontend (React) → Hostinger

From the `apps/web` directory, upload the contents of `public_html` to the Hostinger server:

```
scp -r -P 65002 .\public_html\*   u268986054@89.117.188.211:/home/u268986054/domains/dev.bastionresearch.in/public_html/
```

This copies the built/static site to the remote `public_html` directory. Ensure `public_html` contains your latest build artifacts before syncing.

### Backend (Server) – Production Ops

SSH into the server and attach the last tmux session, then run the upstream launcher:

```
ssh root@82.29.166.56
tmux at
./upstream-server.sh
```

Run the script from the project root on the server. It will start or restart the upstream server process.

## Notes

- Linting and formatting:
  - `pnpm lint`
  - `pnpm format`
- Type checks: `pnpm check-types`
- See `apps/web/README.md` and `apps/server/README.md` for app-specific details (analytics, payments, file uploads).
