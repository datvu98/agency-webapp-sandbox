# This file configures AI assistants to follow Agency Web App design system standards

You are working on a project that uses the Agency Web App design theme built on Ant Design 5 and antd-style.
Follow these rules STRICTLY when generating or modifying code.

When deviating from any rule here: flag the deviation explicitly, ask whether to update the rule or follow it strictly, and never silently deviate.

> Design tokens, color palette, typography scale, spacing, and component patterns: **[DESIGN.md](DESIGN.md)**

## Purpose

Design sandbox for the Agency Web App. Engineers validate component patterns, token usage, and layout conventions here before applying them to production. Focus is exclusively on **visual and design system correctness** — components, tokens, spacing, typography, icons.

Existing code in this repository may not follow these rules — it predates this design system. **Do not use existing components as a style reference.** These rules are the reference. If an existing pattern conflicts with a rule here, follow the rule.

## Stack

React 18 · TypeScript · CRA · Ant Design 5 · antd-style · styled-components 5 · @ant-design/icons · @ant-design/plots 2.1

## Commands

```bash
yarn start       # CRA dev server (port 3000)
yarn build       # production build → build/
yarn lint        # ESLint on src/
yarn lint:fix    # ESLint with auto-fix
```

## Project skills

All skills (slash commands) for this project live in `.claude/skills/`. Do not create project-specific skills in `~/.claude/commands/`.

---

## REQUIRED: Use Ant Design Components Only

- ALWAYS use Ant Design components: `Button`, `Select`, `Input`, `Table`, `Tag`, `Segmented`, `Skeleton`, `Tooltip`, `Dropdown`, `Modal`, `Form`, etc.
- NEVER use raw HTML elements (`<button>`, `<input>`, `<select>`) when an antd equivalent exists
- NEVER add `style={{}}` or `className` for visual styling directly on antd components — the token cascade handles all visual states automatically
- NEVER target `.ant-*` class internals in `createStyles`. Fix antd component appearance via `theme.components` inside `src/index.tsx`

```tsx
// ✓ CORRECT
<Button type="primary">Xác nhận</Button>
<Input placeholder="Tìm kiếm..." />
<Select options={options} />

// ✗ WRONG
<button onClick={...}>Xác nhận</button>
<input placeholder="Tìm kiếm..." />
<Button style={{ background: '#ff5629' }}>Xác nhận</Button>
```

---

## REQUIRED: Styling — createStyles

All custom element styling uses `createStyles` from `antd-style`, co-located in a `.styles.ts` file. This gives direct typed access to the full token set — no prop threading, no hardcoded values.

```tsx
// MyComponent.styles.ts
import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ token }) => ({
  card: {
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    padding: token.paddingLG,
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

// MyComponent.tsx
const { styles } = useStyles();
return (
  <div className={styles.card}>
    <span className={styles.title}>Tên đơn hàng</span>
    <span className={styles.meta}>2 giờ trước</span>
  </div>
);
```

**Decision rule:**
| Need | What to do |
|---|---|
| Custom element needs visual styling | `createStyles` in `[Component].styles.ts` |
| Antd component visual tweak | `theme.components` in `src/index.tsx` |
| Layout-only geometry (width, flex, overflow) with no visual style | `style={{}}` one-liner is acceptable |

### ✗ WRONG

```tsx
// Wrong — inline style even with token values
const { token } = theme.useToken();
<div style={{ background: token.colorBgContainer, borderRadius: 8 }}>

// Wrong — hardcoded values in style prop
<div style={{ background: '#ffffff', borderRadius: 8, padding: 24 }}>

// Wrong — hardcoded values in styled-components
export const Card = styled.div`
  background: #ffffff;
  border: 1px solid #edeef0;
`;

// Wrong — hover via JS event handlers
onMouseEnter={() => setHovered(true)}
style={{ borderColor: hovered ? '#ff5629' : '#edeef0' }}
```

---

## REQUIRED: Token Setup

`src/index.tsx` is **the only file that may contain hex color values.** Brand tokens are defined once in `ConfigProvider` with `cssVar: { prefix: 'ant' }` enabled — this emits all tokens as `--ant-*` CSS custom properties, which CSS Modules can reference.

