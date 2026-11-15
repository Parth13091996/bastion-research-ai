# Published release restoration

The changes published during October–November 2026 were consolidated in PR #22. Earlier releases were deployed manually while several stacked and parallel PRs remained unmerged. Deploying the old main branch therefore removed published frontend features.

## Production build

Build the consolidated source with the production API origin explicitly set:

```sh
cd apps/web
VITE_API_BASE_URL=https://dev-api.bastionresearch.in pnpm build
```

`VITE_API_BASE_URL` is a public frontend setting. It is compiled into the assets. Omitting it makes Axios send requests to the static website and can return HTML where the application expects JSON. Before publishing, verify the compiled main bundle contains the intended API origin and confirm the membership-plan API returns an array.

Use a new Vite `assetsDir` for each manual release. Preserve the current production favicon and tracking markup. Upload and verify assets before switching `index.html` and its gzip counterpart. Keep the preceding frontend backup outside `public_html` for rollback. Do not delete existing assets during activation.

## Scope

The consolidated source includes candidate search/job filters, Ex-Core display, configurable renewal reminders, sheet-backed dashboard totals/XIRR/methodology, the revised CORE landing page, premium access and introductory-plan purchase restrictions, navigation/login fixes, newest-first recommendations and the card/table toggle.

Member Insights remains a preview and is not a deployed analytics system. Do not treat the Ex-Core display classification as a database job that rewrites stored roles.

## Preserve production data and backend configuration

Keep subscription dates, payment history, private research storage and saved reminder campaign settings. Never replace production secrets with `.env.example`. Frontend restoration does not require resetting the database, replaying payment webhooks, sending test client messages or repeating the research-document migration.

## Verification

Run the frontend production build and the premium-access, renewal-reminder, portfolio/methodology and scoped CSS regression tests. After activation check the member dashboard, methodology popup, recommendation cards/table, member filters, candidate filters, admin reminder settings and CORE landing page. Check API origin, actual login/session handling and premium access separately from a successful static build.
