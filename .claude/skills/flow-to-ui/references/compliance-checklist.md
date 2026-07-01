# Compliance Checklist

Run this on every component before writing it. All boxes must pass.

## Visual styling
- [ ] All colors, borders, radius, shadows, spacing use `createStyles` with `token.*` values
- [ ] No hardcoded hex values anywhere (e.g. `#ff5629`, `#ffffff`)
- [ ] No hardcoded px values for visual properties (spacing, radius) — use `token.padding`, `token.borderRadiusLG`, etc.
- [ ] Layout-only geometry (width, flex, overflow, position) may use `style={{}}` inline — nothing else

## Antd components
- [ ] All interactive elements use antd components — no raw `<button>`, `<input>`, `<select>`
- [ ] No `className` or `style={{}}` for visual styling on antd components
- [ ] No `.ant-*` class targeting inside `createStyles`
- [ ] Antd component appearance tweaks (if any) go in `theme.components` in `src/index.tsx`

## Button hierarchy
- [ ] Exactly one `type="primary"` Button per action group
- [ ] Cancel / secondary actions use `type="default"` or `type="text"`

## States
- [ ] Loading state uses `<Skeleton />` — not a custom spinner or blank div
- [ ] Empty state uses `<Empty />` — nothing renders blank when data is absent

## Icons
- [ ] Icons come from `@ant-design/icons` only
- [ ] Icon size: 14px in forms/inputs, 16px in toolbars/action areas
- [ ] Icon color set via `createStyles` using `token.colorTextTertiary` — never hardcoded

## Status badges
- [ ] Status indicators use `<Tag color="success|warning|error|processing|default">` — never custom `<span>`

## File structure
- [ ] Component file: `src/app/pages/[Module]/components/[Component].tsx`
- [ ] Styles file co-located: `src/app/pages/[Module]/components/[Component].styles.ts`
- [ ] `createStyles` is imported from `antd-style`, not `@emotion/css` or styled-components

## Token reference (common)

| Intent | Token |
|---|---|
| Page background | `token.colorBgLayout` |
| Card / surface | `token.colorBgContainer` |
| Primary text | `token.colorText` |
| Secondary text | `token.colorTextSecondary` |
| Placeholder / hint | `token.colorTextTertiary` |
| Subtle border | `token.colorBorderSecondary` |
| Strong border | `token.colorBorder` |
| Brand / CTA color | `token.colorPrimary` |
| Base spacing (16px) | `token.padding` |
| Large spacing (24px) | `token.paddingLG` |
| Small spacing (12px) | `token.paddingSM` |
| Base radius | `token.borderRadius` |
| Large radius | `token.borderRadiusLG` |
| Strong font weight | `token.fontWeightStrong` |
| Small font size | `token.fontSizeSM` |
