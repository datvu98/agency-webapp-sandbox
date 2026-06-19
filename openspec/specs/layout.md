# Layout & Routing

## Overview
App shell, top-level routing, and user-type-based navigation branching.

## Capabilities
- `<MainLayout>` — app shell with sidebar navigation, header, outlet
- Route branching by `user.category_code`:
  - `fulfillment` → warehouse-centric routes only (no chat, settlement, fulfillment ops, report, settings)
  - default (agency) → full route set
- Loadable pattern: all heavy page modules use `React.lazy` via a `Loadable.ts` wrapper for code splitting
- `<AuthenRoute>` — wraps all private routes; redirects unauthenticated users to `/login`
- `<ChannelPage>` — channel-level routing or context (TBD)

## Structure
```
src/app/
├── index.tsx           ← top-level route definitions
├── pages/MainLayout/   ← app shell, sidebar, layout slots
├── pages/ChannelPage/  ← channel context wrapper
└── slice/              ← global Redux slice (user, token, inited)
```

## Key Invariants
- `inited` flag in global slice must be `true` before any protected route renders — prevents auth flash
- `user.category_code` is evaluated once at `MainLayout` mount; changing it requires re-login

## Open Questions
- [ ] `ChannelPage`: is this a multi-tenant channel selector or a specific feature page?
- [ ] Sidebar navigation items: are they role-driven from backend permissions or hardcoded by `category_code`?
