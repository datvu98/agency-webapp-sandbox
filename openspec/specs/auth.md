# Auth

## Overview
JWT-based authentication for agency and fulfillment users.

## Capabilities
- Login with email + password → receives `accessToken` + `refresh_token` stored in `localStorage`
- Forgot password flow → request reset email
- Change password via reset link (`/auth/change-password`)
- Token refresh: Apollo error link intercepts `Authentication hook unauthorized` → calls `agencyRefreshToken` mutation; on failure redirects to `/login`
- Axios interceptor mirrors same refresh-then-retry logic for REST calls

## Pages
| Page | Path |
|------|------|
| `LoginPage` | `/login` |
| `ForgotPassword` | `/forgot-password` |
| `ChangePassword` | `/auth/change-password` |

## State
- `src/app/slice/` — global slice holds `user`, `accessToken`, `inited` flag
- `inited` gates rendering until session is resolved (prevents flash-of-unauthenticated)

## Route Guard
`<AuthenRoute>` wraps all protected routes; unauthenticated users are redirected to `/login`.

## Open Questions
- [ ] Refresh token rotation: is there a max TTL on `refresh_token`?
- [ ] Multi-tab logout: when one tab expires, are other tabs notified?
