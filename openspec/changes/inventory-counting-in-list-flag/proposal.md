## Why

Backend đã bổ sung `inList: Boolean` flag vào `fulfillmentVariantStockList` và `locationManagerList`. Webapp cần cập nhật để truyền `recordId` và hiển thị trạng thái "đã thêm" trên mỗi item trong danh sách chọn khi manager tạo/chỉnh sửa phiếu kiểm kê.

## What Changes

- Cập nhật GraphQL query `fulfillmentVariantStockList`: thêm arg `recordId` và field `inList` vào query definition.
- Cập nhật GraphQL query `locationManagerList`: thêm arg `recordId` và field `inList` vào query definition.
- Màn hình tạo/chỉnh sửa phiếu kiểm kê: truyền `recordId` của phiếu đang mở khi gọi 2 query trên.
- Render badge/disabled state "Đã thêm" trên mỗi item có `inList: true` trong danh sách chọn variant và location.

## Capabilities

### New Capabilities

- `inventory-counting-variant-in-list-ui`: Hiển thị trạng thái "đã thêm" trên danh sách chọn variant trong màn hình tạo phiếu kiểm kê.
- `inventory-counting-location-in-list-ui`: Hiển thị trạng thái "đã thêm" trên danh sách chọn location trong màn hình tạo phiếu kiểm kê.

### Modified Capabilities

## Impact

- GraphQL query definitions cho `fulfillmentVariantStockList` và `locationManagerList`
- Component/hook gọi 2 query trên trong màn hình tạo/chỉnh sửa phiếu kiểm kê
- UI components danh sách chọn variant và location (thêm visual indicator cho `inList`)
- Phụ thuộc: backend inventory-system phải deploy `inventory-counting-in-list-flag` trước
