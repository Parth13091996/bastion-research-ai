# Turborepo starter

This Turborepo starter is maintained by the Turborepo core team.


## Using this example

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@workspace/ui`: a stub React component library shared by both `web` and `docs` applications
- `@workspace/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@workspace/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build
yarn dlx turbo build
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build --filter=docs

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build --filter=docs
yarn exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev
yarn exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev --filter=web

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev --filter=web
yarn exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo login

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo login
yarn exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo link

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo link
yarn exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)

## Research Feature (Admin + Public)

This repository includes a Research feature similar to Newsletters/Webinars/Podcasts.

- Backend
  - New Supabase table: `public.research` with snake_case columns.
  - Endpoints:
    - Public: `GET /content/research`, `GET /content/research/:id`
    - Admin (auth required): `GET/POST/PUT/DELETE /api/admin/content/research` and `GET/PUT/DELETE /api/admin/content/research/:id`
  - File uploads: `POST /api/files/upload` expects multipart/form-data field `file` (PDF), returns a public URL.

- Database setup
  - Apply SQL at `apps/server/sql/2025-09-25_create_research_table.sql` to your Supabase/Postgres instance.

- Frontend
  - Admin pages: `/admin/content/research`, `/admin/content/research/create`, `/admin/content/research/:id/edit`
  - Public pages: `/research`, `/research/:id` (renders PDF via react-pdf)

## Mailchimp Newsletter Integration

The newsletters experience now consumes your Mailchimp campaign RSS feed end-to-end:

- **Server configuration**
  - `MAILCHIMP_RSS_URL` (required) — Mailchimp RSS feed URL (e.g. `https://<dc>.campaign-archive.com/feed?...`).
  - `MAILCHIMP_RSS_CACHE_SECONDS` (optional) — In-memory cache TTL for the feed. Defaults to 300 seconds.
- **Web app configuration**
  - `VITE_MAILCHIMP_MANAGE_URL` (optional) — Direct link to your Mailchimp dashboard. Used by the admin panel “Open Mailchimp” buttons. Falls back to `https://login.mailchimp.com/` when omitted.

Admin users can visit `/admin/content/newsletters` to:

- Browse Mailchimp-sourced campaigns with search and quick links to the public page or Mailchimp archive.
- Trigger a manual “Sync Latest” to bypass the cache after updating a campaign in Mailchimp.
- Follow the guided workflow (at `/admin/content/newsletters/create` or `/:id/edit`) explaining that authoring happens in Mailchimp while the React app stays in sync via the RSS feed.
