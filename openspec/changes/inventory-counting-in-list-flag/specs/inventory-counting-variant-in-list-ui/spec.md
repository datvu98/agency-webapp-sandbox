## ADDED Requirements

### Requirement: Webapp truyền recordId khi gọi fulfillmentVariantStockList
Webapp SHALL truyền `recordId` của phiếu kiểm đang chỉnh sửa vào arg `recordId` của query `fulfillmentVariantStockList` khi manager mở modal chọn variant để thêm vào phiếu.

#### Scenario: recordId được truyền khi mở modal chọn variant
- **WHEN** manager mở màn hình tạo/chỉnh sửa phiếu kiểm và mở danh sách chọn variant
- **THEN** query `fulfillmentVariantStockList` được gọi với `recordId` của phiếu đang mở

### Requirement: Variant có inList true hiển thị trạng thái đã thêm
Webapp SHALL hiển thị trạng thái "Đã thêm" trên item variant có `inList: true`. Nút thêm SHALL bị disabled hoặc ẩn. Item có `inList: false` hiển thị bình thường.

#### Scenario: Variant đã thêm hiển thị badge và disabled
- **WHEN** danh sách chọn variant load xong với `inList` data từ server
- **THEN** variant có `inList: true` hiển thị badge "Đã thêm" và nút thêm bị disabled

#### Scenario: Variant chưa thêm hiển thị nút thêm bình thường
- **WHEN** danh sách chọn variant load xong
- **THEN** variant có `inList: false` hiển thị nút thêm active như trước

### Requirement: Danh sách inList được cập nhật sau khi thêm variant thành công
Sau khi mutation thêm variant thành công, webapp SHALL refetch `fulfillmentVariantStockList` để cập nhật `inList`.

#### Scenario: inList cập nhật sau khi thêm
- **WHEN** manager thêm variant thành công
- **THEN** danh sách chọn variant được refetch và variant vừa thêm hiển thị trạng thái "Đã thêm"
