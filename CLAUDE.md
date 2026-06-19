# CLAUDE.md

## Role

**Agency Web App** — React SPA for the Upbase agency portal. Serves agency operators and fulfillment providers with warehouse management, order fulfillment, settlements, reporting, and customer chat.

| User type | Key flows |
|-----------|-----------|
| Agency operator | Chat with customers, fulfillment ops, settlement exports, reports |
| Fulfillment provider | Warehouse management (inbound/outbound), packing, processing, billing |

## Commands

```bash
# Development
yarn start              # CRA dev server (port 3000 by default)

# Build & preview
yarn build              # Production build → build/
yarn start:prod         # Build then serve

# Quality
yarn lint               # ESLint on src/
yarn lint:fix           # ESLint with auto-fix
yarn prettify           # Prettier write

# Tests
yarn test               # Jest (watch mode)
yarn test:generators    # Plop generator tests

# i18n
yarn extract-messages   # Scan + update translation keys

# Code generation
yarn generate           # Plop interactive generator (components, pages, etc.)
```

## Architecture

### Stack

| Layer | Library |
|-------|---------|
| UI | React 18, Ant Design 5, styled-components 5 |
| State | Redux Toolkit + Redux-Saga + redux-injectors (dynamic reducers) |
| API (queries/mutations) | Apollo Client 3 (`@apollo/client`) |
| API (REST) | Axios with JWT interceptors |
| Realtime | Socket.io-client 4 + Apollo WebSocket subscriptions |
| Routing | react-router-dom v6 |
| i18n | i18next + react-i18next (Vietnamese locale default) |
| Auth | JWT stored in `localStorage` (`accessToken`, `refresh_token`) |

### Entry point & routing

`src/index.tsx` bootstraps Redux store, Apollo client, Ant Design config (primary color `#ff5629`, `vi_VN` locale), then mounts `<App />`.

`src/app/index.tsx` owns top-level routes:
- `/login`, `/forgot-password`, `/auth/change-password` — public
- `/*` — protected via `<AuthenRoute>`, renders `<MainLayout>`

`<MainLayout>` splits routes by `user.category_code`:
- `fulfillment` users → warehouse-centric routes only
- default (agency) users → full route set including chat, fulfillment ops, settlements

### Page modules (`src/app/pages/`)

| Module | Path | Description |
|--------|------|-------------|
| `LoginPage` | `/login` | JWT login |
| `ForgotPassword` | `/forgot-password`, `/auth/change-password` | Password reset |
| `ChatPage` | `/chats` | Customer chat (Socket.io, wrapped in `SocketProvider`) |
| `Fullfillment` | `/fullfillment-manage/*` | Fulfillment operation & report |
| `Settlement` | `/settlement-manage/*` | Settlement export (pending / processed) |
| `WarehouseManagement` | `/warehouse-manage/*`, `/inbound-manage/*`, `/outbound-manage/*` | WMS — locations, stock, packing, processing, bills |
| `Report` | `/report/*` | Analytics & report overview |
| `Setting` | `/settings/*` | SME management, sub-users, partners, commissions, contracts |
| `Campaigns` | `/campaigns/*` | Campaign management |

### State management

- **Global slice** (`src/app/slice/`) — user session, token, `inited` flag
- **Per-page slices** injected dynamically via `redux-injectors`
- **Sagas** co-located with their slice

### Apollo / GraphQL

`src/apollo/index.js` — single client with:
- HTTP link → `REACT_APP_GRAPHQL_ENDPOINT`
- WebSocket link → `REACT_APP_GRAPHQL_WS_ENDPOINT` (subscriptions via `subscriptions-transport-ws`)
- Auth link injects `Authorization: Bearer <token>` header
- Error link handles `Authentication hook unauthorized` → auto-refresh via `agencyRefreshToken` mutation; on failure redirects to `/login`

All GQL documents live in `src/graphql/queries/` and `src/graphql/mutations/`.

### Axios (REST)

`src/setupAxios.ts` — request interceptor attaches Bearer token; response interceptor retries on 401/403 after token refresh, then redirects to `/login`.

### Environment variables

| Variable | Purpose |
|----------|---------|
| `REACT_APP_GRAPHQL_ENDPOINT` | GraphQL HTTP endpoint |
| `REACT_APP_GRAPHQL_WS_ENDPOINT` | GraphQL WebSocket endpoint |
| `REACT_APP_CHATTING_SOCKET_URL` | Socket.io server URL |
| `REACT_APP_MODE` | `STAG` / `PROD` |

Local dev: `.env` in repo root already contains defaults pointing to `localhost:3040`.

### Deployment

- `Dockerfile` / `Dockerfile.k8s` — build → nginx serve
- `nginx/nginx.conf` — SPA routing (`try_files $uri /index.html`)
- `docker-compose.yaml` — exposes port `3019:80`

## Behavioral Guidelines

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## Code Standards

- **TypeScript** — `strict: true`; `baseUrl: ./src` (bare imports from `src/` root, e.g. `import foo from 'app/...'`) — no path aliases
- **Component files**: `PascalCase.tsx`; keep components small; co-locate slice/saga in a `slice/` subfolder next to the page
- **Loadable pattern**: heavy pages export a `Loadable.ts` using `React.lazy` for code splitting
- **Contexts**: cross-cutting concerns (socket, report, settlement, fulfillment) use React Context providers in `src/app/contexts/`
- **Styles**: styled-components for layout; Ant Design for UI primitives; `.styles.ts` files alongside components
- **i18n**: Vietnamese is the primary language; all user-facing strings go through `i18next` — run `yarn extract-messages` after adding keys
- **No console.log in production**: `index.tsx` strips `console.log` when `NODE_ENV === 'production'`
- **Lint on commit**: `lint-staged` runs ESLint fix on `*.ts,tsx,js,jsx` and Prettier on `*.md,json`
