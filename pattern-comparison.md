# Pattern Comparison — ConversionBills vs ReportOverview

Side-by-side factual comparison. No judgements on which approach is correct.

---

## File structure

| | ConversionBills | ReportOverview |
|---|---|---|
| Files | `index.tsx` · `ConversionBillListPage.styles.ts` · `ConversionBillDetailPage.tsx` · `ConversionBillDetailPage.styles.ts` | `index.tsx` · `ReportOverview.tsx` |
| Styles files | 1 per component, co-located | None inside the folder — page layout comes from `../Report.styles.ts` |
| External styles | None | `../Report.styles.ts` — `styled-components`, imported as `ReportOverviewWrapper` |

---

## Styling mechanisms in use

| Mechanism | ConversionBills | ReportOverview |
|---|---|---|
| `createStyles` (antd-style) | Yes — all styling | No |
| `styled-components` | No | Yes — `ReportOverviewWrapper` in `../Report.styles.ts` |
| `classnames` library | No | Yes — `ReportOverview` uses `classNames()` for a conditional class on the filter component |
| Inline `style={{}}` | `style={{ cursor: 'pointer' }}` on `onRow` only | `style={{ marginBottom: 50, paddingBottom: 20 }}` on `<Card>` in `ReportOverview` |

---

## Token access

| | ConversionBills | ReportOverview |
|---|---|---|
| Inside `createStyles` | All values via `token.*` | Not used |
| Hardcoded values in styles | None | `../Report.styles.ts` contains hex literals (`#666`, `#e5e8eb`, `#fa5528`, `rgba(254, 86, 41, 0.1)`) and raw px (`15px`, `13px`, `10px`, `35px`) |
| Hardcoded values in JSX | None | `style={{ marginBottom: 50, paddingBottom: 20 }}` in `ReportOverview` |

---

## antd component usage

| | ConversionBills | ReportOverview |
|---|---|---|
| Components used | `Button` · `Table` · `Tag` · `Tooltip` · `Segmented` · `Empty` | `Card` |
| `className` on antd components | None | `<Card className="card-filter">` in `ReportOverview` |
| Page wrapper | Raw `<div className={styles.page}>` via `createStyles` | `<ReportOverviewWrapper>` styled-component |
| Loading state | Not applicable (mock data) | `<Card loading={loadingLineChart}>` |
| Empty state | `locale={{ emptyText: <Empty description="..."> }}` on every Table | No explicit `locale` prop |

---

## Data and state

| | ConversionBills | ReportOverview |
|---|---|---|
| Data source | Static mock objects (`MOCK_BILLS`) | Apollo `useQuery(query_report_charts)` with `fetchPolicy: 'cache-and-network'` |
| Contexts consumed | None | `useLayoutContext` (breadcrumb) · `useReportContext` (filter variables) |
| Custom hooks | None | `useElementOnScreen` (Intersection Observer — drives sticky filter class) |
| URL / routing | `useNavigate`, `useParams` for bill code | `useNavigate` only (routing handled inside the child filter component) |
| `memo` | None | `memo(ReportOverview)` |

---

## Side effects

| | ConversionBills | ReportOverview |
|---|---|---|
| `useLayoutEffect` | None | Breadcrumb registration in `index.tsx` |
| `useEffect` | None | None |
| External DOM queries | None | None |

---

## Imports summary

| Import | ConversionBills | ReportOverview |
|---|---|---|
| `antd-style` | `createStyles` | — |
| `styled-components` | — | Yes (via `../Report.styles.ts`) |
| `classnames` | — | `classNames` in `ReportOverview` |
| `@apollo/client` | — | `useQuery` in `index.tsx` |
| `react-helmet-async` | — | `Helmet` in `index.tsx` |
| `@ant-design/icons` | `ArrowLeftOutlined` · `ArrowRightOutlined` | — |

---

## Inline comments

| | ConversionBills | ReportOverview |
|---|---|---|
| In component files | None | None |
| In styles files | None | Large commented-out block at top of `../Report.styles.ts` (old `ReportOverviewWrapper` definition) |