```tsx
// src/index.tsx — THE ONLY FILE with hex values
<ConfigProvider
  theme={{
    cssVar: { prefix: 'ant' },
    token: {
      colorPrimary: '#ff5629',
      // additional brand tokens defined here
    }
  }}
>
```

When a component needs a token: use `createStyles(({ token }) => ...)` — never call `theme.useToken()` for styling.

```tsx
// ✓ CORRECT
export const useStyles = createStyles(({ token }) => ({
  badge: { color: token.colorSuccess },
}));

// ✗ WRONG — theme.useToken() for styling
const { token } = theme.useToken();
<span style={{ color: token.colorSuccess }}>

// ✗ WRONG — duplicating brand tokens
const PRIMARY = '#ff5629';
```

---

## REQUIRED: Token Reference

Common tokens — read `src/index.tsx` for the full defined set. Use these names inside `createStyles`.

| Intent | Token |
|---|---|
| Page background | `token.colorBgLayout` |
| Card / surface | `token.colorBgContainer` |
| Primary text | `token.colorText` |
| Secondary text | `token.colorTextSecondary` |
| Placeholder / hint | `token.colorTextTertiary` |
| Border (strong) | `token.colorBorder` |
| Border (subtle) | `token.colorBorderSecondary` |
| Brand / CTA | `token.colorPrimary` |
| Base spacing | `token.padding` (16px) |
| Large spacing | `token.paddingLG` (24px) |
| Small spacing | `token.paddingSM` (12px) |
| Base radius | `token.borderRadius` |
| Large radius | `token.borderRadiusLG` |
| Normal font weight | CSS default (400) — no token |
| Strong font weight | `token.fontWeightStrong` (600) |
| Small font size | `token.fontSizeSM` |

In CSS Modules, reference the same values via CSS variables: `var(--ant-color-bg-container)`, `var(--ant-border-radius-lg)`, etc.

---

## REQUIRED: Icons

- ALWAYS use `@ant-design/icons`
- Sizes: **14px** in forms/inputs, **16px** in toolbars/actions
- Color: set via `createStyles` using `token.colorTextTertiary` — never hardcode icon colors

```tsx
// ✓ CORRECT
import { SearchOutlined } from '@ant-design/icons';
export const useStyles = createStyles(({ token }) => ({
  icon: { fontSize: 16, color: token.colorTextTertiary },
}));
const { styles } = useStyles();
<SearchOutlined className={styles.icon} />

// ✗ WRONG — hardcoded color
<SearchOutlined style={{ color: '#8c8c8c' }} />
```

---

## REQUIRED: Component Patterns

### Section card

```tsx
// SectionCard.styles.ts
export const useStyles = createStyles(({ token }) => ({
  card: {
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
    padding: token.paddingLG,
    marginBottom: token.margin,
  },
}));
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
<span style={{ backgroundColor: '#d9f7be', padding: '2px 8px' }}>Hoàn thành</span>
```

### Small option toggles — Segmented, not ad-hoc buttons

```tsx
<Segmented
  value={tab}
  onChange={setTab}
  options={[{ label: 'Nội bộ', value: 'internal' }, { label: 'Khách hàng', value: 'customer' }]}
/>
```

### Page layout

- Background: `token.colorBgLayout`, max-width **1440px**, centered
- Two-column layout: main `flex: 1` + sidebar `flex: 0 0 280px`, gap `token.paddingLG`
- Sticky action bar: surface bg · `border-top: 1px solid ${token.colorBorderSecondary}` · padding `12px 24px`

---

## REQUIRED: Antd Component Internal Overrides

When a component needs to override antd Table rows, inputs, or other internal states, use the approved patterns below — never target `.ant-*` classes in `createStyles`.

### Row background colors → `onRow` callback

```tsx
const { token } = theme.useToken();  // onRow is data-driven, not styling — useToken is ok here

<Table
  onRow={(record) => ({
    style: {
      background: record.isParent
        ? token.colorFillQuaternary
        : token.colorBgContainer,
    },
  })}
/>
```

### Semantic row states → `rowClassName` + own-class in createStyles

