## 1. Navigation & Menu

- [ ] 1.1 Add new parent menu group `{ key: "kiem-ke", label: "Kiểm kê", children: [{ key: "inventory-counting", label: "Kiểm kê thường nhật", link: "/inventory-counting" }] }` in `src/app/pages/MainLayout/Menu/index.tsx` (after `warehouse-manage`, before `chats_setting`); add `/inventory-counting/*` route in `src/app/pages/MainLayout/index.tsx`
- [ ] 1.2 Create `src/app/pages/InventoryCounting/index.tsx` as the top-level page router with sub-routes: `""` → `InventoryCountingList`, `"create"` → `InventoryCountingCreate`, `":id"` → `InventoryCountingDetail`; create `src/app/pages/InventoryCounting/Loadable.ts` with lazy exports

## 2. GraphQL Files

- [ ] 2.1 Create `src/graphql/queries/query_inventoryCountingList.ts` — variables: `page, limit, status, warehouseId, code, fromDate, toDate`; fields: `success message total page limit data { id code status warehouseId warehouseName sessionCount assignedTo totalLocationRequest totalLocationCounted avgDiff createdBy createdAt }`
- [ ] 2.2 Create `src/graphql/queries/query_inventoryCountingDetail.ts` — variables: `recordId: Int!, page, limit`; fields: `success message data { id code status method note warehouseId warehouseName sessionCount assignedTo createdBy approvedBy completedBy cancelledBy startedAt countedAt completedAt totalLocationRequest totalLocationCounted totalSkuRequest totalSkuCounted totalStockRequest totalStockCounted totalVariantDiff avgDiff totalItems currentPage sessions { id code sessionNumber status picId startedAt endedAt } items { id locationCode sku gtin productName unit session1SystemQty session1CountedQty session1Diff session1IsAnomaly session1AnomalyQty session1IsUnexpected session2SystemQty session2CountedQty session2Diff session2IsAnomaly session2AnomalyQty session2IsUnexpected session3SystemQty session3CountedQty session3Diff session3IsAnomaly session3AnomalyQty session3IsUnexpected } }`
- [ ] 2.3 Create `src/graphql/queries/query_inventoryCountingExport.ts` — variables: `recordId: Int!`; fields: `success message data { url }`
- [ ] 2.4 Create `src/graphql/mutations/mutate_inventoryCountingCreate.ts` — variables: `warehouseId: Int!, fileImportLink: String!, typeImport: String!`; fields: `success message data { id code totalRows successCount failCount errors { row code reason } }`
- [ ] 2.5 Create `src/graphql/mutations/mutate_inventoryCountingAddByLocation.ts` — variables: `recordId: Int!, rackId: Int, locationIds: [Int!]`; fields: `success message data { addedCount }`
- [ ] 2.6 Create `src/graphql/mutations/mutate_inventoryCountingAddByVariant.ts` — variables: `recordId: Int!, variantIds: [String!]!`; fields: `success message data { addedCount }`
- [ ] 2.7 Create `src/graphql/mutations/mutate_inventoryCountingRemoveItems.ts` — variables: `recordId: Int!, recordItemIds: [Int!]!`; fields: `success message`
- [ ] 2.8 Create `src/graphql/mutations/mutate_inventoryCountingApprove.ts` — variables: `recordId: Int!, staffOpenId: String!`; fields: `success message`
- [ ] 2.9 Create `src/graphql/mutations/mutate_inventoryCountingReassignStaff.ts` — variables: `recordId: Int!, staffOpenId: String!`; fields: `success message`
- [ ] 2.10 Create `src/graphql/mutations/mutate_inventoryCountingCancel.ts` — variables: `recordId: Int!`; fields: `success message`
- [ ] 2.11 Create `src/graphql/mutations/mutate_inventoryCountingDelete.ts` — variables: `recordId: Int!`; fields: `success message`
- [ ] 2.12 Create `src/graphql/mutations/mutate_inventoryCountingCopy.ts` — variables: `recordId: Int!`; fields: `success message data { id code }`
- [ ] 2.13 Create `src/graphql/mutations/mutate_inventoryCountingRequestRecount.ts` — variables: `recordId: Int!`; fields: `success message data { sessionId sessionCode sessionNumber }`
- [ ] 2.14 Create `src/graphql/mutations/mutate_inventoryCountingComplete.ts` — variables: `recordId: Int!`; fields: `success message`
- [ ] 2.15 Create `src/graphql/queries/query_inventoryCountingStockDelta.ts` — variables: `recordId: Int!, locationCode: String!, sku: String!`; fields: `success message data { locationCode sku gtin transactions { type qty relatedCode } }`

## 3. List Page — `InventoryCountingList/`

- [ ] 3.1 Create `index.tsx`: call `inventoryCountingList`; render 6-tab `StatusTabs` component
- [ ] 3.2 Create `components/StatusTabs.tsx`: tabs — Chờ duyệt (`new`) / Chờ kiểm kê (`approved`) / Đang kiểm kê (`counting`) / Chờ xác nhận (`counted`) / Hoàn thành (`completed`) / Huỷ (`cancelled`)
- [ ] 3.3 Create `components/InProgressSubTabs.tsx`: sub-tabs Kiểm kê lần 1 / lần 2 / lần 3 inside "Đang kiểm kê" tab; filter by `session_count`
- [ ] 3.4 Create `components/FilterBar.tsx`: filters by warehouse, date range (created_at), work code search
- [ ] 3.5 Create `components/InventoryCountingRow.tsx`: columns — code, warehouse, created_by, assigned_to, location count, status badge, action buttons (copy, delete for `new`; cancel for non-terminal)
- [ ] 3.6 Wire "Tạo phiếu" button → navigate to create page
- [ ] 3.7 Wire row click → navigate to detail page

