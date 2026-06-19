## ADDED Requirements

### Requirement: Webapp truyền recordId khi gọi locationManagerList
Webapp SHALL truyền `recordId` của phiếu kiểm đang chỉnh sửa vào arg `recordId` của query `locationManagerList` khi manager mở modal chọn location để thêm vào phiếu.

#### Scenario: recordId được truyền khi mở modal chọn location
- **WHEN** manager mở màn hình tạo/chỉnh sửa phiếu kiểm và mở danh sách chọn location
- **THEN** query `locationManagerList` được gọi với `recordId` của phiếu đang mở

### Requirement: Location có inList true hiển thị trạng thái đã thêm
Webapp SHALL hiển thị trạng thái "Đã thêm" trên item location có `inList: true`. Nút thêm SHALL bị disabled hoặc ẩn. Item có `inList: false` hiển thị bình thường.

#### Scenario: Location đã thêm hiển thị badge và disabled
- **WHEN** danh sách chọn location load xong với `inList` data từ server
- **THEN** location có `inList: true` hiển thị badge "Đã thêm" và nút thêm bị disabled

#### Scenario: Location chưa thêm hiển thị nút thêm bình thường
- **WHEN** danh sách chọn location load xong
- **THEN** location có `inList: false` hiển thị nút thêm active như trước

### Requirement: Danh sách inList được cập nhật sau khi thêm location thành công
Sau khi mutation thêm location thành công, webapp SHALL refetch `locationManagerList` để cập nhật `inList`.

#### Scenario: inList cập nhật sau khi thêm
- **WHEN** manager thêm location thành công
- **THEN** danh sách chọn location được refetch và location vừa thêm hiển thị trạng thái "Đã thêm"
