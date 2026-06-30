# [Tên feature]

> File này là ví dụ mẫu. Thay thế nội dung trong [ ] bằng thông tin thực tế của bạn.
> Xoá các dòng ghi chú (bắt đầu bằng >) trước khi import vào sandbox.

---

## Context

| | |
|---|---|
| **Feature** | [Tên feature ngắn gọn] |
| **Màn hình** | [Tên màn hình — ví dụ: Danh sách xử lý] |
| **Route** | [Route — ví dụ: `/outbound-manage/processing-list-test`] |
| **Đối tượng** | [Ai sẽ dùng — ví dụ: Nhân viên vận hành kho] |
| **Mục đích** | [Một câu mô tả mục đích — ví dụ: Phân công nhân viên cho nhiều đơn cùng lúc] |

---

## Các bước thực hiện

> Liệt kê tuần tự. Nếu có nhiều nhánh (ví dụ: huỷ vs xác nhận), ghi rõ từng nhánh.

```
Bước 1: [Người dùng làm gì]
Bước 2: [Hệ thống phản hồi gì]
Bước 3: [Người dùng làm gì tiếp theo]
  └─ Nhánh A — [tên hành động]: [điều gì xảy ra]
  └─ Nhánh B — [tên hành động]: [điều gì xảy ra]
Bước 4: [...]
```

**Ví dụ đã điền:**
```
Bước 1: Người dùng tick checkbox 1 hoặc nhiều dòng trong bảng
Bước 2: Nút "Thao tác hàng loạt" trở nên active
Bước 3: Click "Thao tác hàng loạt" → dropdown hiện ra
Bước 4: Chọn "Phân công nhân viên" → popup mở
Bước 5: Chọn nhân viên từ dropdown "Chọn nhân viên xử lý"
  └─ Nhánh A — Click "Huỷ": đóng popup, quay lại danh sách
  └─ Nhánh B — Click "Đồng ý": hiện loading ~1 giây
Bước 6: Popup "Kết quả xử lý" mở ra
Bước 7: Click "Đóng" → đóng popup, xoá selection, quay lại danh sách
```

---

## Các thành phần giao diện

> Liệt kê từng popup / drawer / form xuất hiện trong flow.
> Quan trọng: ghi rõ tên chính xác của mọi nút và lựa chọn.

### [Tên popup / màn hình 1]

```
Tiêu đề    : "[Tên tiêu đề]"
Nội dung   : [Mô tả những gì hiển thị bên trong]
Nút / CTA  :
  - "[Tên nút 1]" → [tác dụng]
  - "[Tên nút 2]" → [tác dụng]
```

### [Tên popup / màn hình 2]

```
Tiêu đề    : "[Tên tiêu đề]"
Nội dung   :
  - [Dòng thông tin 1]
  - [Dòng thông tin 2]
  - Bảng gồm các cột: [Cột 1], [Cột 2]
Nút / CTA  :
  - "[Tên nút]" → [tác dụng]
```

**Ví dụ đã điền:**

```
=== Popup: Phân công nhân viên ===
Tiêu đề    : "Phân công nhân viên"
Nội dung   : Dropdown chọn nhân viên, placeholder "Chọn nhân viên xử lý"
Nút / CTA  :
  - "Huỷ"   → đóng popup
  - "Đồng ý" → xác nhận (disabled nếu chưa chọn nhân viên)

=== Popup: Kết quả xử lý ===
Tiêu đề    : "Kết quả xử lý"
Nội dung   :
  - Số lượng phiếu cần phân công: [tổng]
  - Số lượng phân công thành công: [n]
  - Số lượng phân công thất bại: [n]
  - Bảng lỗi gồm 2 cột: "Mã danh sách xử lý" và "Lỗi"
Nút / CTA  :
  - "Đóng" → đóng popup, xoá selection
```

---

## Giới hạn prototype

> Liệt kê những gì KHÔNG nên xảy ra trong bản sandbox này.

- [ ] Không gọi API thật — dùng mock data
- [ ] Không điều hướng sang trang / màn hình khác
- [ ] [Thêm giới hạn khác nếu có]

**Dữ liệu mock (nếu cần mô tả):**
```
[Mô tả dữ liệu giả sẽ hiển thị — ví dụ: kết quả luôn thất bại với lỗi "Không thể phân công"]
```

---

## Ghi chú thêm

> Những điều không fit vào phần nào ở trên — ràng buộc đặc biệt, trạng thái edge case, yêu cầu thiết kế cụ thể.

- [Ghi chú 1]
- [Ghi chú 2]
