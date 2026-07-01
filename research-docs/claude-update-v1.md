# CLAUDE.md — UpS Design Sandbox

This file is the **source of truth for all code generation in this repository.** The sandbox is the proving ground for the UpS Design System migration and CSS refactor planned for `sme-webapp`. All patterns validated here will be promoted directly to production. When generating code that deviates from any rule here: flag the deviation explicitly, ask whether to update the rule or follow it strictly, and never silently deviate.

## Purpose

Design sandbox for the UpS Design System migration. Engineers review AI-generated components here — components that demonstrate the target 3-layer CSS architecture — before promoting them to the production codebase. The sandbox targets **70–80% direct code reuse**.

## Stack

React 19 · TypeScript · Vite · Ant Design 6.x · `antd-style` · Tailwind CSS (`tw-` prefix) · `@tabler/icons-react`

> `antd-style` and Tailwind v3 are installed. Do not use Tailwind color utilities (`tw-bg-primary`, `tw-text-*`, etc.) — those values in `tailwind.config.js` are legacy and conflict with UpS tokens. Layer 1 (Tailwind) carries layout geometry only.

## Commands

```bash
npm run dev       # start dev server with HMR
npm run build     # tsc type-check then vite build
npm run lint      # eslint
npm run preview   # preview production build locally
```

## Project skills

All skills (slash commands) for this project live in `.claude/skills/`. Do not create project-specific skills in `~/.claude/commands/`.

---

## REQUIRED: Use Ant Design Components Only

- ALWAYS use Ant Design components: `Button`, `Select`, `Input`, `Table`, `Tag`, `Segmented`, `Skeleton`, `Tooltip`, `Dropdown`, `Modal`, `Form`, etc.
- NEVER use raw HTML elements (`<button>`, `<input>`, `<select>`) when an antd equivalent exists
- NEVER add `className` or `style` for visual styling on antd components — the token cascade handles all states automatically
- NEVER write CSS targeting antd component class internals (`.ant-btn`, `.ant-table-cell`). Fix visual issues in `theme.components` inside `ThemeContext.tsx`

> The sandbox has no project adapters. Import directly from `antd`. In `sme-webapp` production, adapters in `src/ui/common/antd-adapters/` bridge legacy call sites — when generating code intended for promotion, note where an adapter would wrap the component.

---

## REQUIRED: Three-Layer CSS Architecture

Strict layer ownership. NEVER mix concerns across layers.

```
┌──────────────────────────────────────────────────────────────────┐
│  LAYER 1 — Tailwind (tw-* prefix)                                │
│  Layout and geometry ONLY                                        │
│  tw-flex  tw-grid  tw-gap-4  tw-overflow-hidden  tw-w-full      │
│  NO colors. NO token values. Structure only.                     │
├──────────────────────────────────────────────────────────────────┤
│  LAYER 2 — antd-style createStyles  (.style.ts co-located)      │
│  ALL token-aware visual values on custom elements                │
│  Colors · hover · active · pseudo-elements · breakpoints         │
│  token.colorXxx  — live, TypeScript-autocompleted                │
├──────────────────────────────────────────────────────────────────┤
│  LAYER 3 — CSS Modules  (.module.css co-located)                 │
│  Structural selectors CSS-in-JS cannot express cleanly           │
│  :nth-child · print · :global(.ant-*) · sticky                  │
│  Reference tokens via var(--ant-*) inside CSS                    │
└──────────────────────────────────────────────────────────────────┘
```

| Concern | Correct layer | Example |
|---|---|---|
| Flex, grid, overflow, position, width | Layer 1 — Tailwind | `tw-flex tw-gap-4 tw-overflow-hidden` |
| Colors, spacing, radius, shadows | Layer 2 — createStyles | `background: token.colorBgContainer` |
| Hover / active / focus | Layer 2 — createStyles | `'&:hover': { borderColor: token.colorPrimary }` |
| Pseudo-elements | Layer 2 — createStyles | `'&::after': { background: token.colorSplit }` |
| Prop-driven / conditional styles | Layer 2 — createStyles | `color: isActive ? token.colorPrimary : token.colorText` |
| Token-based `@media` | Layer 2 — createStyles | `` `@media (max-width: ${token.screenSM}px)` `` |
| nth-child, zebra rows, print | Layer 3 — CSS Modules | `.row:nth-child(even) { ... }` |
| Antd class overrides | Layer 3 — CSS Modules | `.wrap :global(.ant-tabs-tab) { ... }` |
| Antd component visual tweak | `theme.components` in ThemeContext | Never in JSX or CSS files |