## 4. Create Page — `InventoryCountingCreate/`

- [ ] 4.1 Create `index.tsx`: render warehouse selector + `TypeImportSelector` + `FileUploadPanel`; on submit: call `useUploadFile(file)` → get S3 URL → call `inventoryCountingCreate({ warehouseId, fileImportLink: s3Url, typeImport })`; on success navigate to edit page; on partial failure render `ImportResultTable`
- [ ] 4.2 Create `components/TypeImportSelector.tsx`: radio/select between `location_code` (sheet "Theo mã vị trí") and `sku` (sheet "Theo SKU hàng hoá"); changing selection updates the template download link shown below
- [ ] 4.3 Create `components/FileUploadPanel.tsx`: `.xlsx` upload widget; template download link ([Tải file mẫu](https://upbasevn.sg.larksuite.com/wiki/SGmXwseR7iGddOkgKJWl9Up9gdg)) that updates with `typeImport` selection; uses `useUploadFile` from `src/app/pages/Campaigns/ListCampainEdit/hooks/useUploadFile.ts`
- [ ] 4.4 Create `components/ImportResultTable.tsx`: inline table showing `failCount` error rows (`{ row, code, reason }`) after create; shown only when `failCount > 0`

## 4b. Edit Page — `InventoryCountingEdit/` (status=new only)

- [ ] 4b.1 Create `index.tsx`: load current record_items via `inventoryCountingDetail`; render `ItemDataGrid` + add panels
- [ ] 4b.2 Create `components/ItemDataGrid.tsx`: table of current record_items with checkboxes; "Xóa" button for checked rows calls `inventoryCountingRemoveItems({ recordId, recordItemIds })`
- [ ] 4b.3 Create `components/AddByLocationPanel.tsx`: rack selector (single select) OR location multi-select (mutually exclusive); "Thêm" calls `inventoryCountingAddByLocation`; shows `addedCount` toast on success
- [ ] 4b.4 Create `components/AddByVariantPanel.tsx`: variant multi-select (search by SKU/name); "Thêm" calls `inventoryCountingAddByVariant`; shows `addedCount` toast on success

## 5. Detail Page — `InventoryCountingDetail/`

- [ ] 5.1 Create `index.tsx`: call `inventoryCountingDetail`; render `SummaryReport` + `ItemDataTable` + action bar
- [ ] 5.2 Create `components/SummaryReport.tsx`: total_location_request / total_location_counted, total_sku_request / total_sku_counted, total_stock_request / total_stock_counted, avg_diff %, anomaly count; session tabs for lần 1 / lần 2 / lần 3
- [ ] 5.3 Create `components/ItemDataTable.tsx`: paginated; 12 columns — location_code, GTIN, SKU, product name, unit, condition; grouped session columns lần 1 (system qty / counted qty / diff / anomaly), lần 2, lần 3; SL hệ thống shows delta indicator when stock changed post-session; highlight `diff ≠ 0` cells; anomaly badge
- [ ] 5.4 Create `components/AssignStaffPopup.tsx`: staff selector; shared for approve (`inventoryCountingApprove`) and reassign (`inventoryCountingReassignStaff`)
- [ ] 5.5 Create `components/RecountConfirmPopup.tsx`: confirm recount; calls `inventoryCountingRequestRecount`; display error if `session_count = 3` or no qualifying items
- [ ] 5.6 Create `components/CompleteConfirmPopup.tsx`: confirm completion; calls `inventoryCountingComplete`
- [ ] 5.7 Wire "Duyệt" button → `AssignStaffPopup` → `inventoryCountingApprove`
- [ ] 5.8 Wire "Phân công lại" button (approved status) → `AssignStaffPopup` → `inventoryCountingReassignStaff`
- [ ] 5.9 Wire "Yêu cầu kiểm lại" button (counted status, session_count < 3) → `RecountConfirmPopup`
- [ ] 5.10 Wire "Hoàn thành" button (counted status) → `CompleteConfirmPopup`
- [ ] 5.11 Wire "Huỷ" button → confirm dialog → `inventoryCountingCancel`
- [ ] 5.12 Create `components/ExportButton.tsx`: call `inventoryCountingExport`; open signed S3 URL on success
- [ ] 5.13 Detail `index.tsx` branches on `status`: render edit mode layout when `status === 'new'` (Chờ duyệt), view mode layout for all other statuses
- [ ] 5.14 Edit mode layout: `EditModeHeader` (Kho disabled, Mã KK, Ghi chú editable) + `ViewToggle` + `LocationGridView`/`SkuGridView` (toggle) + `AddQuickPanel` + `EditActionBar` (Duyệt, Lưu lại) with `dialogs/ApproveDialog`, `AddByLocationDialog`, `AddBySkuDialog`, `RemoveItemDialog`
- [ ] 5.15 View mode `ItemDataTable`: SL hệ thống column shows delta indicator when stock changed after latest session; clicking the cell opens `dialogs/StockDeltaDialog` which calls `inventoryCountingStockDelta` and renders table of Loại / Số lượng / Phiếu liên quan
- [ ] 5.16 Create `dialogs/StockDeltaDialog.tsx`: title "Thông tin thay đổi tồn"; displays Mã vị trí, Mã SKU, Mã GTIN; table columns: Loại (Nhập/Xuất), Số lượng, Phiếu liên quan
