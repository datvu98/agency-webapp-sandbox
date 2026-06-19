## Why

Warehouse managers need a web interface to create and track daily inventory count works, assign them to staff, review session results, and export discrepancy reports. Without this, managers have no visibility into counting progress or deviation data. This change adds the inventory counting management UI to agency-webapp.

Companion changes: backend API in `inventory-system`, PDA scanning in `agency-mobile`.

## What Changes

- **New top-level menu entry**: "Kiểm kê thường nhật" → `/inventory-counting`
- **List page** with 6 status tabs (Chờ duyệt / Chờ kiểm kê / Đang kiểm kê / Chờ xác nhận / Hoàn thành / Huỷ); "Đang kiểm kê" tab has sub-tabs Kiểm kê lần 1 / lần 2 / lần 3
- **Create page**: manager selects warehouse + `typeImport` (`location_code` | `sku`) → downloads template → fills XLSX → uploads via existing `useUploadFile` hook (returns S3 URL) → one `inventoryCountingCreate` call; backend fetches + parses file; inline error table shown for failed rows
- **Edit page** (status=new): item data grid with bulk remove (`inventoryCountingRemoveItems`); add-by-location panel (rack or selected locations → `inventoryCountingAddByLocation`); add-by-variant panel (variant IDs → `inventoryCountingAddByVariant`)
- **Detail page**: summary report (locations actual/required, total qty, deviation %, anomaly count) + item data table (per-location × per-SKU; columns: location, GTIN, SKU, name, unit, condition, system qty, lần 1/lần 2/lần 3 result, deviation, anomaly); action buttons (approve, assign staff, recount, complete, cancel, export)
- **File import template**: [Input vị trí kiểm kê thường nhật](https://upbasevn.sg.larksuite.com/wiki/SGmXwseR7iGddOkgKJWl9Up9gdg) — two sheets; `typeImport` selector in the create page controls which template link is shown

## Capabilities

### New Capabilities

- `inventory-counting-work`: Web flow for work lifecycle — create work from S3-uploaded XLSX file (location_code or sku mode), edit item list on new work (add by location/variant, remove items), approve + assign staff, reassign staff, request recount (round N+1), complete, cancel, hard-delete new work, copy work
- `inventory-counting-list`: Paginated list with status tabs and sub-tabs; filters by mã kiểm kê, warehouse (multi-select, default all), date range by ngày tạo phiên (default 7 days, non-removable); "Hoàn thành" tab adds "Phát sinh chênh lệch" filter
- `inventory-counting-detail`: Per-work gridview showing all session results side-by-side; deviation highlighting; XLSX export

### Modified Capabilities

- `main-layout`: New top-level route `/inventory-counting/*` in `MainLayout/index.tsx`; new menu item "Kiểm kê thường nhật" in `MainLayout/Menu/index.tsx`

## Impact

- New pages: `src/app/pages/InventoryCounting/InventoryCountingList/`, `InventoryCountingCreate/`, `InventoryCountingDetail/`
- Modified: `src/app/pages/MainLayout/index.tsx` (new route), `src/app/pages/MainLayout/Menu/index.tsx` (new menu entry)
- New GraphQL operations (15) consumed from `inventory-system` backend:
  - Mutations: `inventoryCountingCreate`, `inventoryCountingAddLocationsByFilter`, `inventoryCountingAddLocationsByFile`, `inventoryCountingRemoveLocation`, `inventoryCountingApprove`, `inventoryCountingReassignStaff`, `inventoryCountingCancel`, `inventoryCountingDelete`, `inventoryCountingCopy`, `inventoryCountingRequestRecount`, `inventoryCountingComplete`
  - Queries: `inventoryCountingList`, `inventoryCountingDetail`, `inventoryCountingExport`, `inventoryCountingStockDelta`
- **No breaking changes** to existing warehouse management pages
- **Dependencies**: `inventory-system` backend must be deployed (with all 14 operations) before this frontend change goes live
