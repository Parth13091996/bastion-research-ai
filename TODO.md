# IPO User Dashboard Route Integration

## Steps to Complete

- [ ] Update `apps/web/src/pages/IpoUserDashboardPage/index.tsx`: Remove ReactDOM.render and default export the `IpoUserDashboard` component for lazy loading.
- [ ] Update `apps/web/src/routes/app-routes.ts`: Add `ipoUserDashboard: () => "/user/app/ipo-dashboard"` to the AppRoutes object.
- [ ] Update `apps/web/src/routes/index.tsx`: Add lazy import for `IpoUserDashboardPage` and add the route `{ path: "app/ipo-dashboard", element: <IpoUserDashboardPage /> }` under the protected user routes (inside UserAdminRoute children).
- [ ] Test: Run dev server, navigate to `/user/app/ipo-dashboard` (ensure logged in), verify page loads correctly.

## Followup
- Verify no errors in console.
- If auth issues, check AuthContext integration.
