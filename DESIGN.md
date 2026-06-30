---
version: "alpha"
name: "UpS Agency Design System"
description: "Design token contract for the UpS Agency Web App sandbox. All keys use Ant Design 5 token names — set via ConfigProvider in src/index.tsx. In createStyles use token.<key>; in CSS Modules use var(--ant-<kebab-key>). Coding rules, forbidden patterns, and CSS architecture: CLAUDE.md."
see-also: "CLAUDE.md"

# ─── Colors ───────────────────────────────────────────────────────────────────
# Keys are Ant Design seed/alias token names (colorPrimary, colorText, …).
# Hover/active/bg variants are derived by Ant — do not redefine in feature files.
colors:
  # Brand
  colorPrimary: "#e65018"
  colorPrimaryHover: "#cc4010"       # shade — darker than default, lighter than active
  colorPrimaryActive: "#b91800"      # derived
  colorPrimaryBg: "#fff5f3"          # derived
  # Link — intentionally mirrors brand so <a> and Button type="link" stay on-brand
  colorLink: "#e65018"
  colorLinkHover: "#cc4010"
  colorLinkActive: "#b91800"
  # Text hierarchy
  colorText: "#0f1215"
  colorTextSecondary: "#404246"
  colorTextTertiary: "#707274"
  colorTextQuaternary: "#9d9ea1"
  # Surfaces
  colorBgLayout: "#f3f5f8"
  colorBgContainer: "#ffffff"
  colorBgElevated: "#ffffff"
  # Borders
  colorBorder: "#d5d7db"
  colorBorderSecondary: "#edeef0"
  # Semantic status — use Tag color prop, not raw hex
  colorSuccess: "#007d00"
  colorWarning: "#a44300"
  colorError: "#e74850"
  colorInfo: "#2456d3"

# ─── Typography ───────────────────────────────────────────────────────────────
# Keys are Ant Design token names. fontWeightStrong (600) is the only weight token.
typography:
  fontFamily: "Roboto, Helvetica, sans-serif"   # token.fontFamily
  fontSize: 14        # token.fontSize — body default
  fontSizeSM: 12      # token.fontSizeSM — meta, captions, compact annotations
  fontSizeLG: 16      # token.fontSizeLG — section titles (pair with fontWeightStrong)
  fontWeightStrong: 600  # token.fontWeightStrong — headings, table headers
  lineHeight: 1.57    # token.lineHeight

# ─── Radius ───────────────────────────────────────────────────────────────────
# Ant Design 5 token names: borderRadiusSM / borderRadius (base) / borderRadiusLG.
# There is no borderRadiusMD in Ant Design 5.
radius:
  borderRadiusSM: 4   # token.borderRadiusSM — tags, badges, compact controls
  borderRadius: 6     # token.borderRadius   — buttons, inputs, selects (base)
  borderRadiusLG: 8   # token.borderRadiusLG — cards, modals, panels, table shells

# ─── Spacing ──────────────────────────────────────────────────────────────────
# Keys are Ant Design token names (token.paddingXXS … token.paddingXXL).
# The same scale applies to margin tokens (marginXXS … marginXXL).
# IMPORTANT: "padding" (16 px) = token.padding (base), NOT token.paddingMD (20 px in Ant 5).
spacing:
  paddingXXS: 4
  paddingXS: 8
  paddingSM: 12
  padding: 16         # token.padding — base; paddingMD = 20 is NOT used in UpS
  paddingLG: 24
  paddingXL: 32
  paddingXXL: 48

