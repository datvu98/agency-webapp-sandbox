# Input Schema

Five fields to check before executing. For each: is it present, inferable, or missing?

---

## Field 1: Entry point
**What it is:** The screen or route this feature lives on.
**Why it's blocking:** Without it, the folder path and route wiring can't be determined.
**How to find it:** In order of confidence:

1. **Route / file path** — most reliable. e.g. `/outbound-manage/processing-list`, `src/app/pages/WarehouseManagement/ProcessingList/`
2. **Screen meta title** — fallback when no route is given. Search for the title string across the codebase:
   ```bash
   grep -r "[screen title]" src/ --include="*.tsx" -l
   ```
   Look for matches in `<Helmet>` tags, `appendBreadcrumb` calls, and `index.tsx` files. Prefer results under `src/app/pages/` — ignore hits in menu/nav files.
3. **Module or feature name** — least reliable. Use as a starting hint, then browse `src/app/pages/` to confirm.

**Title-matching risks — always surface the matched folder before proceeding:**

| Risk | What happens |
|---|---|
| Duplicate title | Same string appears in the page file AND the menu file — grep returns both. Pick the `index.tsx` under `src/app/pages/`, not the menu. |
| Same title, different modules | Two unrelated screens share a similar title — wrong folder gets picked. Show the match and ask to confirm. |
| Title not in code | Helmet or breadcrumb uses a different string than what the PO wrote — search returns nothing. Fall through to asking. |
| Partial match | A short or common title matches many files. Require at least 3 consecutive Vietnamese words to treat a grep hit as confident. |
| Test screen reuses original title | A cloned screen inherits the original's Helmet — search finds the original, not the clone. Cross-check against the route list in `WarehouseManagementPage.tsx`. |

**Rule:** never silently proceed on a title-inferred entry point. Always state the matched folder in the plan review and wait for confirmation.

**If missing and unsearchable:** Ask once — "Which screen does this feature live on?"

---

## Field 2: Flow steps
**What it is:** The sequence of user actions and what the system does in response.
**Why it's blocking:** Without it, there's no flow to implement.
**How to find it:** Numbered steps, arrows in a diagram, "user clicks X → Y appears" sentences.
**If missing:** Ask once — "Can you walk me through the steps of this flow?"

---

## Field 3: Explicit labels on every interactive element
**What it is:** The exact text on buttons, dropdown options, modal titles, field placeholders, tab names.
**Why it's blocking:** Any unlabelled interactive element forces guessing or copying from existing code — both produce wrong results.
**How to find it:** Text visible on wireframes, listed in the flow steps, or called out in notes.
**If inferable:** A wireframe shows the text clearly → treat as present.
**If missing:** List which specific elements have no label and note what was assumed.

Examples of what needs explicit labels:
- Button: "Đồng ý", "Huỷ", "Đóng", "Tạo danh sách"
- Dropdown items: "Phân công nhân viên" (not just "a dropdown with actions")
- Modal title: "Phân công nhân viên", "Kết quả xử lý"
- Field placeholder: "Chọn nhân viên xử lý"

---

## Field 4: Boundaries
**What it is:** Which actions should NOT navigate away, call APIs, or open other screens.
**Why it's blocking:** Without it, real API mutations and navigation get silently wired up.
**How to find it:** Explicit notes like "mock only", "no API", "stay on this screen", "don't open detail".
**If missing:** Default to mock data and no navigation unless the input explicitly says otherwise. Note this assumption.

---

## Field 5: Context (non-blocking)
**What it is:** Feature name, user/persona, module purpose.
**Why it helps:** Guides component naming, language choices, and which code branch to target (e.g. fulfillment vs non-fulfillment user).
**If missing:** Infer from the entry point and proceed. Note what was assumed.

---

## Decision table

| Field | Missing and uninferable | Action |
|---|---|---|
| Entry point | Yes | Block — ask once |
| Flow steps | Yes | Block — ask once |
| Interactive labels | Partially | Note assumptions, proceed |
| Boundaries | Yes | Default to mock/no-nav, note it |
| Context | Yes | Infer from entry point, note it |

Never ask more than one clarifying question. If multiple blocking fields are missing, ask for all of them in a single message.