```tsx
// Table usage
<Table rowClassName={(record) => record.isParent ? 'row-parent' : ''} />

// TableWrapper.styles.ts — targeting OUR class, not .ant-*
export const useStyles = createStyles(({ token }) => ({
  table: {
    '.row-parent > td': {
      background: `${token.colorFillQuaternary} !important`,
    },
  },
}));

const { styles } = useStyles();
<div className={styles.table}><Table ... /></div>
```

### Structural display overrides → CSS Module with `:global`

For `display: none`, `padding: 0`, `nth-child` — things callbacks cannot express:

```css
/* CampaignTable.module.css */
.wrap :global(.ant-table-row-expand-icon-cell) {
  display: none !important;
  width: 0 !important;
}
.row:nth-child(even) { background: var(--ant-color-fill-quaternary); }
```

---

## REQUIRED: Pattern Consistency Protocol

When implementing ANY UI pattern — tables, filters, badges, forms, toolbars, modals:

1. **Search for existing `createStyles` implementations first** — grep for the same pattern in other modules
2. **Follow the established pattern exactly** — same token references, same `createStyles` structure
3. **Never improvise a new pattern** when an existing one covers the use case
4. **Legacy code is not a reference** — if the existing file uses `styled-components`, inline `style={{}}`, or `className` on antd components, it predates this design system. Discard it as a reference entirely and build from these rules only.

## REQUIRED: New Component Pre-flight Checklist

Before writing any new component file, verify every point:

- [ ] All visual properties (color, border, radius, shadow, spacing, typography) go through `createStyles` with token values
- [ ] No `className` or `style={{}}` for visual styling on antd components
- [ ] No hardcoded px numbers or hex values — token values only
- [ ] Layout-only geometry (width, flex, overflow) may use `style={{}}` one-liners — nothing else
- [ ] Sidebar width is exactly 280px per DESIGN.md two-column spec
- [ ] Empty states use `<Empty>` — no component renders blank when data is missing
- [ ] Reference is CLAUDE.md and DESIGN.md — not the file being replaced or extended

---

## FORBIDDEN — Never Do These

```tsx
// ✗ Hardcoded hex or px values outside src/index.tsx
style={{ color: '#ff5629' }}
const PRIMARY = '#ff5629';
background: '#ffffff'; // inside createStyles

// ✗ theme.useToken() for styling
const { token } = theme.useToken();
<div style={{ color: token.colorText }}>

// ✗ Inline style={{}} for visual properties (colors, borders, radius, shadows)
<div style={{ background: token.colorBgContainer, borderRadius: 8 }}>

// ✗ Visual style or className on antd components
<Button style={{ backgroundColor: '#ff5629', height: 40 }}>
<Input className="my-custom-input" />

// ✗ Hover / active state via JS event handlers
onMouseEnter={() => setHovered(true)}
style={{ borderColor: hovered ? '#ff5629' : '#edeef0' }}

// ✗ Targeting .ant-* internals in createStyles
export const useStyles = createStyles(() => ({
  wrap: { '.ant-btn': { background: 'red' } },
}));

// ✗ Multiple primary buttons in same action group
<Button type="primary">Lưu</Button>
<Button type="primary">Gửi</Button>
```

---

## Logic Boundary — Don't Touch

This sandbox validates design and component patterns only. The following are out of scope:

**Never modify:** routing, Redux slices/sagas, Apollo queries/mutations, Axios setup, Socket.io, auth logic, i18n keys, GraphQL documents.

If a design task appears to require changing any of these, stop and ask — the task is likely scoped incorrectly.

---

## Folder Structure

```
src/
├── app/pages/        ← feature pages
│   └── [Module]/
│       ├── components/   ← feature components + .styles.ts
│       └── slice/        ← Redux logic (don't generate here)
├── app/contexts/     ← cross-cutting React contexts (don't generate here)
├── components/       ← shared UI components + .styles.ts
└── index.tsx         ← ConfigProvider with brand tokens (only hex values live here)
```

| What | Where |
|---|---|
| Feature component | `src/app/pages/[Module]/components/[Component].tsx` |
| Co-located styles | `src/app/pages/[Module]/components/[Component].styles.ts` |
| Shared component | `src/components/[Component].tsx` |
| Shared styles | `src/components/[Component].styles.ts` |