# ─── Components ───────────────────────────────────────────────────────────────
# Property keys use Ant component-token names where they exist.
# All overrides are applied in src/index.tsx under theme.components.
components:
  page:
    colorBgLayout: "{colorBgLayout}"
    maxWidth: 1440px
    padding: "{paddingLG}"
  section-card:
    colorBgContainer: "{colorBgContainer}"
    colorText: "{colorText}"
    borderRadiusLG: "{borderRadiusLG}"
    padding: "{paddingLG}"
  button-primary:
    colorPrimary: "{colorPrimary}"
    colorTextLightSolid: "{colorBgContainer}"
    borderRadius: "{borderRadius}"
    controlHeight: 36
    paddingInline: 18
  button-primary-hover:
    colorPrimaryHover: "{colorPrimaryHover}"
  button-primary-active:
    colorPrimaryActive: "{colorPrimaryActive}"
  button-default:
    colorBgContainer: "{colorBgContainer}"
    colorText: "{colorText}"
    borderRadius: "{borderRadius}"
    controlHeight: 36
    paddingInline: 18
  input:
    colorBgContainer: "{colorBgContainer}"
    colorText: "{colorText}"
    borderRadius: "{borderRadius}"
    controlHeight: 36
  select:
    colorBgContainer: "{colorBgContainer}"
    colorText: "{colorText}"
    borderRadius: "{borderRadius}"
    controlHeight: 36
  table:
    colorBgContainer: "{colorBgContainer}"
    colorText: "{colorText}"
    borderRadiusLG: "{borderRadiusLG}"
  table-header:
    headerBg: "{colorBgLayout}"
    headerColor: "{colorTextSecondary}"
    fontWeightStrong: "{fontWeightStrong}"
    cellPaddingBlock: "{padding}"
    cellPaddingInline: "{padding}"
  table-cell:
    colorBgContainer: "{colorBgContainer}"
    colorText: "{colorText}"
    fontSize: "{fontSize}"
    cellPaddingBlock: "{padding}"
    cellPaddingInline: "{padding}"
  modal:
    colorBgElevated: "{colorBgElevated}"
    colorText: "{colorText}"
    borderRadiusLG: "{borderRadiusLG}"
    padding: "{paddingLG}"
  drawer:
    colorBgElevated: "{colorBgElevated}"
    colorText: "{colorText}"
    padding: "{paddingLG}"
  status-success:
    colorSuccess: "{colorSuccess}"
    colorTextLightSolid: "{colorBgContainer}"
    borderRadiusSM: "{borderRadiusSM}"
    paddingBlock: 4
    paddingInline: 8
  status-warning:
    colorWarning: "{colorWarning}"
    colorTextLightSolid: "{colorBgContainer}"
    borderRadiusSM: "{borderRadiusSM}"
    paddingBlock: 4
    paddingInline: 8
  status-error:
    colorError: "{colorError}"
    colorTextLightSolid: "{colorBgContainer}"
    borderRadiusSM: "{borderRadiusSM}"
    paddingBlock: 4
    paddingInline: 8
  status-info:
    colorInfo: "{colorInfo}"
    colorTextLightSolid: "{colorBgContainer}"
    borderRadiusSM: "{borderRadiusSM}"
    paddingBlock: 4
    paddingInline: 8
---

> Coding rules, forbidden patterns, and CSS anti-patterns: **[CLAUDE.md](CLAUDE.md)**

## Overview

The UpS Agency Design System is the design token contract for the UpS Agency Web App sandbox. Engineers validate component patterns, token usage, and layout conventions here before applying them to production. Components generated and reviewed here must be production-grade on arrival.

The product surface is an operational SaaS interface for ecommerce, order, inventory, marketing, finance, reporting, and workspace workflows. Interfaces must be dense, scan-friendly, and work-focused. Prefer predictable tables, filters, forms, status tags, drawers, modals, and sticky action bars over marketing-style layouts.

The design system is implemented on top of Ant Design 5. Ant Design is the authoritative source for component behavior, interaction states, accessibility affordances, density, motion, and enterprise UI patterns. UI is customised through `ConfigProvider.theme.token`, `theme.components` in `src/index.tsx`, `antd-style` `createStyles` for token-aware custom elements, and CSS Modules for structural selectors.

## Colors

The palette is a restrained operational palette: a single orange brand action color, neutral text hierarchy, quiet layout backgrounds, and semantic status colors.

All color keys in the frontmatter are exact Ant Design 5 token names set in `src/index.tsx`. Each token is available as `token.<key>` in `createStyles` and as `var(--ant-<kebab-key>)` in CSS Modules.

