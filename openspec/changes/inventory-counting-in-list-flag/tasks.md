## 1. Cập nhật GraphQL query definitions

- [ ] 1.1 Thêm arg `recordId: Int` và field `inList` vào query `fulfillmentVariantStockList` (fragment/query definition)
- [ ] 1.2 Thêm arg `recordId: Int` và field `inList` vào query `locationManagerList` (fragment/query definition)

## 2. Truyền recordId từ màn hình phiếu kiểm kê

- [ ] 2.1 Trong hook/component gọi `fulfillmentVariantStockList` ở màn hình tạo/chỉnh sửa phiếu: lấy `recordId` từ route params hoặc wizard state và truyền vào query
- [ ] 2.2 Trong hook/component gọi `locationManagerList` ở màn hình tạo/chỉnh sửa phiếu: lấy `recordId` từ route params hoặc wizard state và truyền vào query

## 3. Render trạng thái đã thêm trên UI

- [ ] 3.1 Danh sách chọn variant: item có `inList: true` hiển thị badge "Đã thêm" và disable nút thêm
- [ ] 3.2 Danh sách chọn location: item có `inList: true` hiển thị badge "Đã thêm" và disable nút thêm

## 4. Refetch sau khi thêm thành công

- [ ] 4.1 Sau mutation thêm variant thành công: trigger refetch `fulfillmentVariantStockList`
- [ ] 4.2 Sau mutation thêm location thành công: trigger refetch `locationManagerList`
