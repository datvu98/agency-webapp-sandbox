# Hướng dẫn chuẩn bị input cho flow-to-ui

Tài liệu này giúp PO chuẩn bị file `.md` để đưa vào sandbox và chạy skill `flow-to-ui`.

---

## Quy trình tổng quan

```
Bạn thảo luận feature     Yêu cầu AI tóm tắt     Import file .md
với AI bất kỳ          →  thành file .md       →  vào sandbox
(Claude / ChatGPT /                                     │
 Gemini / ...)                                          ▼
                                                 Skill đọc file
                                                 kiểm tra đủ 5 điều
                                                        │
                                              ┌─────────┴──────────┐
                                              ▼                     ▼
                                         Đủ thông tin         Thiếu thông tin
                                              │                     │
                                              ▼                     ▼
                                        Tóm tắt lại          Hỏi bạn 1 câu
                                        để bạn xác nhận      trước khi tiếp
                                              │
                                              ▼
                                         Build UI
```

---

## Prompt tóm tắt cuộc trò chuyện

Sau khi thảo luận xong về một feature, gửi prompt này cho AI:

```
Hãy tóm tắt cuộc trò chuyện của chúng ta thành một file markdown.
Bao gồm:
- Tên feature và mục đích
- Màn hình / route nó nằm ở đâu
- Các bước người dùng thực hiện theo thứ tự
- Tên chính xác của từng nút, dropdown option, tiêu đề popup, placeholder
- Những gì KHÔNG nên xảy ra (không gọi API, không chuyển trang,...)
- Đối tượng người dùng
```

---

## 5 điều cần có

### 1 — Màn hình (bắt buộc)

Feature này nằm ở màn hình nào?

| | Ví dụ |
|---|---|
| ✅ Tốt | "Màn hình Danh sách xử lý, route `/outbound-manage/processing-list`" |
| ✅ Được | "Màn hình quản lý chiến dịch" |
| ❌ Thiếu | Không đề cập gì đến màn hình |

---

### 2 — Các bước thực hiện (bắt buộc)

Mô tả từng bước: người dùng làm gì, hệ thống phản hồi gì.

✅ Đúng cách:
```
1. Người dùng tick checkbox các dòng muốn chọn
2. Click nút "Thao tác hàng loạt"
3. Chọn "Phân công nhân viên" từ dropdown
4. Popup mở ra → chọn nhân viên → click "Đồng ý"
5. Hiện loading → popup kết quả xuất hiện
6. Click "Đóng" → quay lại danh sách
```

❌ Quá chung chung: `"Người dùng phân công nhân viên cho danh sách"`

---

### 3 — Tên chính xác mọi nút và lựa chọn (bắt buộc)

Đây là điều hay bị bỏ sót nhất. Cần liệt kê rõ tên của:

- Nút bấm
- Từng option trong dropdown
- Tiêu đề popup / modal
- Placeholder của ô input

✅ Ví dụ đúng:
```
Nút bulk action   : "Thao tác hàng loạt"
Dropdown options  : chỉ có 1 option → "Phân công nhân viên"
Tiêu đề popup     : "Phân công nhân viên"
Placeholder input : "Chọn nhân viên xử lý"
Nút huỷ           : "Huỷ"
Nút xác nhận      : "Đồng ý"
Tiêu đề popup kq  : "Kết quả xử lý"
Nút đóng          : "Đóng"
```

❌ Thiếu: `"Có dropdown với các action, popup chọn nhân viên, popup kết quả"`

> **Tại sao quan trọng?**
> Nếu không có tên chính xác, developer sẽ tự bịa hoặc copy từ màn hình khác — cả hai đều sai.

---

### 4 — Những gì KHÔNG nên xảy ra (bắt buộc)

Nói rõ giới hạn của bản prototype này.

✅ Ví dụ:
```
- Không gọi API thật → dùng mock data
- Không điều hướng sang trang khác
- Popup kết quả chỉ hiện dữ liệu giả
```

> Nếu không có phần này, developer sẽ tự động kết nối API thật và điều hướng sang màn hình khác.

---

### 5 — Context (không bắt buộc, nhưng hữu ích)

Tên feature, đối tượng người dùng, mục đích chính.

Một dòng là đủ:
```
Feature phân công hàng loạt, dành cho nhân viên vận hành kho (fulfillment user)
```

---

## Mẹo khi AI tóm tắt chưa đủ

| Vấn đề | Yêu cầu thêm |
|---|---|
| Thiếu tên nút / option | "Liệt kê tên chính xác của từng nút và từng option trong dropdown" |
| Không có giới hạn prototype | "Ghi rõ những gì KHÔNG nên xảy ra trong bản prototype" |
| Bước quá chung chung | "Mô tả chi tiết hơn từng bước, kể cả trạng thái loading và thông báo lỗi" |

---

## Xem thêm

- `references/sample.md` — file `.md` mẫu hoàn chỉnh để tham khảo
