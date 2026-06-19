## ADDED Requirements

### Requirement: Navigate to inventory counting list
The app SHALL provide a top-level menu entry "Kiểm kê thường nhật" in the main sidebar (not under Warehouse Management).

#### Scenario: Menu entry navigates to list
- **WHEN** manager clicks "Kiểm kê thường nhật"
- **THEN** app navigates to `/inventory-counting`

---

### Requirement: Inventory counting list with status tabs
The list SHALL show 6 status tabs: Chờ duyệt, Chờ kiểm kê, Đang kiểm kê (with sub-tabs Kiểm kê lần 1 / lần 2 / lần 3), Chờ xác nhận, Hoàn thành, Huỷ. Each tab has a count badge. Default: Chờ duyệt tab, last 7 days, all warehouses. Sorted by most recently updated first.

#### Grid columns per tab

| Tab | Columns |
|-----|---------|
| Chờ duyệt | Mã kiểm kê (link), Ngày tạo phiên, Tổng vị trí cần kiểm, SL hàng hoá (tooltip: tổng SL HT cần kiểm), Nhân viên phụ trách, Thao tác |
| Chờ kiểm kê | Same as Chờ duyệt |
| Đang kiểm kê | Mã kiểm kê, Ngày tạo phiên, Tổng vị trí cần kiểm, SL hàng hoá, Nhân viên phụ trách, Thời gian bắt đầu, Thời gian kết thúc, Trạng thái (Chờ KK/Đang KK/Đã kết thúc), Lệch (% deviation), Thao tác |
| Chờ xác nhận | Mã kiểm kê, Ngày tạo phiên, Vị trí kiểm kê (đã kiểm/cần kiểm, red if unequal), SL hàng hoá (thực tế/hệ thống, red if unequal), Nhân viên phụ trách, Thời gian bắt đầu, Thời gian kết thúc, Hàng bất thường, Lệch (%), Thao tác |
| Hoàn thành | Same as Chờ xác nhận; Nhân viên = NV hoàn thành |
| Huỷ | Same as Chờ xác nhận; Nhân viên = NV huỷ |

#### Scenario: Tabs show works by status
- **WHEN** manager opens the list
- **THEN** each tab shows works for its status with count badges

#### Scenario: Global filters applied
- **WHEN** manager applies filters
- **THEN** list updates to matching works only
- Filters available on all tabs: search by mã kiểm kê; date range by ngày tạo phiên (default 7 days, non-removable); kho multi-select (default all, removable)
- "Hoàn thành" tab only: additional filter "Phát sinh chênh lệch" (single-select: Có / Không, removable)

---

### Requirement: Row actions per status tab
Actions per tab (all via dropdown "Thao tác"):
- Chờ duyệt: Duyệt, Chỉnh sửa, Xoá, Huỷ, Sao chép
- Chờ kiểm kê: Phân công lại, Huỷ, Sao chép
- Đang kiểm kê: Huỷ, Hoàn thành phiếu — both only available when all sessions in the work have ended; supports bulk action (hàng loạt)
- Chờ xác nhận: Kiểm đếm lại (max 3 rounds; error if already 3), Huỷ (only when sessions ended); supports bulk action (hàng loạt)
- Hoàn thành / Huỷ: Sao chép

#### Scenario: Duyệt opens assign staff and approves
- **WHEN** manager clicks Duyệt and assigns staff
- **THEN** `inventoryCountingApprove` called; work → Chờ kiểm kê

#### Scenario: Xoá with confirmation hard-deletes work
- **WHEN** manager clicks Xoá and confirms
- **THEN** `inventoryCountingDelete` called; work removed from list

#### Scenario: Huỷ with confirmation cancels work
- **WHEN** manager clicks Huỷ and confirms
- **THEN** `inventoryCountingCancel` called; work → Huỷ tab

#### Scenario: Sao chép creates new work
- **WHEN** manager clicks Sao chép
- **THEN** `inventoryCountingCopy` called; new work in Chờ duyệt tab

---

### Requirement: Create inventory counting work wizard
Two-step wizard. Step 1: popup with kho (single select, default last used), nhãn hàng (multi-select, default all), loại dữ liệu đầu vào (Theo vị trí | Theo SKU hàng hoá, default Theo vị trí), ghi chú (max 255 chars), file upload (max 5 MB, max 250 rows); Chấp nhận → work created (status=Chờ duyệt) → navigate to detail page in edit mode (Step 2). Step 2 is the Chờ duyệt detail page itself.

#### Scenario: Step 1 creates work
- **WHEN** manager fills popup and clicks Chấp nhận
- **THEN** `inventoryCountingCreate` called; work created (status=Chờ duyệt); manager lands on detail page in edit mode

#### Scenario: Add locations by filter (edit mode)
- **WHEN** manager opens "Thêm nhanh" in vị trí mode and selects khu vực → kệ → vị trí and confirms
- **THEN** `inventoryCountingAddLocationsByFilter` called; locations appear in grid

