---
unit: 002-goods-status-conversion-ui
unit_type: frontend
default_bolt_type: simple-construction-bolt
intent: 002-goods-status-conversion
phase: inception
status: draft
created: 2026-06-22T00:00:00+07:00
updated: 2026-06-22T00:00:00+07:00
---

# Unit Brief: Goods Status Conversion UI

## Purpose

PDA mobile application screens cho nhân viên kho thực hiện toàn bộ flow chuyển đổi trạng thái:
scan location → scan item → nhập trạng thái mới → quản lý danh sách phiên → chốt phiên.

## Scope

### In Scope
- **PDA**: Màn hình quét vị trí và hiển thị kết quả xác thực
- **PDA**: Màn hình quét hàng hoá và hiển thị kết quả xác thực
- **PDA**: Form nhập trạng thái mới + ghi chú; popup xác nhận khi target = NEW
- **PDA**: Màn hình danh sách phiên làm việc (xem, xoá bản ghi, tiếp tục quét, kết thúc phiên)
- **PDA**: Màn hình kết quả commit (thành công / lỗi, quay lại list nếu có lỗi)
- **Web**: Trang danh sách phiếu chuyển đổi trạng thái (Mã phiếu, Nhân viên, Số bản ghi, Thời gian)
- **Web**: Trang chi tiết phiếu chuyển đổi trạng thái (SKU, Hàng hoá, Trạng thái chuyển đổi, Số lượng, Thời gian)

### Out of Scope
- Business logic và validation rules → Unit 001
- Inventory mutation → Unit 001

---

## Assigned Requirements

| FR | Requirement (UI layer) | Priority |
|----|------------------------|----------|
| FR-1 | Màn hình bắt đầu phiên | Must |
| FR-2 | Scan location screen + validation error display | Must |
| FR-3 | Scan item screen + validation error display | Must |
| FR-4 | Status input form + confirm popup for → NEW | Must |
| FR-5 | Session list — hiển thị bản ghi vừa thêm | Must |
| FR-6 | Session list — xoá bản ghi | Must |
| FR-7 | Commit action + result screen | Must |
| FR-11 | Web list page: danh sách phiếu chuyển đổi | Must |
| FR-12 | Web detail page: phiếu header + successful conversion records table | Must |

---

## Domain Concepts

### Key Screens

| Screen | Description |
|--------|-------------|
| Scan Location | Hiển thị camera/scanner prompt, nhận barcode, gọi validate API, hiển thị lỗi hoặc chuyển sang Scan Item |
| Scan Item | Nhận barcode hàng hoá, gọi validate API, hiển thị lỗi hoặc mở Status Form |
| Status Input Form | Hiển thị trạng thái hiện tại, picker trạng thái đích, field ghi chú; confirm popup nếu target = NEW |
| Session List | Danh sách bản ghi trong phiên; swipe/button xoá; nút "Continue" và "Commit" |
| Commit Result | Danh sách bản ghi: success/failed; retry hoặc kết thúc |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 7 |
| Must Have | 7 |
| Should Have | 0 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-scan-location-screen | Scan Location Screen | Must | Planned |
| 002-scan-item-screen | Scan Item Screen | Must | Planned |
| 003-status-input-form | Status Input Form | Must | Planned |
| 004-session-list-screen | Session List Screen | Must | Planned |
| 005-commit-result-screen | Commit Result Screen | Must | Planned |
| 006-conversion-detail-web-page | Conversion Bill Detail Web Page | Must | Planned |
| 007-bill-list-web-page | Conversion Bill List Web Page | Must | Planned |

---

## Dependencies

### Depends On

| Unit | Reason |
|------|--------|
| 001-goods-status-conversion-service | All REST APIs (session, validate, add, delete, commit) |

### External Dependencies

| System | Purpose | Risk |
|--------|---------|------|
| UI/UX Design | PDA + Web screen designs (đã chốt) | https://claude.ai/design/p/86469589-f5e3-4fc0-9305-cfe199a8f4e8?file=Goods+Status+Conversion.dc.html&via=share |

---

## Technical Context

### Suggested Technology
- React Native (per UpS mobile stack for SmartFulfillment PDA)
- Barcode scanner integration (existing PDA scanner SDK from intent 001)

### Integration Points

| Integration | Type | Protocol |
|-------------|------|----------|
| Unit 001 REST API | API calls | REST / HTTP |
| PDA Barcode Scanner | Hardware SDK | Native module |

---

## Constraints

- PDA screen: small display, barcode scanner input — minimal typing
- Error messages must display inline, clear Vietnamese text per spec
- UI/UX designs available: https://claude.ai/design/p/86469589-f5e3-4fc0-9305-cfe199a8f4e8?file=Goods+Status+Conversion.dc.html&via=share

---

## Success Criteria

### Functional
- [ ] Full flow: scan location → scan item → set status → list → commit works on PDA
- [ ] Each validation error shows the correct Vietnamese message
- [ ] Confirm popup appears when and only when target status = NEW
- [ ] Deleted records disappear from list; can re-scan immediately
- [ ] Commit result screen shows success/failure per record

### Non-Functional
- [ ] Screens load < 500ms on PDA
- [ ] Barcode scan to response < 500ms

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 009-goods-status-conversion-ui | simple-construction-bolt | 001, 002, 003, 004, 005 | Full PDA flow screens (scan → commit) |
| 010-goods-status-conversion-ui-web | simple-construction-bolt | 006, 007 | Web pages: phiếu list + phiếu detail |

---

## Notes

- UI/UX designs available (bolt 009 can start): https://claude.ai/design/p/86469589-f5e3-4fc0-9305-cfe199a8f4e8?file=Goods+Status+Conversion.dc.html&via=share
- Reuse barcode scanner component pattern from intent 001 (counting-session PDA).
- Confirm: same PDA app bundle or separate? Likely same SmartFulfillment app.