- **`colorPrimary` (`#e65018`):** Main CTA, active state, brand mark, and high-priority interactive emphasis only.
- **`colorPrimaryHover` / `colorPrimaryActive` / `colorPrimaryBg`:** Derived by Ant — do not redefine in feature files.
- **`colorLink` / `colorLinkHover` / `colorLinkActive`:** Mirrors brand color so `<a>` elements and `Button type="link"` stay on-brand automatically without extra styling.
- **`colorText` (`#0f1215`):** Primary readable content.
- **`colorTextSecondary` (`#404246`):** Labels, descriptions, table metadata, and secondary values.
- **`colorTextTertiary` (`#707274`):** Hints, timestamps, helper text, and low-emphasis icons.
- **`colorTextQuaternary` (`#9d9ea1`):** Placeholders and disabled or inactive text.
- **`colorBgLayout` (`#f3f5f8`):** Page canvas.
- **`colorBgContainer` (`#ffffff`):** Cards, panels, modals, table rows, popovers, and elevated content.
- **`colorBorder` (`#d5d7db`):** Prominent borders and hover borders.
- **`colorBorderSecondary` (`#edeef0`):** Subtle dividers, table row separators, and section breaks.
- **`colorSuccess` / `colorWarning` / `colorError` / `colorInfo`:** Semantic status only — use `Tag color` prop, not raw hex.

| Ant token (`token.<key>`) | CSS variable | Value | Role |
|---|---|---|---|
| `colorPrimary` | `--ant-color-primary` | `#e65018` | CTAs, active states, brand marks |
| `colorPrimaryHover` | `--ant-color-primary-hover` | `#ff845c` | derived |
| `colorPrimaryActive` | `--ant-color-primary-active` | `#b91800` | derived |
| `colorPrimaryBg` | `--ant-color-primary-bg` | `#fff5f3` | derived |
| `colorLink` | `--ant-color-link` | `#e65018` | links, Button type="link" |
| `colorText` | `--ant-color-text` | `#0f1215` | primary text |
| `colorTextSecondary` | `--ant-color-text-secondary` | `#404246` | labels, descriptions |
| `colorTextTertiary` | `--ant-color-text-tertiary` | `#707274` | meta, hints, icons |
| `colorTextQuaternary` | `--ant-color-text-quaternary` | `#9d9ea1` | placeholders, disabled |
| `colorBgLayout` | `--ant-color-bg-layout` | `#f3f5f8` | page canvas |
| `colorBgContainer` | `--ant-color-bg-container` | `#ffffff` | cards, panels, table rows |
| `colorBgElevated` | `--ant-color-bg-elevated` | `#ffffff` | modals, drawers, dropdowns |
| `colorBorder` | `--ant-color-border` | `#d5d7db` | prominent borders |
| `colorBorderSecondary` | `--ant-color-border-secondary` | `#edeef0` | subtle dividers |
| `colorSuccess` | `--ant-color-success` | `#007d00` | status: completed |
| `colorWarning` | `--ant-color-warning` | `#a44300` | status: pending |
| `colorError` | `--ant-color-error` | `#e74850` | status: failed/cancelled |
| `colorInfo` | `--ant-color-info` | `#2456d3` | status: in progress |

In `createStyles`, reference tokens as `token.colorPrimary`, `token.colorBgContainer`, etc. In CSS Modules, reference as `var(--ant-color-primary)`, `var(--ant-color-border-secondary)`, etc.

Do not hardcode hex, rgb, rgba, or named colors in feature components.

## Typography

Roboto is the product font. The base UI size is 14px (`token.fontSize`) with a compact operational rhythm (`token.lineHeight` 1.57).

| Use case | Token | Value |
|---|---|---|
| Body — table cells, form controls, labels | `token.fontSize` | 14px |
| Small body — meta, captions, annotations | `token.fontSizeSM` | 12px |
| Section titles | `token.fontSizeLG` + `token.fontWeightStrong` | 16px / 600 |
| Table column headers | `token.fontSize` + `token.fontWeightStrong` | 14px / 600 |

Ant Design has no `fontWeightNormal` token — normal weight is CSS default (400). The only weight token is `token.fontWeightStrong` (600).

For custom elements, put font size, color, and weight in `createStyles` — not inline `style`.

Do not scale font sizes with viewport width.

## Layout

Styling uses a two-layer architecture — each layer owns one category. Implementation rules, code examples, and anti-patterns for each layer are in `CLAUDE.md`.

