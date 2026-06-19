## Context

Backend (inventory-system) đã thêm:
- `fulfillmentVariantStockList(recordId?: Int)` → `VariantStockItem.inList?: Boolean`
- `locationManagerList(recordId?: Int)` → `LocationManager.inList?: Boolean`

Webapp hiện có màn hình tạo/chỉnh sửa phiếu kiểm kê (wizard 2 bước). Bước 2 cho phép manager thêm hàng hoá theo variant hoặc thêm vị trí theo location. 2 query trên được gọi tại đây nhưng chưa truyền `recordId` và chưa dùng `inList`.

## Goals / Non-Goals

**Goals:**
- Truyền `recordId` khi gọi `fulfillmentVariantStockList` và `locationManagerList` trong màn hình tạo/chỉnh sửa phiếu
- Render badge/disabled state "Đã thêm" trên item có `inList: true`

**Non-Goals:**
- Không thay đổi logic thêm/xoá items
- Không handle realtime sync — user refresh để cập nhật `inList`

## Decisions

### D1: Truyền `recordId` từ route/state của màn hình

`recordId` được lấy từ route params hoặc state của wizard (phiếu được tạo ở step 1, `recordId` có sẵn khi mở step 2). Không cần thêm state mới.

### D2: `inList: true` → disabled button, badge "Đã thêm"

Item đã có `inList: true` sẽ hiển thị badge "Đã thêm" và disable nút thêm. Tránh duplicate từ phía UI (server cũng đã deduplicate).

### D3: Refetch sau khi thêm item thành công

Sau mỗi mutation thêm variant/location thành công, trigger refetch `fulfillmentVariantStockList` và `locationManagerList` để cập nhật `inList`. Tránh stale state.

## Risks / Trade-offs

- **Stale `inList`:** Nếu không refetch, badge "Đã thêm" sẽ không hiện ngay sau khi add. Xử lý bằng D3.

## Migration Plan

Backend deploy trước. Webapp chỉ update query và UI — không breaking change.

## Open Questions

Không còn câu hỏi mở.
