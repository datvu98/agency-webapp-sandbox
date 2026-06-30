# Agency Web App — CSS Architecture Proposal

> **Context:** This document captures findings from a design system audit of the Agency Web App sandbox. It compares the current styling patterns against proposed alternatives, and states a clear recommendation for long-term adoption. AI-generated components will follow the target patterns and go through a dev review layer before merging to production.

---

## 1. Current State

### Stack
React 18 · Ant Design 5 · styled-components 5 · `@ant-design/icons`

### How styling is done today

**Pattern A — Hardcoded values in styled-components template literals**

The dominant pattern. Visual values are embedded directly in the template string with no token reference.

```tsx
// Campaign.styles.ts — current
export const VideoGridCell = styled.div`
  border-radius: 6px;
  background: #000;
`;

export const CampaignWrapper = styled.div`
  .custom-expand-icon {
    color: #a6a6a6;
    border-radius: 4px;
  }
  .custom-expand-icon:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  .text-count {
    color: #ff5629;
  }
`;
```

**Pattern B — `.ant-*` class targeting inside styled-components wrappers**

Used extensively for antd component overrides — table rows, inputs, checkboxes, selects.

```tsx
// Campaign.styles.ts — current
export const CampaignWrapper = styled.div`
  .ant-checkbox-inner { border-color: #c8c8c8; }
  .ant-table-row-expand-icon-cell { display: none !important; }
  .campaign-parent-row > td { background: rgb(245, 245, 245) !important; }
  .ant-checkbox-checked .ant-checkbox-inner {
    border-color: #ff5629;
    background-color: #ff5629;
  }
`;
```

**Pattern C — `style={{}}` for both layout and visual, mixed**

Inline style is used for spacing, font sizes, colors, and layout — no separation of concerns.

```tsx
// ListCampaign.tsx — current
<Text style={{ fontSize: 13, flexShrink: 0 }}>         // visual + layout mixed
<Flex gap={8} align="center" style={{ width: '100%' }} // layout — ok
<Text style={{ color: token.colorPrimary, fontWeight: 600 }} // token used inline
```

**Pattern D — `theme.useToken()` called but wired inline**

`theme.useToken()` is used in 2 places in the codebase. Both feed the token value directly into `style={{}}` rather than passing it to a styled-component.

```tsx
// ListCampaign.tsx — current
const { token } = theme.useToken();
<Text style={{ ...(opts?.emphasize ? { color: token.colorPrimary } : {}) }}>
```

### Root cause

`src/index.tsx` only defines one token — `colorPrimary: '#ff5629'`. Without a full token catalog, there is nothing to reference. Devs hardcode values because there is no established alternative.

```tsx
// src/index.tsx — current
<ConfigProvider theme={{ token: { colorPrimary: '#ff5629' } }}>
```

---

## 2. Problems with the Current Patterns

| Problem | Impact |
|---|---|
| Hardcoded hex values scattered across `.styles.ts` files | Brand updates require hunting every file; AI-generated components duplicate values inconsistently |
| `.ant-*` class targeting | Breaks silently on antd minor version bumps; internal class names are not part of the public API |
| `style={{}}` for visual properties | Overrides the antd token cascade; visual states (hover, disabled) become inconsistent; impossible to theme |
| No token catalog | Nothing to reference; forces hardcoding; new devs and AI have no source of truth |
| `theme.useToken()` result used inline | Same problem as `style={{}}` — bypasses styled-components, can't express hover/active states cleanly |

---

## 3. Options

### Option 1 — `$prop` Token Injection (current CLAUDE.md approach)

Call `theme.useToken()` in the component body, pass token values as typed `$props` to styled-components.

```tsx
// Card.styles.ts
export const Card = styled.div<{ $bg: string; $border: string; $radius: number }>`
  background: ${({ $bg }) => $bg};
  border: 1px solid ${({ $border }) => $border};
  border-radius: ${({ $radius }) => $radius}px;
`;

// Card.tsx
const { token } = theme.useToken();
<Card
  $bg={token.colorBgContainer}
  $border={token.colorBorderSecondary}
  $radius={token.borderRadiusLG}
/>
```

**Pros**
- No new dependencies
- TypeScript-typed tokens at the call site
- Token values are explicit and traceable

**Cons**
- High verbosity — every visual property becomes a prop type, a template interpolation, and a usage-site value
- Not the natural consumption pattern for Ant Design 5 tokens (antd's token system was designed for CSS-in-JS with direct token access, not prop threading)
- Real components with 8–10 visual properties become unreadable
- Hover/active states require passing additional props (e.g., `$hoverBg: string`)

**Verdict:** Technically correct but ergonomically wrong for this stack. The verbosity will create friction in review and discourage adoption.

---

### Option A — CSS Variables via `var(--ant-*)`

Add `cssVar: { prefix: 'ant' }` to the `ConfigProvider`. Ant Design emits all tokens as CSS custom properties. Styled-components reference them as string values — no prop threading needed.

```tsx
// src/index.tsx — one-time change
<ConfigProvider
  theme={{
    cssVar: { prefix: 'ant' },
    token: { colorPrimary: '#ff5629' }
  }}
>

// Card.styles.ts — clean, no props
export const Card = styled.div`
  background: var(--ant-color-bg-container);
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: var(--ant-border-radius-lg);
  &:hover {
    border-color: var(--ant-color-primary);
  }
`;
```

**Pros**
- One config change to `src/index.tsx`, nothing else
- Styled-components stay exactly as they are — just replace hex values with `var(--ant-*)` strings
- Hover/active/focus states work naturally in CSS without extra props
- CSS Modules also gain access to the same variables — unifies the escape hatch pattern
- Low adoption barrier for existing devs

**Cons**
- CSS variable names are plain strings — no TypeScript autocomplete, no compile-time validation
- Requires knowing the `--ant-*` naming convention (e.g., `colorBgContainer` → `--ant-color-bg-container`)
- Variable names are kebab-case derivations of token names — a small cognitive mapping cost

**Verdict:** Best fit for the current stack. Minimal change, maximum compatibility, hover states work natively in CSS.

---

### Option B — `antd-style` with `createStyles`

Add `antd-style` as a dependency alongside styled-components. New components use `createStyles` — the same approach used in the reference project (`claude-update-v1.md`). Existing components are unchanged.

```tsx
// npm install antd-style

// Card.styles.ts
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
}));

// Card.tsx
const { styles } = useStyles();
<div className={styles.card}>
  <span className={styles.title}>...</span>
</div>
```

**Pros**
- Direct, typed token access — `token.colorBgContainer` with autocomplete
- Hover/active/pseudo-elements expressed naturally as CSS-in-JS (`'&:hover': { ... }`)
- Identical pattern to the reference project — patterns proven and reviewable
- `antd-style` and styled-components coexist without conflict — gradual migration is possible
- This is how Ant Design 5 was designed to be consumed

**Cons**
- New dependency (though small and specifically designed for antd)
- Two styling systems in the codebase during transition (styled-components for existing, `createStyles` for new)
- Devs need to learn a new API

**Verdict:** Best long-term architecture. Clean, typed, and purpose-built for this exact stack.

---

## 4. Antd Component Internal Overrides

A special case not covered by the main patterns. The current codebase uses `.ant-*` targeting extensively for table row styling, input states, and checkbox appearances. The three approved alternatives:

### Row backgrounds → `onRow` callback

```tsx
const { token } = theme.useToken();

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

Uses antd's own API. No CSS override. Fully token-aware. Works today.

### Semantic row states → `rowClassName` + own-class targeting

```tsx
// Table usage
<Table rowClassName={(record) => record.isParent ? 'row-parent' : ''} />

// TableWrapper.styles.ts — targeting OUR class, not .ant-*
export const TableWrapper = styled.div<{ $parentBg: string }>`
  .row-parent > td {
    background: ${({ $parentBg }) => $parentBg} !important;
  }
`;
```

Not forbidden by the CLAUDE.md rule — we own the class name. When antd renames internals, this is stable.

### Structural display overrides → CSS Module with `:global`

For `display: none`, `padding: 0`, `nth-child` — things callbacks can't express. Requires `cssVar` enabled in ConfigProvider to access `var(--ant-*)` tokens.

```css
/* CampaignTable.module.css */
.wrap :global(.ant-table-row-expand-icon-cell) {
  display: none !important;
  width: 0 !important;
}
.wrap :global(.ant-table-row-expand-icon) {
  display: none !important;
}
```

---

## 5. Recommendation

### Long term — adopt Option B (`antd-style`)

`antd-style` with `createStyles` is the correct architecture for Ant Design 5. It was built specifically for this use case, gives direct typed token access, and handles hover/active/pseudo states cleanly without workarounds. The reference project validated this pattern. New AI-generated components should use `createStyles` from day one.

Enable `cssVar: { prefix: 'ant' }` in `src/index.tsx` regardless — it's needed for CSS Module escape hatches and costs nothing.

**One-time setup:**
```bash
npm install antd-style
```
```tsx
// src/index.tsx
<ConfigProvider theme={{ cssVar: { prefix: 'ant' }, token: { colorPrimary: '#ff5629' } }}>
```

### Acceptable now, not for future

| Pattern | Status now | Status future |
|---|---|---|
| Hardcoded hex in styled-components | Acceptable in existing code — don't touch it | Never in new code |
| `.ant-*` targeting in styled-components | Acceptable in existing code — don't touch it | Never — use `onRow`, `rowClassName`, or CSS Module |
| `style={{}}` for layout geometry only (width, flex, overflow) | Acceptable | Acceptable |
| `style={{}}` for visual properties (color, fontSize, fontWeight, border) | Acceptable in existing code | Never in new code |
| `$prop` token injection | Acceptable as a fallback if `antd-style` not available | Replaced by `createStyles` |
| `theme.useToken()` result used inline via `style={{}}` | Acceptable in existing code | Never in new code |

### Why these boundaries

The "acceptable now" patterns already exist in the codebase and are reviewed by devs who know the context. Touching them without a dedicated migration carries more risk than benefit. The "never in new code" boundary applies because AI-generated components will be reviewed against a clear standard — reviewers need a single answer to "is this right?" not a judgment call based on surrounding context.

### Pattern Consistency Protocol — amended

The standard guidance to "search for existing implementations" is **inverted for this project**. Existing components predate this design system and use the old patterns. Do not use existing components as a style reference. The rules in `CLAUDE.md` are the reference. If an existing pattern conflicts with a rule, follow the rule.

---

## 6. Summary

```
Current state:    hardcoded hex · .ant-* targeting · mixed style={{}}
CLAUDE.md today:  $prop injection — correct goal, wrong ergonomics for this stack
Option A:         CSS variables — low friction, good fit for styled-components
Option B:         antd-style createStyles — best long-term, designed for antd 5
Recommendation:   ship Option B for new components · Option A as fallback
                  existing code untouched until dedicated migration
```