| Layer | Tool | Owns |
|---|---|---|
| 1 | `antd-style` `createStyles` (co-located `*.styles.ts`) | All token-aware visual values — color, background, border, radius, shadow, typography, hover/active/focus, pseudo-elements |
| 2 | CSS Modules (co-located `*.module.css`) | Structural selectors — `:nth-child`, sticky, print, `:global(.ant-*)` overrides |

Layers must not mix concerns. CSS Modules reference `var(--ant-*)` only; no hardcoded values. Inline `style={{}}` is acceptable only for layout-only geometry (width, flex, overflow) with no visual properties.

### Page layout defaults

- Background: `token.colorBgLayout` (`#f3f5f8`), max-width 1440px, centered
- Two-column create/edit: main `flex: 1` + sidebar `flex: 0 0 280px`, gap `token.paddingLG` (24px)
- Sticky action bar: container bg · `border-top: 1px solid ${token.colorBorderSecondary}` · padding `12px 24px` · scroll container `paddingBottom ≥ 64px`

Use Ant layout primitives before custom code: `Row`/`Col` for responsive grids, `Flex` for alignment, `Space` for compact control groups, `Grid.useBreakpoint` only when render logic must respond to breakpoints.

## Elevation & Depth

Use depth sparingly. Operational screens should feel stable and quiet.

- Prefer borders and subtle dividers over heavy shadows.
- Use `token.boxShadowTertiary` for cards and floating content.
- Use elevated backgrounds (`colorBgElevated`) for modals, dropdowns, drawers.
- Do not create decorative gradient or marketing-style backgrounds.

When an antd component needs a visual adjustment, use `theme.components` in `src/index.tsx`. Do not patch global `.ant-*` classes or add `!important` overrides in feature files.

## Shapes

Ant Design 5 exposes three radius tokens; there is no `borderRadiusMD`.

| Token | Value | Use |
|---|---|---|
| `token.borderRadiusSM` | 4px | compact controls, tags, badges, small chips |
| `token.borderRadius` | 6px | buttons, inputs, selects (base radius) |
| `token.borderRadiusLG` | 8px | cards, panels, table shells, modals |

## Components

Use Ant Design components for all standard UI controls. Use raw HTML controls only when no antd equivalent exists.

| User need | Ant component |
|---|---|
| Primary, default, text, link, or danger action | `Button` |
| Single-line text or search input | `Input`, `Input.Search` |
| Dropdown selection | `Select`, `TreeSelect` |
| Date range filtering | `DatePicker.RangePicker` |
| Boolean toggle | `Switch` |
| Multi-select | `Checkbox` |
| Exclusive option choice | `Radio.Group` |
| Small mode switch | `Segmented` |
| Data table | `Table` |
| Tabs | `Tabs` |
| Status | `Tag`, `Badge` |
| Context actions | `Dropdown` |
| Help / clipped content | `Tooltip` |
| Inline feedback | `Alert` |
| Framed surface | `Card` |
| Blocking form | `Modal` |
| Side panel workflow | `Drawer` |
| Loading | `Skeleton`, `Spin` |
| Empty state | `Empty` |

If an antd component already exposes a prop for behavior or visual intent, use that prop instead of recreating the pattern: `Button type`, `Button danger`, `Tag color`, `Table rowSelection`, `Select mode`, `Form.Item validateStatus`, `Input status`, etc.

### Buttons

One `type="primary"` per view. Hierarchy: `type="text"` → `type="default"` → `type="primary"`. Use `danger` for destructive actions. Never override button visuals with `style` or `className`.

### Status

```tsx
<Tag color="success">Completed</Tag>
<Tag color="warning">Pending</Tag>
<Tag color="error">Cancelled</Tag>
<Tag color="processing">In progress</Tag>
<Tag color="default">Draft</Tag>
```

### Tables

Use Ant Table capabilities before hand-rolling mechanics: `columns`, `dataSource`, `rowKey`, `loading`, `pagination`, `scroll`, `sticky`, `expandable`, `rowSelection`, `locale.emptyText`. For styling: `createStyles` owns header colors, badges, and row highlights; CSS Modules own sticky headers, nth-child rules, and scoped antd selectors.

### Forms and filters

