## Context

agency-webapp is a React web application used by warehouse managers. Existing operational flows (warehouse bills, handover, picking waves) follow consistent patterns: a paginated list page with status tabs, and a detail/action page with summary and data tables.

The backend (inventory-system) exposes 14 GraphQL operations for the web management flow. All business logic (routing, lock management, deviation calculation) lives server-side — the webapp is responsible for presenting data, driving work lifecycle mutations, and providing the XLSX file-import UX.

Companion changes: backend API in `inventory-system`, PDA scanning in `agency-mobile`.

## Goals / Non-Goals

**Goals:**
- List page matching the existing warehouse management list pattern: 6 status tabs, filters, paginated table
- Create page: two location-add modes — filter panel (zone → rack → location) and XLSX file upload (auto-detected mode)
- Detail page: per-work summary + session gridview; action buttons driving the full work lifecycle
- XLSX export for completed/counted works

**Non-Goals:**
- PDA scanning UI (agency-mobile)
- Backend business logic (inventory-system)
- Yêu cầu kiểm kê (Inventory Audit Order) — future sprint
- Bulk import of multiple works simultaneously

## Decisions

### D1: Six-tab list page; "Đang kiểm kê" has R1/R2/R3 sub-tabs

**Decision**: Tabs map directly to `fulfillment_inventory_record.status` values. The `counting` tab adds sub-tabs filtered by `session_count` (1 / 2 / 3) so managers can see which round is active.

**Rationale**: Sub-tabs avoid a confusing mixed list of R1/R2/R3 works on the same row and mirror how other multi-round flows (e.g. recount requests) are presented.

---

### D2: Create is a single step — S3 pre-upload then one mutation

**Decision**: The manager selects warehouse + `typeImport`, then uploads the template file. The frontend uses `useUploadFile` (hook from `src/app/pages/Campaigns/ListCampainEdit/hooks/useUploadFile.ts`) to upload to S3 and obtain `res.data.data.source` (the S3 URL). That URL, together with `warehouseId` and `typeImport`, is passed to `inventoryCountingCreate`. The backend fetches + parses the file server-side and returns import results inline.

**Rationale**: Avoids multipart/form-data on the GraphQL mutation. Reuses the existing `useUploadFile` infrastructure already proven across the app. A single mutation reduces round-trips and keeps the create flow atomic.

---

### D3: typeImport selector drives template download link + upload validation

**Decision**: The create page shows a `TypeImportSelector` (`location_code` | `sku`) which controls which template sheet link is shown. On file select, the frontend passes `typeImport` to the mutation — no client-side header parsing needed (backend handles detection). The backend returns `{ failCount, errors }` for inline display.

**Rationale**: Backend-side parsing is more robust (no dependency on browser XLSX parsing) and keeps the frontend thin. The template link changes with `typeImport` selection so managers download the correct sheet immediately.

**Alternative considered**: Client-side A1 header detection before upload. Rejected — moves parsing logic to the frontend, adds a dependency on a client-side XLSX library, and creates a mismatch risk if the template is updated.

---

### D4: Detail gridview — flat session columns, deviation highlighted

**Decision**: `ItemDataTable` renders one row per (location × SKU). Session columns appear as groups: R1 (system qty, counted qty, diff, anomaly), R2, R3. Cells with `diff ≠ 0` are highlighted. Anomaly cells show a badge.

**Rationale**: Flat column layout matches the flat columns in `fulfillment_inventory_record_items`. Managers need to compare all rounds side-by-side; grouping by session round is the most scannable layout.

---

### D5: Approve + assign staff in one modal

**Decision**: "Duyệt" button opens a single `AssignStaffPopup` that combines approval and staff assignment. One call to `inventoryCountingApprove` with `{ staffId }`. Reassignment (approved status) uses the same popup with a separate `inventoryCountingReassignStaff` mutation.

**Rationale**: Approval without assigning staff is not useful — the record would sit in `approved` with no one to scan. Combining into one action reduces round-trips and cognitive load.

## GraphQL API Reference (Web — 14 operations)

Full contracts live in `inventory-system/openspec/changes/inventory-counting/design.md`. Summary for implementation:

| Operation | Input fields | Key response fields |
|-----------|-------------|---------------------|
| `inventoryCountingCreate` | `warehouseId: Int!, fileImportLink: String!, typeImport: String!` | `data { id, code, totalRows, successCount, failCount, errors[{ row, code, reason }] }` |
| `inventoryCountingAddByLocation` | `recordId: Int!, rackId?: Int, locationIds?: [Int!]` | `data { addedCount }` |
| `inventoryCountingAddByVariant` | `recordId: Int!, variantIds: [String!]!` | `data { addedCount }` |
| `inventoryCountingRemoveItems` | `recordId: Int!, recordItemIds: [Int!]!` | `success, message` |
| `inventoryCountingApprove` | `recordId: Int!, staffOpenId: String!` | `success, message` |
| `inventoryCountingReassignStaff` | `recordId: Int!, staffOpenId: String!` | `success, message` |
| `inventoryCountingCancel` | `recordId: Int!` | `success, message` |
| `inventoryCountingDelete` | `recordId: Int!` | `success, message` |
| `inventoryCountingCopy` | `recordId: Int!` | `data { id, code }` |
| `inventoryCountingRequestRecount` | `recordId: Int!` | `data { sessionId, sessionCode, sessionNumber }` |
| `inventoryCountingComplete` | `recordId: Int!` | `success, message` |
| `inventoryCountingList` | `page?, limit?, status?, warehouseId?, code?, fromDate?, toDate?` | paginated `data { id, code, status, warehouseId, warehouseName, sessionCount, assignedTo, totalLocationRequest, totalLocationCounted, avgDiff, createdBy, createdAt }` |
| `inventoryCountingDetail` | `recordId: Int!, page?, limit?` | `data { id, code, status, note, sessionCount, assignedTo, sessions[{ id, code, sessionNumber, status, picId, startedAt, endedAt }], items[{ locationCode, sku, gtin, productName, unit, session1-3 flat cols }], totalItems, currentPage, …aggregates }` |
| `inventoryCountingExport` | `recordId: Int!` | `data { url }` |

## Risks / Trade-offs

**[Risk] Large location grids (500+ items)**: Detail page `ItemDataTable` could render 500+ rows × 3 sessions. Mitigation: server-side pagination on `inventoryCountingDetail`; virtual-scroll or page size cap on the table.

**[Risk] File upload UX for two modes**: Managers may upload the wrong sheet. Mitigation: client-side A1 header check gives an instant error message with a link to the template before the upload reaches the server.

**[Risk] Polling for session status**: Managers viewing the detail page while staff are scanning need live progress. Mitigation: implement refetch-on-focus for V1; polling or subscriptions can be added later.

## Migration Plan

1. Backend `inventory-system` 22 operations must be deployed first.
2. Add menu entry (cosmetic — no impact on existing pages if backend is not yet deployed).
3. Build list page (read-only queries — safe to deploy independently).
4. Build create + detail pages (mutations — deploy only after backend is ready).
5. Rollback: remove menu entry; existing pages are unaffected.
