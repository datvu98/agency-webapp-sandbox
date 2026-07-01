---
name: flow-to-ui
description: Transforms a user flow description into working UI code for the Agency Web App sandbox. Use this skill whenever a PO or developer describes a feature, user journey, screen mockup, or interaction pattern and wants it implemented as actual UI components. Trigger on phrases like "here's the flow", "build this screen", "implement this feature", "the user should be able to", or any wireframe/image shared with intent to implement. Always use this skill when the goal is to go from a described user experience to running code — even if the request seems simple, this skill ensures the output follows the Agency design system correctly.
---

# Flow → UI

This skill translates a user flow description — from a PO, designer, or developer — into compliant, runnable UI code for the Agency Web App sandbox.

The input might be precise or rough. That's expected. Your job is to absorb the intent, fill the gaps with reasonable defaults, and produce code that follows the design system rules in `CLAUDE.md` and `DESIGN.md`. Read both files before writing any component.

---

## Step 1: Validate the input

Before doing anything else, read `references/input-schema.md` and check the input against it.

The input can arrive in any form — a `.md` file, an image, freeform text, or a mix. Format doesn't matter. What matters is whether the five required fields are present.

For each field, decide: **present**, **inferable**, or **missing**.

- **Present** — explicitly stated in the input
- **Inferable** — not stated, but can be reasonably derived from context (module name from a route, labels from a wireframe)
- **Missing (blocking)** — truly absent and cannot be safely guessed

Only surface blocking gaps to the user before proceeding — one question maximum. For everything inferable, make a decision and note it in the plan review.

**Then present a plain-language plan review before writing any code:**

```
I understood this:
- [screen and what the user is trying to do]
- [the flow, step by step in plain language]
- [each UI surface and what it contains]

I'm assuming:
- [anything inferred, with the reasoning]

Missing — I'll block on this:
- [only truly blocking gaps, or "Nothing blocking. Ready to proceed."]
```

Wait for the user to confirm or correct before moving to Step 2.

---

## Step 2: Map the flow to components

Before writing any code, build a component plan. For each UI surface in the flow:

- Name the component (`CampaignTable`, `OrderFilterBar`, `ReportDetailDrawer`)
- State its purpose in one line
- Identify which Ant Design components it uses
- Note any state it needs (selected row, open/closed, active filter value)

**Flow element → Ant Design component mapping:**

| What the PO describes | What to use |
|---|---|
| List of items / data grid | `Table` |
| Search box | `Input` with `SearchOutlined` icon |
| Dropdown filter | `Select` |
| Date range picker | `DatePicker.RangePicker` |
| Status indicator / label | `Tag color="success|warning|error|processing|default"` |
| Toggle between views or modes | `Segmented` |
| Primary action (one per view) | `Button type="primary"` |
| Secondary / cancel action | `Button type="default"` or `type="text"` |
| Destructive confirm | `Popconfirm` |
| Side panel / detail view | `Drawer` |
| Overlay / dialog | `Modal` |
| Form | `Form` + `Form.Item` |
| Loading state | `Skeleton` |
| No data / empty state | `Empty` |
| Hint on hover | `Tooltip` |
| Expandable section | `Collapse` |
| Step-by-step process | `Steps` |

---

## Step 3: Check existing patterns

Before creating new files, search the codebase:

```bash
# Find existing components in the target module
find src/app/pages/[Module] -name "*.tsx" | head -20

# Find similar createStyles patterns
grep -r "createStyles" src/app/pages/ --include="*.styles.ts" -l
```

If a FilterBar, Table wrapper, or StatusBadge already exists nearby — reuse or extend it instead of creating a duplicate. Consistency matters more than novelty.

---

## Step 4: Write the files

Follow the folder structure, `createStyles` pattern, and component file template from **CLAUDE.md** exactly. Run the compliance checklist in `references/compliance-checklist.md` on every component before writing it.

---

## Step 5: Use mock data

This is a design sandbox — there is no real API. Use static mock arrays or objects inline in the component file. Keep mock data minimal and realistic (3–5 rows for tables, plausible field values).

```tsx
const MOCK_ORDERS = [
  { id: 'ORD-001', customer: 'Nguyễn Văn A', status: 'completed', total: 1_500_000 },
  { id: 'ORD-002', customer: 'Trần Thị B',   status: 'pending',   total: 750_000 },
];
```

---

## Step 6: Confirm what was built

After writing all files, tell the user:
- The path to each file created
- What it contains and where it fits in the flow
- Any assumptions you made (module name inferred, layout choice, fields chosen)

The PO should be able to run `yarn start` and see the result immediately.

---

## When to ask vs. when to infer

**Ask (only if truly blocking):**
- The module/route is completely unknown and can't be guessed from context
- An interaction is genuinely ambiguous in a way that changes the component structure (modal vs. page navigation)

**Infer and note:**
- Module folder name (guess from feature name, state the guess in your summary)
- Which specific columns appear in a table (use plausible fields, note them)
- Filter layout (toolbar above table is the default pattern)
- Whether a panel is a Drawer or Modal (Drawer for detail views, Modal for confirmations)

One clarifying question is reasonable. Two or more means you're being too cautious — make a decision and note it.

---

## Example

**Input from PO:**
> "I need a campaign list page. Users can filter by date and status. The table shows campaign name, start date, budget, status badge. Clicking a row opens a detail panel on the right."

**Output:**
- `src/app/pages/Campaign/components/CampaignFilterBar.tsx` — `DatePicker.RangePicker` + `Select` for status
- `src/app/pages/Campaign/components/CampaignFilterBar.styles.ts`
- `src/app/pages/Campaign/components/CampaignTable.tsx` — `Table` with `Tag` status column, `onRow` click
- `src/app/pages/Campaign/components/CampaignTable.styles.ts`
- `src/app/pages/Campaign/components/CampaignDetailDrawer.tsx` — `Drawer` with campaign fields
- `src/app/pages/Campaign/components/CampaignDetailDrawer.styles.ts`

Each file is complete, uses only `createStyles` for visual styling, and is ready to render.

---

## Reference files

- `references/input-schema.md` — What Claude checks before executing: the 5 required fields and how to handle gaps
- `references/po-input-guide.md` — Plain-language guide for POs on how to prepare their input `.md` file
- `references/compliance-checklist.md` — Pre-flight checklist to run on every component before writing