Use `Segmented` for small mode switches, `Radio.Group` for mutually exclusive filter values. Let Ant Form own validation: `Form.Item`, `rules`, `validateStatus`, `help`, `required`, component `status` props.

### Icons

`@ant-design/icons` only. 14px in forms/inputs, 16px in toolbars/actions. Color: `token.colorTextTertiary` via `createStyles` — never hardcoded. Never set color directly on the icon via `style` prop.

## Implementation rules

Coding rules, forbidden patterns, anti-patterns with code examples, and the CSS architecture are in **[CLAUDE.md](CLAUDE.md)**.

### Sandbox anchors

| What | Path |
|---|---|
| App entry + ConfigProvider | `src/index.tsx` — the only file with hex values |
| Top-level routing | `src/app/pages/MainLayout/index.tsx` |
| Nested module routing | `src/app/pages/[Module]/[Module]Page.tsx` |
| Feature screen | `src/app/pages/[Module]/[ScreenName]/index.tsx` |
| Feature components | `src/app/pages/[Module]/[ScreenName]/components/` |
| Co-located styles | `src/app/pages/[Module]/[ScreenName]/components/[Component].styles.ts` |
| Shared components | `src/components/` |
| Redux slices | `src/app/pages/[Module]/slice/` — do not modify |
| Cross-cutting contexts | `src/app/contexts/` — do not modify |

---

## Ant Design Principles

These are Ant Design's ten interaction principles. Apply them as a checklist when generating or reviewing any UI. They are the "why" behind the component rules in this file and [CLAUDE.md](CLAUDE.md).

### Core Design Values

Every screen must satisfy all four:

| Value | What it means for code |
|---|---|
| **Natural** | Use standard Ant component behavior — never replace it with custom one-off mechanics. Hover states, focus rings, dropdown positioning, and keyboard navigation come from the component for free. |
| **Certain** | State must always be visible: loading indicators, validation errors, empty states, success confirmations. Never leave users guessing whether an action worked. |
| **Meaningful** | Every visual emphasis (color, weight, size, shadow) must encode information — status, priority, or hierarchy. Never use decorative emphasis. |
| **Growing** | Patterns must generalise. Solve the pattern, not the screen. A filter bar built for Orders must work for Campaigns with zero structural changes. |

### Interaction Principles

#### 1. Make it Direct
Edit content in context — not on a separate page. Never navigate away to make a small change.

- **Click-to-edit:** Browse mode by default; hover reveals editable state (yellow background + tooltip); click transitions to input + confirm/cancel. Auto-focus the input on activation.
- **Inline row edit in tables:** Expand space to fit form elements without breaking column alignment.
- **Drag-to-reorder:** Constrain to single axis. Hover reveals handle; valid drop zones show a blue indicator stroke.
- **Never:** Open a new page/route for a single field edit.

#### 2. Stay on the Page
Solve most problems on the same page. Page refreshes and route changes break user flow and cause change blindness.

- **Prefer overlays and drawers** over full-page navigation for detail views, confirmations, and small edits.
- **Detail overlay:** Show additional info on hover/click. Apply a 150ms delay on mouseover; close immediately on mouse-out.
- **Input overlay:** Allow small text entries without navigation. Preserve input if the user clicks outside without submitting.
- **Inline expand (inlay):** Reveal sub-rows or detail panels within the list without leaving the page.
- **Multi-step flows:** Use step components on a single page. Reserve full-page routing for major workflow boundaries only.
- **Undo over confirm:** Prefer "action taken + undo" over blocking confirmation modals for reversible actions.

#### 3. Keep it Lightweight (Fitts's Law)
The time to hit a target grows with distance and shrinks with size. Place tools near the data they act on.

- **Always-visible tools:** Primary actions (primary `Button`) must be visible at all times without hover — no discovery required.
- **Hover-reveal tools:** Secondary actions (`Button type="text"`, icon buttons) may appear on row hover to reduce visual noise. They must appear within 150ms.
- **Toggle-reveal tools:** Actions outside the primary flow (bulk edit, column config) can be behind a mode switch or `Dropdown`.
- **Clickable area > visual size:** Use padding to enlarge hit targets, not the visual element itself. Table action cells must be at least 32px tall.
- **Never:** Place the primary action at the bottom of a long scroll without a sticky anchor.

