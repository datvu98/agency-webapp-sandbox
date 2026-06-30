# V1 vs V3 Coding Patterns

## Overview

| Dimension | V1 | V3 |
|---|---|---|
| Styling method | `className` strings, `style={{}}` inline | `createStyles` with token values |
| Layout containers | antd `<Card>` | `<div className={styles.x}>` |
| Filter label pattern | Two-column `Row`/`Col` (label col + control col) | Custom `FilterField` compound component |
| Responsive grid | Fixed `span={8}` (always 3 cols) | `xs={24} lg={12} xxl={8}` (1→2→3 cols) |
| Loading state | `<Card loading={true}>` prop | `<Skeleton>` rendered conditionally |
| Token access | Not used — hardcoded classnames and px values | `createStyles(({ token }) => ...)` |
| Overflow handling | Implicit via `Card` | Explicit `overflow: 'hidden'` on container |
| Max-width constraint | None | `maxWidth: 1440, margin: '0 auto'` on `stack` |
| Hex/color values | In global CSS (`.text-fit`, `.w-100`, etc.) | Only in `src/index.tsx` via `ConfigProvider` |

---

## 1. Styling

### V1 — inline style + className strings
```tsx
// ReportOverviewV1.tsx
<Card style={{ marginBottom: 50, paddingBottom: 20 }}>

// ReportFilter.tsx
<Col span={4} style={{ display: "flex", justifyContent: "center" }}>
<Select className="w-100" ... />
<Text className="text-fit">Thời gian</Text>
```
- Mix of antd `Card` props, `style={{}}`, and global CSS class strings
- No token access — values are magic numbers or delegated to a global stylesheet
- `className` on antd components directly (against CLAUDE.md rules)

### V3 — createStyles with tokens
```ts
// ReportOverviewV3.styles.ts
export const useStylesV3 = createStyles(({ token }) => ({
  filterBar: {
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
    padding: token.paddingLG,
  },
}));
```
- All visual properties go through `token.*` — no hardcoded px or hex
- Co-located in `[Component].styles.ts`, imported via `useStylesV3()`
- antd components receive no `className` or `style` for visual purposes

---

## 2. Layout Containers

### V1 — antd Card
```tsx
<Card className="card-filter">
  <ReportFilter ... />
</Card>
<Card loading={loadingLineChart}>
  <LineChart ... />
</Card>
<Card style={{ marginBottom: 50, paddingBottom: 20 }}>
  <ReportTable />
</Card>
```
- `Card` does layout AND visual styling (background, border, radius, shadow)
- Loading handled via `Card`'s built-in `loading` prop
- No control over `overflow` — Card handles it implicitly

### V3 — token-styled divs
```tsx
<div className={styles.filterBar}>
  <ReportFilterV3 ... />
</div>
<div className={styles.chartSection}>
  {loadingLineChart ? <Skeleton active ... /> : <LineChart ... />}
</div>
<div className={styles.tableSection}>
  <div className={styles.tableSectionHeader}>...</div>
  <div className={styles.tableContent}><ReportTable /></div>
</div>
```
- Structure and visual styling are explicit and separate
- `overflow: 'hidden'` is deliberate — required to contain Slick carousel overflow
- Loading state is explicit JSX branch, not a hidden Card prop

---

## 3. Filter Label Pattern

### V1 — two-column Row/Col
```tsx
<Row gutter={5} style={{ alignItems: "center" }}>
  <Col span={4} style={{ display: "flex", justifyContent: "center" }}>
    <Text className="text-fit">Thời gian</Text>
  </Col>
  <Col span={20}>
    <RangePicker className="w-100" ... />
  </Col>
</Row>
```
- Label and control are siblings in a grid — visually separate
- Two `Row` groups (3 fields per row × 2 rows) with `style={{ marginTop: 10 }}` between them
- `className="w-100"` applied directly on antd `Select` / `RangePicker`

### V3 — FilterField compound component
```tsx
// FilterField.tsx
const control = React.cloneElement(children, {
  variant: 'borderless',
  style: { width: '100%' },
});
return (
  <div className={styles.field}>
    <span className={styles.label}>{label}</span>
    <span className={styles.separator} />
    <div className={styles.controlWrapper}>
      {control}
    </div>
  </div>
);

// Usage
<FilterField label="Thời gian">
  <RangePicker ... />
</FilterField>
```
- Label and control fused into one bordered unit with focus/hover states
- `React.cloneElement` injects `variant="borderless"` — removes antd's inner border without touching the component's props at the call site
- `FilterField.styles.ts` owns all visual rules (`colorBorder`, `colorPrimary` focus ring, etc.)

---

## 4. Responsive Grid

### V1 — fixed 3-column
```tsx
<Row gutter={20} align="middle">
  <Col span={8}>...</Col>   {/* always 1/3 width */}
  <Col span={8}>...</Col>
  <Col span={8}>...</Col>
</Row>
<Row style={{ marginTop: 10 }} gutter={20} align="middle">
  <Col span={8}>...</Col>
  ...
</Row>
```
- Two separate `Row` components — spacing between rows via `style={{ marginTop: 10 }}`
- Collapses to unusably narrow columns at tablet/mobile widths

### V3 — responsive breakpoints, single Row
```tsx
<Row gutter={[16, 12]} align="middle">
  <Col xs={24} lg={12} xxl={8}>   {/* 1 col → 2 col → 3 col */}
    <FilterField label="Thời gian"><RangePicker ... /></FilterField>
  </Col>
  ...all 6 fields in one Row...
</Row>
```
- Single `Row` with `gutter={[16, 12]}` (horizontal + vertical gap)
- `xs=24 lg=12 xxl=8`: full-width on mobile, 2-col at ≥992px, 3-col at ≥1600px

---

## 5. Key Rule Violations in V1 (fixed in V3)

| V1 pattern | Rule violated | V3 fix |
|---|---|---|
| `<Select className="w-100">` | No `className` on antd components | `style={{ width: '100%' }}` via `cloneElement` inside FilterField |
| `<Card style={{ marginBottom: 50 }}>` | No `style={{}}` for visual props on antd components | `createStyles` token values |
| `style={{ alignItems: "center" }}` on `Row` | Layout-only ok, but mixed with visual concerns | Separated into `createStyles` for visual, `style={{}}` only for pure geometry |
| `<Text className="text-fit">` | Global CSS class on antd component | `createStyles` → `styles.label` |
| Fixed `span={8}` grid | No responsive behavior | `xs={24} lg={12} xxl={8}` |
| No `maxWidth` | Content stretches on wide monitors | `maxWidth: 1440, margin: '0 auto'` on `stack` |