### ✓ CORRECT — createStyles (Layer 2)

```tsx
// MyComponent.style.ts
import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ token }) => ({
  card: {
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    '&:hover': { borderColor: token.colorBorder },
  },
  title: {
    color: token.colorText,
    fontSize: token.fontSize,
    fontWeight: token.fontWeightStrong,
  },
  meta: {
    color: token.colorTextTertiary,
    fontSize: token.fontSizeSM,
  },
}));

// MyComponent.tsx — Tailwind for layout, createStyles for visual
const { styles } = useStyles();
return (
  <div className={`tw-flex tw-flex-col tw-gap-3 ${styles.card}`}>
    <div className="tw-flex tw-items-center tw-justify-between">
      <span className={styles.title}>Order #1234</span>
      <span className={styles.meta}>2 giờ trước</span>
    </div>
  </div>
);
```

### ✗ WRONG

```tsx
// Wrong — hardcoded values in style prop
<div style={{ background: '#ffffff', borderRadius: 8, padding: 24 }}>

// Wrong — hover via JS event handlers
onMouseEnter={() => setHovered(true)}
style={{ borderColor: hovered ? '#e65018' : '#edeef0' }}

// Wrong — Tailwind color classes
<div className="tw-bg-primary tw-text-white tw-rounded-lg">

// Wrong — visual className or style prop on antd component
<Button className="my-custom-btn" style={{ background: '#e65018' }}>
```

### ✓ CORRECT — CSS Modules (Layer 3, structural selectors only)

```css
/* MyComponent.module.css */
.row:nth-child(even) { background: var(--ant-color-fill-quaternary); }
.stickyCol { position: sticky; left: 0; z-index: 1; }
.tabs :global(.ant-tabs-nav) { margin-bottom: 0; }
@media print { .actionsCol { display: none; } }
```

---

## REQUIRED: ThemeContext — Token Setup

`src/contexts/ThemeContext.tsx` is **the only theming file**. `cssVar: { prefix: 'ant' }` MUST be present. Without it, no `--ant-*` CSS variables are emitted and nothing in Layer 3 works.

```tsx
// src/contexts/ThemeContext.tsx — THE ONLY FILE that may contain hex values
import { ConfigProvider } from 'antd'

const upsTheme = {
  token: {
    colorPrimary:         '#e65018',
    colorText:            '#0f1215',
    colorTextSecondary:   '#404246',
    colorTextTertiary:    '#707274',
    colorTextQuaternary:  '#9d9ea1',
    colorBgLayout:        '#f3f5f8',
    colorBgContainer:     '#ffffff',
    colorBgElevated:      '#ffffff',
    colorBorder:          '#d5d7db',
    colorBorderSecondary: '#edeef0',
    colorSuccess:         '#007d00',
    colorWarning:         '#a44300',
    colorError:           '#e74850',
    colorInfo:            '#2456d3',
    fontFamily:           'Roboto, Helvetica, sans-serif',
    fontSize:             14,
    borderRadius:         6,
  },
  components: {
    Button: { controlHeight: 36, fontWeight: 500 },
  },
}

export function ThemeProvider({ children }) {
  return (
    <ConfigProvider theme={{ ...upsTheme, cssVar: { prefix: 'ant' } }}>
      {children}
    </ConfigProvider>
  )
}
```

> ⚠️ `cssVar: true` is Ant Design **v5** syntax — it does nothing in v6. Always use `cssVar: { prefix: 'ant' }`.

---

## REQUIRED: Token Reference

Token names, hex values, CSS variables, and per-component visual intent are in `DESIGN.md` — read it when a specific value is needed. Rules here are non-negotiable regardless of value.

- In `createStyles`: `token.colorPrimary`, `token.colorBgContainer`, `token.paddingLG`, `token.borderRadiusLG`, etc.
- In CSS Modules: `var(--ant-color-primary)`, `var(--ant-color-bg-container)`, `var(--ant-border-radius-lg)`, etc.
- NEVER hardcode hex, px radius, or px spacing values in feature files.
- `token.fontWeightStrong` (600) is the only weight token. Normal weight is CSS default (400).
- `token.padding` (16px) is the base spacing unit. `token.paddingMD` is 20px — not used in UpS.
- Ant v6 has no `borderRadiusMD`. Use `borderRadiusSM` (4) / `borderRadius` (6) / `borderRadiusLG` (8).