#### Scenario: Add by SKU (edit mode)
- **WHEN** manager opens "Thêm nhanh" in SKU mode and selects kho → đối tác → loại HH → trạng thái → hàng hoá and confirms
- **THEN** `inventoryCountingAddLocationsByFile` called; rows appear in grid

#### Scenario: Remove item from grid (edit mode)
- **WHEN** manager clicks delete icon on a row and confirms
- **THEN** `inventoryCountingRemoveLocation` called; row removed

#### Scenario: Approve from edit mode
- **WHEN** manager clicks Duyệt and assigns staff
- **THEN** `inventoryCountingApprove` called; work → Chờ kiểm kê

#### Scenario: Save without approving
- **WHEN** manager clicks Lưu lại
- **THEN** work stays in Chờ duyệt; edits persisted

---

### Requirement: Detail page — edit mode (status = Chờ duyệt)
Detail page in edit mode shows two sections:
- **I. Thông tin phiếu**: Kho (disabled), Mã kiểm kê, Ghi chú (editable)
- **II. Gridview** with toggle "Xem theo vị trí" / "Xem theo SKUs":
  - Vị trí mode columns: Mã vị trí, Tổng SKUs, Tổng số lượng kiểm đếm, [Xoá]
  - SKU mode columns: Mã SKU, Mã GTIN, Tên hàng hoá, Tổng vị trí, Tổng số lượng, [Xoá]
  - Summary above grid: Tổng vị trí, Tổng SKUs, Tổng số lượng
- **III. Action panel**: Thêm nhanh button (follows current view mode), Duyệt, Lưu lại

---

### Requirement: Detail page — view mode (all statuses except Chờ duyệt)
Detail page in view mode shows:
- **I. Thông tin phiếu**: Mã phiếu, Trạng thái, Người tạo, Thời gian tạo, Người hoàn thành, Thời gian hoàn thành
- **II. Báo cáo chung**: Vị trí (thực tế / cần kiểm), Số lượng (thực tế / hệ thống), Lệch (absolute + %), Bất thường (count)
- **III. Bảng dữ liệu** (12 columns): Mã vị trí, Mã GTIN, Mã SKU, Tên hàng hoá, ĐVT, Tình trạng hàng hoá, SL hệ thống*, Kết quả lần 1, Kết quả lần 2, Kết quả lần 3, Chênh lệch, Bất thường
  - Search: by mã vị trí and tên hàng hoá
  - ☐ Hiển thị kết quả bị chênh lệch và bất thường (default unchecked)
  - ☐ Hiển thị các vị trí chưa kiểm kê (default unchecked)
- **IV. Xuất dữ liệu**: export button → `inventoryCountingExport` → file `Kiemke<MãPhiếu>.xlsx`
- **V. Action buttons** (vary by status):
  - Chờ kiểm kê: Phân công lại, Huỷ
  - Đang kiểm kê: Huỷ, Hoàn thành phiếu
  - Chờ xác nhận: Kiểm đếm lại, Huỷ
  - Hoàn thành: no action buttons (Tạo luân chuyển out of scope)
  - Huỷ: no action buttons

*SL hệ thống: if stock changed after the latest counting session ended (inbound/outbound transactions), the cell shows a delta indicator. Clicking it opens a popup "Thông tin thay đổi tồn" with: Mã vị trí, Mã SKU, Mã GTIN, and a table of Loại (Nhập/Xuất), Số lượng, Phiếu liên quan. Requires a separate `inventoryCountingStockDelta` query.

#### Scenario: Load detail page
- **WHEN** manager clicks a work code link
- **THEN** detail page loads in the appropriate mode (edit if Chờ duyệt, view otherwise)

#### Scenario: Filter discrepant and anomalous rows
- **WHEN** manager enables "Hiển thị kết quả bị chênh lệch và bất thường"
- **THEN** table shows only rows with chênh lệch ≠ 0 or bất thường = true

#### Scenario: Filter unchecked locations
- **WHEN** manager enables "Hiển thị các vị trí chưa kiểm kê"
- **THEN** table shows rows where latest session counted_qty IS NULL

#### Scenario: Stock delta popup
- **WHEN** manager clicks a SL hệ thống cell that has a delta indicator
- **THEN** `inventoryCountingStockDelta` called; popup shows transaction breakdown for that location×SKU

---

### Requirement: Recount and complete from detail
Kiểm đếm lại available on Chờ xác nhận works with < 3 sessions. Hoàn thành phiếu available on Đang kiểm kê works with all sessions ended.

#### Scenario: Request recount creates next session
- **WHEN** manager clicks Kiểm đếm lại and confirms
- **THEN** `inventoryCountingRequestRecount` called; work → Đang kiểm kê (next round sub-tab)

#### Scenario: Complete work
- **WHEN** manager clicks Hoàn thành phiếu and confirms
- **THEN** `inventoryCountingComplete` called; work → Hoàn thành tab

---

### Requirement: Export results
Detail page SHALL have an export button that downloads the gridview as `Kiemke<WorkCode>.xlsx`.

#### Scenario: Export downloads file
- **WHEN** manager clicks export
- **THEN** `inventoryCountingExport` called; browser downloads XLSX