#### 4. Provide an Invitation
Every interactive element must communicate that it is interactive. Never rely on users discovering affordances by accident.

- **Static invitations:** Placeholder text in inputs, helper text below form fields, empty-state CTAs.
- **Hover invitations:** Cursor changes, color shifts, action button appearance — all within 150ms of hover.
- **Blank slate:** Empty states must always include a primary action (e.g. "Tạo đơn hàng đầu tiên") — never just "No data".
- **Progressive disclosure:** Show hints and secondary options only when needed. Don't front-load every option onto the initial view.
- **Tours:** Only on first use; short, easy to exit, and easy to restart. Never block a task flow.

#### 5. Use Transition
Motion communicates what changed and why. Use it to guide attention, not decorate.

- **Adding elements:** New rows, cards, or overlays should fade or slide in to signal where to look.
- **Removing elements:** Animate out before unmounting so users register the removal.
- **View changes:** Slide or crossfade between panels to maintain spatial context.
- **Perceived performance:** Use skeleton screens and progress bars during data fetches — never blank white space.
- **Keep motion subtle:** Ant Design's built-in transitions are the baseline. Do not override `transition` or `animation` on antd components.
- **Never:** Use animation purely for decoration; every transition must serve a communication purpose.

#### 6. React Immediately
Every user action needs an immediate response — even if the real result takes time.

- **Optimistic UI:** For quick mutations, update the UI first and roll back on error.
- **Loading states:** Any operation taking >300ms must show a loading indicator — `Table loading`, `Button loading`, or `Skeleton`.
- **Auto-complete / live suggest:** Search inputs must show results as the user types, not only on submit.
- **Live preview:** Form inputs that affect a derived output (price, slug, label) should update that output in real time.
- **Progress indicators:** Long operations (export, bulk update) must use a `Progress` or loading overlay — never a silent wait.
- **Click refresh:** Data lists that can go stale should expose a refresh control; auto-refresh for real-time data with visible "last updated" timestamp.
- **Never:** Leave a button in its default state after a click. Always acknowledge (loading, success, error).

### Visual Composition Rules (Gestalt)

These apply to every layout decision — spacing, grouping, contrast, hierarchy:

| Rule | Application |
|---|---|
| **Proximity** | Items that belong together must be visually grouped. Use `token.paddingSM` (12px) between related fields within a card, `token.paddingLG` (24px) between separate sections. |
| **Alignment** | All elements align to an 8px grid. Form labels, input edges, table columns, and button groups must share alignment axes. Never position elements by eye. |
| **Contrast** | Primary actions use `colorPrimary`; secondary content uses `colorTextSecondary`; disabled/inactive uses `colorTextQuaternary`. Never use contrast solely for decoration. |
| **Repetition** | The same pattern must look identical across modules. Filter bars, action columns, status tags, section cards — no per-module visual variation. |

---

## Design Patterns

Common screen patterns for this product. Each pattern maps Ant Design components to the operational SaaS conventions used across all modules. Detailed token usage and forbidden anti-patterns for each are in [CLAUDE.md](CLAUDE.md).

### List screen (table + filters)

The dominant pattern: filter bar above a full-width `Table`. Filters live in a section card; the table is a separate section card below.

```
┌─ Filter bar ─────────────────────────────────────────────────────┐
│  Input.Search   Select (status)   DatePicker.RangePicker  [Reset] │
└──────────────────────────────────────────────────────────────────┘
┌─ Table ──────────────────────────────────────────────────────────┐
│  col header  col header  col header  col header  Actions         │
│  row · · · · · · · · · · · · · · · · · · · · · · [Edit][Delete] │
│  pagination                                                       │
└──────────────────────────────────────────────────────────────────┘
```

- Use `columns[].filters` + `onFilter` for enum filters (status, type); use `filteredValue` on the column when filter state is controlled externally
- Use `columns[].sorter` for server-sortable columns; pass `sortOrder` to keep the column in sync with controlled state
- Pass `loading` prop to `Table` — never wrap it in `Spin`
- `rowKey` must always be set to a stable unique field
- `pagination` defaults: `pageSize: 20`, `showSizeChanger: true`, `showTotal: (total) => \`${total} kết quả\``
- Action column: `fixed: 'right'`, `width: 120`, uses `Button type="text"` or `Dropdown` for 3+ actions
- Empty state: set via `locale={{ emptyText: <Empty description="..." /> }}`