---

## REQUIRED: Icons — Tabler Only

- ALWAYS use `@tabler/icons-react`
- NEVER import from `@ant-design/icons`
- Sizes: **14px** in forms/inputs, **16px** in toolbars/actions
- Color: `token.colorTextTertiary` in `createStyles`, or `var(--ant-color-text-tertiary)` in CSS Modules
- Every antd `Select` MUST set `suffixIcon={<IconChevronDown size={14} />}`

```tsx
// ✓ CORRECT
import { IconChevronDown, IconSearch } from '@tabler/icons-react'
<Select suffixIcon={<IconChevronDown size={14} />} />

// ✗ WRONG
import { DownOutlined } from '@ant-design/icons'
```

---

## REQUIRED: Component Patterns

### Section card
```tsx
// createStyles
card: {
  background: token.colorBgContainer,
  border: `1px solid ${token.colorBorderSecondary}`,
  borderRadius: token.borderRadiusLG,
  boxShadow: token.boxShadowTertiary,
  padding: token.paddingLG,
  marginBottom: token.margin,
}
```

### Button hierarchy — ALWAYS one primary per view
```tsx
// ✓ CORRECT — text → default → primary
<Button type="text">Huỷ</Button>
<Button type="default">Lưu nháp</Button>
<Button type="primary">Xác nhận</Button>

// ✗ WRONG — two primary in same action group
<Button type="primary">Lưu nháp</Button>
<Button type="primary">Xác nhận</Button>
```

### Status badges — antd Tag with semantic color prop
```tsx
// ✓ CORRECT
<Tag color="success">Hoàn thành</Tag>
<Tag color="warning">Chờ xử lý</Tag>
<Tag color="error">Đã huỷ</Tag>
<Tag color="processing">Đang giao</Tag>
<Tag color="default">Nháp</Tag>

// ✗ WRONG
<span style={{ backgroundColor: '#d9f7be' }}>Hoàn thành</span>
```

### Small option toggles — Segmented, not ad-hoc buttons
```tsx
<Segmented
  value={noteType}
  onChange={setNoteType}
  options={[{ label: 'Nội bộ', value: 'internal' }, { label: 'Khách hàng', value: 'customer' }]}
/>
```

### Radio.Group in flex filter rows
```tsx
<Radio.Group style={{ whiteSpace: 'nowrap' }} value={filter} onChange={onChange}>
```

### Page layout
- Background: `token.colorBgLayout` (`#f3f5f8`), max-width **1440px**, centered
- Two-column create/edit: main `flex: 1` + sidebar `flex: 0 0 280px`, gap `token.paddingLG`
- Sticky action bar: surface bg · `border-top: 1px solid ${token.colorBorderSecondary}` · padding `12px 24px` · scroll container `paddingBottom ≥ 64px`

---

## REQUIRED: Responsive Design

- ALWAYS use Ant Design breakpoints — never define custom `px` breakpoints
- Use `createStyles` with `token.screenXxx` for token-based `@media` queries
- Use antd `Grid` (`Row` / `Col`) or `Flex` for responsive layout composition

```tsx
export const useStyles = createStyles(({ token }) => ({
  layout: {
    display: 'flex',
    gap: token.paddingLG,
    [`@media (max-width: ${token.screenMD}px)`]: {
      flexDirection: 'column',
      gap: token.padding,
    },
  },
}));
```

---

## FORBIDDEN — Never Do These

```tsx
// ✗ Hardcoded hex or px values outside ThemeContext
style={{ color: '#e65018' }}
style={{ background: '#f3f5f8', borderRadius: '8px', padding: '24px' }}

// ✗ Hover / active state via JS event handlers
onMouseEnter={() => setState({ borderColor: '#e65018' })}

// ✗ @ant-design/icons
import { DownOutlined } from '@ant-design/icons'

// ✗ cssVar: true — v5 syntax, no-op in v6
<ConfigProvider theme={{ cssVar: true, token: { ... } }}>

// ✗ theme.useToken() for styling (use createStyles instead)
const { token } = theme.useToken()
<div style={{ color: token.colorText }}>

// ✗ Tailwind color/token utility classes
className="tw-bg-primary tw-text-white tw-border-gray-200"

// ✗ Visual style prop or className on antd components
<Button style={{ background: '#e65018', height: 36 }}>

// ✗ Global antd reset CSS
import 'antd/dist/reset.css'

// ✗ Multiple primary buttons in same action group
<Button type="primary">Action A</Button>
<Button type="primary">Action B</Button>

// ✗ Duplicating brand tokens in feature files
const PRIMARY_COLOR = '#e65018'
```

---

## Adapter anti-pattern — hardcoded inline style + JS hover

A common broken pattern from before the migration. Never reproduce it:

```tsx
// ✗ WRONG — inline style overrides antd token, JS hover instead of CSS
<Button
  style={{ backgroundColor: '#FF5629' }}
  onMouseEnter={(e) => Object.assign(e.currentTarget.style, { backgroundColor: '#D93B18' })}
  className="tw-bg-primary tw-text-white"
/>

// ✓ CORRECT — let antd type prop own all visual states
<Button type="primary" className={sizeClasses} />  {/* sizeClasses = layout only */}
```

---

## NEVER Touch During Style Migration

When migrating an existing component, ONLY change:
- Import statements (add `createStyles`, `antd-style`, antd components)
- Style definitions (replace inline/CSS values with token references)
- CSS class applications (replace `style={}` with `className={styles.x}`)
- Visual markup (replace legacy HTML elements with antd equivalents)

NEVER touch during migrations:
- Conditional logic, data processing (`map`, `filter`, `sort`)
- Component structure and behaviour (props, state, `useEffect`)
- Event handlers (`onClick`, `onChange`, `onSubmit`)
- GraphQL / Redux / Formik / API logic
- `key` props, `ref` assignments

---

## REQUIRED: Pattern Consistency Protocol

When implementing ANY UI pattern — tables, filters, badges, forms, toolbars, modals:

1. **Search for existing implementations first** — grep for the same pattern in other modules
2. **Follow the established pattern exactly** — same token references, same layer, same component choices
3. **Never improvise a new pattern** when an existing one covers the use case

---

## Folder structure

```
src/
├── app/modules/          ← all feature UI; mirrors sme-webapp src/app/modules/
│   ├── Order/
│   ├── Products/
│   ├── Ads/
│   ├── Report/
│   ├── Finance/
│   ├── Marketing/
│   └── CustomerService/
│       ├── components/
│       ├── hooks/
│       ├── types/
│       └── utils/
├── components/           ← shared UI used by 2+ modules
├── hooks/                ← shared hooks only
├── layouts/              ← sandbox navigation (not promoted to production)
│   ├── AppLayout.tsx
│   ├── AppSider.tsx
│   └── navConfig.tsx     ← add new modules here
├── contexts/
│   └── ThemeContext.tsx  ← ConfigProvider with UpS theme tokens
├── mock-data/            ← mock API responses; shapes mirror real sme-webapp data
└── assets/
```

## Placement rules

| What | Where |
|---|---|
| Feature component | `src/app/modules/[Module]/components/` |
| Co-located styles | `src/app/modules/[Module]/components/[Component].style.ts` |
| Co-located CSS Module | `src/app/modules/[Module]/components/[Component].module.css` |
| Feature hook | `src/app/modules/[Module]/hooks/` |
| TypeScript types | `src/app/modules/[Module]/types/` |
| Shared across 2+ modules | `src/components/` or `src/hooks/` |
| Mock data | `src/mock-data/[module].ts` |

- Never create `src/pages/` — navigation lives in `src/layouts/navConfig.tsx`
- No cross-module imports
- Never fetch data inside components — receive via props or `mock-data/`
- Never invent prop names — use types from the module's `types/index.ts`
- No hardcoded mock data inside components

## Screen capture workflow

When given a screenshot:

1. Identify the module from context
2. Break the screen into distinct UI regions — one component per region
3. Create a top-level `[ScreenName]Page.tsx` that composes the regions
4. Place all files in `src/app/modules/[Module]/components/`
5. Never put everything in one file
6. Name components after what they represent, not where they appear — `OrderTable` not `OrderListTable`
7. Each component must be independently extractable without dependencies on sibling components