```tsx
<Table
  rowKey="id"
  columns={columns}
  dataSource={data}
  loading={isLoading}
  pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `${t} kết quả` }}
  onChange={(pagination, filters, sorter) => { /* update query params */ }}
  scroll={{ x: 'max-content' }}
/>
```

### Create / Edit form screen

Two-column layout: main content (`flex: 1`) + sidebar (`flex: 0 0 280px`). Sticky action bar at the bottom.

```
┌─ Main (flex: 1) ─────────────────┐ ┌─ Sidebar (280px) ──────────┐
│  Section card — Basic info        │ │  Section card — Summary     │
│  Section card — Detail            │ │  Section card — Settings    │
└───────────────────────────────────┘ └─────────────────────────────┘
┌─ Sticky action bar ──────────────────────────────────────────────┐
│  [Huỷ text]          [Lưu nháp default]     [Xác nhận primary]   │
└──────────────────────────────────────────────────────────────────┘
```

- Use `Form` with `layout="vertical"` for all create/edit forms
- `Form.Item` owns validation — use `rules`, `validateStatus`, `help`; never roll custom error display
- One `type="primary"` per action bar; use `type="default"` for secondary saves, `type="text"` for cancel
- Sticky bar: `position: sticky`, `bottom: 0`, `background: token.colorBgContainer`, `border-top: 1px solid ${token.colorBorderSecondary}`, `padding: 12px 24px`
- Scroll container needs `paddingBottom` ≥ 64px so content doesn't hide behind sticky bar

### Detail / view screen

Read-only view of a single record. Section cards group related fields; a sidebar holds metadata and actions.

- Use `Descriptions` with `layout="vertical"` for field grids inside section cards
- Status shown as `Tag` with semantic `color` prop at the top of the main card
- Primary action (Edit, Approve) in top-right as `Button type="primary"`
- Secondary actions (Export, Print) as `Button type="default"` or `Dropdown`

### Bulk actions

When `Table` has `rowSelection`, a bulk action bar appears above the table when rows are selected.

```tsx
<Table
  rowSelection={{
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  }}
/>
{selectedRowKeys.length > 0 && (
  <div className={styles.bulkBar}>
    <span>Đã chọn {selectedRowKeys.length} dòng</span>
    <Button type="primary" danger onClick={handleBulkDelete}>Xoá</Button>
    <Button onClick={() => setSelectedRowKeys([])}>Bỏ chọn</Button>
  </div>
)}
```

### Modal confirmation

Use for destructive or irreversible actions. One `type="primary"` (or `danger`) confirm button; one `type="default"` or `type="text"` cancel.

```tsx
<Modal
  title="Xác nhận xoá"
  open={open}
  onOk={handleConfirm}
  onCancel={() => setOpen(false)}
  okText="Xoá"
  okButtonProps={{ danger: true }}
  cancelText="Huỷ"
>
  <p>Bạn có chắc muốn xoá đơn hàng này không?</p>
</Modal>
```

### Loading and empty states

- Table loading: `<Table loading={isFetching} />`
- Full-page loading: `<Skeleton active paragraph={{ rows: 6 }} />`
- Empty list: `<Empty description="Chưa có dữ liệu" image={Empty.PRESENTED_IMAGE_SIMPLE} />`
- Never use raw `Spin` to wrap a `Table` — the `loading` prop handles it internally

### Charts (`@ant-design/plots`)

Use `@ant-design/plots` for all data visualisations. Configure colors via the `theme` prop using token values — never hardcode colors in chart config.

```tsx
import { Line } from '@ant-design/plots';

const config = {
  data,
  xField: 'date',
  yField: 'value',
  theme: { defaultColor: token.colorPrimary },
};

<Line {...config} />
```

- Wrap charts in a section card with a title (`token.fontSizeLG` + `token.fontWeightStrong`)
- Set an explicit height on the chart container via `createStyles` — never rely on auto height
