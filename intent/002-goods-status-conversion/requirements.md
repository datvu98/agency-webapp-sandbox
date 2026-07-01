---
intent: 002-goods-status-conversion
phase: inception
status: draft
created: 2026-06-22T00:00:00+07:00
updated: 2026-06-28T00:00:00+07:00
---

# Requirements: Goods Status Conversion (Chuyển đổi trạng thái hàng hoá)

## Intent Overview

Cho phép nhân viên kho chuyển đổi trạng thái của hàng hoá tại một vị trí cụ thể thông qua
thiết bị PDA, theo quy trình quét → xác thực → cập nhật có kiểm soát, đảm bảo tồn thực tế
giữa các trạng thái luôn nhất quán.

Thuộc unit **UT03 (WMS — Inventory)** của nền tảng UpS.

### Quyết định nền (đọc trước khi xem FR)

1. **Đổi toàn bộ tồn** — mỗi chuyển đổi áp dụng cho toàn bộ tồn của trạng thái nguồn; không nhập số lượng.
2. **1 hàng hoá = 1 bản ghi / phiên** — không có nhiều bản ghi cho cùng một hàng hoá trong một phiên.
3. **Kết thúc thủ công** — có nút *Kết thúc* để nhân viên tự chốt phiên.
4. **Chỉ Kết thúc mới đổi tồn** — mọi thao tác trong phiên là worklist thuần, không tác động tồn.
5. **1 phiên = 1 vị trí** — toàn bộ bản ghi của một phiên thuộc cùng một vị trí.
6. **(hàng hoá, vị trí) luôn ở đúng 1 trạng thái** — *(phụ thuộc WMS, xem Assumption A-CRIT)*.
7. **Commit all-or-nothing** — Kết thúc xử lý toàn bộ bản ghi trong **1 transaction**: tất cả thành
   công → commit + sinh phiếu; chỉ cần 1 bản ghi lỗi → **rollback toàn bộ, không đổi tồn gì cả**,
   phiên giữ "open".

---

## Business Goals

| Goal | Success Metric | Priority |
|------|----------------|----------|
| Nhân viên kho chuyển đổi trạng thái hàng hoá trực tiếp trên PDA | Phiên chuyển đổi hoàn thành end-to-end (quét → xác thực → chốt) | Must |
| Tồn thực tế giữa các trạng thái luôn nhất quán sau mỗi chuyển đổi | Tổng tồn không thay đổi; trạng thái nguồn trừ đúng, trạng thái đích cộng đúng | Must |
| Mỗi chuyển đổi được ghi nhận đầy đủ để truy vết | Audit log có: ai, hàng nào, từ trạng thái → trạng thái, số lượng, ghi chú, thời điểm | Must |
| Nhân viên có thể chỉnh sửa danh sách phiên làm việc trước khi chốt | Xoá/quét lại bản ghi trong phiên làm việc hoạt động đúng | Must |
| Nếu bất kỳ bản ghi nào lỗi khi chốt, phiên làm việc không kết thúc | Nhân viên thấy bản ghi lỗi, có thể xoá/sửa và thử chốt lại | Must |

---

## Functional Requirements

### FR-1: Bắt đầu phiên làm việc chuyển đổi trạng thái
- **Description**: Nhân viên kho khởi tạo một phiên làm việc (work session) chuyển đổi trạng thái mới trên PDA.
- **Acceptance Criteria**:
  - Phiên được tạo với trạng thái "mở" (open).
  - Phiên liên kết với nhân viên đang đăng nhập.
  - Một phiên gắn với **đúng 1 vị trí** (Quyết định 5); vị trí được xác định ở FR-2.
- **Priority**: Must

### FR-2: Quét và xác thực vị trí
- **Description**: Nhân viên quét mã vị trí. Hệ thống kiểm tra tính hợp lệ. Toàn bộ bản ghi trong
  phiên thuộc về vị trí này (Quyết định 5).
- **Acceptance Criteria**:
  - Vị trí phải **active** trong kho → nếu không: báo lỗi thích hợp.
  - Vị trí phải **chứa hàng** → nếu rỗng: báo lỗi "Vị trí không chứa hàng hoá".
  - Vị trí **không nằm trong công việc active khác** → nếu có: báo lỗi "Vị trí đang thuộc công việc khác".
  - Nếu hợp lệ: gắn vị trí vào phiên và tải danh sách hàng hoá thuộc vị trí.
- **Priority**: Must

### FR-3: Quét và xác thực hàng hoá
- **Description**: Nhân viên quét mã hàng hoá tại vị trí đã xác thực. Hệ thống kiểm tra tính hợp lệ.
- **Acceptance Criteria**:
  - Hàng hoá phải **thuộc vị trí đã quét** → nếu không: báo lỗi thích hợp.
  - Hàng hoá **không bị tạm giữ** → nếu có hold: báo lỗi "Hàng hoá có phát sinh tạm giữ, bạn không chuyển đổi được trạng thái cho hàng hoá này."
  - Hàng hoá đã bị **xoá khỏi danh sách phiên làm việc** được phép quét lại (không bị chặn).
- **Priority**: Must

### FR-4: Hiển thị trạng thái hiện tại, nhập trạng thái đích và ghi chú
- **Description**: Sau khi hàng hoá hợp lệ (FR-3), vì mỗi `(hàng hoá, vị trí)` luôn chỉ ở đúng 1
  trạng thái (Assumption A-CRIT), hệ thống **hiển thị read-only** trạng thái hiện tại và **toàn bộ
  tồn** của hàng hoá tại vị trí. Nhân viên **không chọn nguồn** (chỉ có 1) và **không nhập số
  lượng** (= toàn bộ tồn). Nhân viên chỉ chọn trạng thái đích và nhập ghi chú.
- **Acceptance Criteria**:
  - Hiển thị `(trạng thái hiện tại → số lượng tồn)` ở dạng **read-only, đúng 1 dòng**.
  - Số lượng chuyển đổi = **toàn bộ tồn hiện tại**, hệ thống tự lấy, nhân viên không nhập/sửa.
  - Trạng thái đích **chọn từ danh sách trạng thái hợp lệ do WMS cung cấp** (không free-text,
    không transition matrix).
  - **Guard đa-trạng-thái**: nếu tại thời điểm quét `(hàng hoá, vị trí)` có **>1 trạng thái** →
    báo lỗi "Vị trí có nhiều trạng thái cho hàng hoá này, cần tách trước khi chuyển đổi" và **chặn**.
    **Tuyệt đối không tự chọn/hiển thị 1 trạng thái rồi giấu phần còn lại** (tránh sai số âm thầm).
  - Đích **phải khác trạng thái hiện tại** → nếu trùng: báo lỗi "Trạng thái đích phải khác trạng
    thái hiện tại", không cho ghi nhận.
  - Ghi chú là tuỳ chọn.
  - Khi đích là **NEW/available**: hiển thị popup xác nhận "Bạn muốn chuyển hàng hoá sang trạng
    thái mới?" trước khi tiếp tục.
  - **Tính duy nhất trong phiên**: một hàng hoá chỉ có **đúng 1 bản ghi active** trong phiên. Nếu
    hàng hoá đã có bản ghi → **không cho tạo thêm**; nhân viên phải xoá bản ghi cũ (FR-6) để tạo lại.
- **Priority**: Must

> **Phụ thuộc A-CRIT**: Spec chốt theo case "đúng 1 trạng thái / `(hàng hoá, vị trí)`". Việc tách
> hàng đa-trạng-thái về đơn-trạng-thái là thao tác vận hành **bên ngoài** feature (move trước,
> convert sau — xem Business Constraints). Conversion **không tự tách**; nếu gặp mixed-status thì
> **guard chặn** (AC ở trên) thay vì đoán. Vẫn cần WMS confirm one-status-per-location được
> *enforce* hay chỉ *allow* (xem A-CRIT).

### FR-5: Ghi nhận bản ghi vào danh sách phiên làm việc
- **Description**: Sau khi nhân viên xác nhận, bản ghi chuyển đổi được thêm vào danh sách phiên làm việc hiện tại.
- **Acceptance Criteria**:
  - Bản ghi lưu: hàng hoá, vị trí (= vị trí của phiên), trạng thái hiện tại (nguồn, chụp lúc quét
    — để hiển thị), trạng thái đích, số lượng (= toàn bộ tồn nguồn lúc ghi nhận — **để hiển thị**),
    ghi chú, thời điểm ghi nhận, trạng thái bản ghi = `pending`.
  - **Trạng thái nguồn + số lượng dùng để commit được đọc lại tại bước Kết thúc**, không dùng số
    đã chụp. (Vì all-or-nothing, nếu số đọc lúc commit khác lúc quét do tác nhân khác → bản ghi đó
    fail → rollback toàn phiên; do đó với bản ghi `success`, số chụp == số commit.)
  - **Ghi nhận KHÔNG tác động tồn thực tế** (Quyết định 4).
  - Danh sách phiên làm việc hiển thị tất cả bản ghi đã thêm kèm trạng thái bản ghi.
  - Nhân viên có thể tiếp tục quét hàng hoá khác.
- **Priority**: Must

### FR-6: Xoá bản ghi khỏi danh sách phiên làm việc
- **Description**: Nhân viên có thể xoá một bản ghi ra khỏi danh sách phiên làm việc trước khi chốt.
- **Acceptance Criteria**:
  - Khi phiên đang **open**, mọi bản ghi đều ở `pending` hoặc `failed` (không có `success` trong
    phiên open — xem state machine FR-7) → **được phép xoá tự do**.
  - Vì chưa tác động tồn → **không cần rollback tồn**.
  - Hàng hoá của bản ghi vừa xoá **được phép quét lại** để tạo bản ghi mới.
  - Phiên vẫn open sau khi xoá.
  - Sau khi phiên đã **completed**, phiếu là bất biến (FR-10) → không có khái niệm xoá bản ghi.
- **Priority**: Must

### FR-7: Kết thúc và chốt phiên làm việc (all-or-nothing)
- **Description**: Nhân viên bấm **Kết thúc** để chốt phiên. Hệ thống **kiểm tra + ghi tồn cho
  TẤT CẢ bản ghi trong 1 transaction duy nhất**. Tồn **chỉ** thay đổi ở bước này (Quyết định 4).

- **Trạng thái bản ghi (record state machine)** — dùng chung cho FR-4/FR-5/FR-6/FR-7/FR-12:
  - `pending` — đã thêm vào phiên, **chưa tác động tồn**.
  - `failed` — **fail validation ở lần Kết thúc gần nhất**; **tồn không thay đổi** (cờ tạm để
    highlight dòng cần sửa), kèm lý do lỗi.
  - `success` — đã commit thành công (chỉ xuất hiện khi **toàn phiên** commit; terminal, bất biến).
  - Chuyển hợp lệ: `pending → failed`; `failed → pending` (khi sửa/quét lại); `(pending|failed) →
    success` **chỉ xảy ra đồng loạt** khi cả phiên commit thành công. **Không** có chuyển nào ra
    khỏi `success`.

- **Acceptance Criteria**:
  - **Không cho Kết thúc phiên rỗng** (0 bản ghi).
  - Khi Kết thúc, hệ thống **re-validate toàn bộ** bản ghi (`pending` + `failed`).
  - **Nếu TẤT CẢ hợp lệ**: trong **1 transaction**, mọi bản ghi trừ nguồn + cộng đích (FR-8) và
    ghi giao dịch (FR-9); tất cả → `success`; phiên → "completed"; sinh đúng **1 phiếu** (FR-10).
  - **Nếu có ≥1 bản ghi lỗi**: **rollback toàn bộ transaction — KHÔNG bản ghi nào đổi tồn**; các
    bản ghi lỗi → `failed` kèm lý do, các bản ghi hợp lệ **giữ `pending`** (KHÔNG thành `success`);
    phiên **giữ "open"**; **không** sinh phiếu.
  - Nhân viên xử lý bản ghi `failed` (xoá → quét lại, hoặc xoá bỏ) rồi **Kết thúc lại**. Lần Kết
    thúc lại lặp lại toàn bộ quy trình all-or-nothing.
  - **Lý do lỗi hợp lệ** (enumerate để test được): (1) hàng hoá phát sinh hold giữa lúc quét và
    Kết thúc; (2) trạng thái/tồn hiện tại của hàng hoá tại vị trí đã thay đổi/về 0 do tác nhân
    khác (khác với số đã chụp); (3) vị trí/hàng hoá không còn hợp lệ; (4) lỗi hệ thống/transaction.
- **Priority**: Must

### FR-8: Cập nhật tồn thực tế
- **Description**: Khi phiên commit thành công (FR-7 all-or-nothing), hệ thống cập nhật tồn kho
  theo trạng thái cho toàn bộ bản ghi.
- **Acceptance Criteria**:
  - Chỉ thực hiện khi **toàn phiên commit thành công** (FR-7 all-or-nothing).
  - Với mỗi bản ghi: **trừ toàn bộ** tồn của trạng thái hiện tại (nguồn) + **cộng** đúng số đó vào
    trạng thái đích.
  - Tổng tồn (sum of all statuses) **không thay đổi**.
  - Toàn bộ cập nhật của **tất cả bản ghi** nằm trong **1 transaction**: hoặc áp dụng hết, hoặc
    không gì cả. Không có trạng thái nửa vời ở **cấp phiên** lẫn cấp bản ghi.
  - Bất biến `(hàng hoá, vị trí)` → đúng 1 trạng thái **được bảo toàn** sau commit (vì mỗi hàng đổi
    tối đa 1 lần/phiên và đổi toàn bộ về 1 đích).
- **Priority**: Must

### FR-9: Ghi nhận giao dịch (Transaction)
- **Description**: Mỗi bản ghi chuyển đổi thành công (cùng thời điểm + cùng transaction với FR-8)
  tạo một bản ghi giao dịch.
- **Acceptance Criteria**:
  - Loại giao dịch: actor = `condition_converted`, type_code = `status change`.
  - Giao dịch lưu: nhân viên thực hiện, hàng hoá, vị trí, trạng thái nguồn, trạng thái đích, số
    lượng, ghi chú, timestamp.
  - Số lượng trên giao dịch = **số thực sự đã trừ/cộng lúc commit** (với `success` thì == số đã
    chụp ở FR-5).
  - **Timestamp lưu UTC**, chỉ convert sang timezone kho khi hiển thị (FR-12).
  - Giao dịch được ghi trong **cùng transaction** với cập nhật tồn (FR-8) — không có cập nhật tồn
    mà thiếu giao dịch, và ngược lại.
- **Priority**: Must

### FR-10: Tạo phiếu chuyển đổi trạng thái (khi commit thành công)
- **Description**: Khi phiên làm việc commit thành công (tất cả bản ghi → `success`), hệ thống
  tạo một **phiếu chuyển đổi trạng thái** (conversion bill) đại diện cho kết quả công việc. Mỗi
  phiên làm việc hoàn thành tạo đúng 1 phiếu.
- **Acceptance Criteria**:
  - Phiếu sinh ⟺ phiên completed ⟺ toàn bộ bản ghi `success`. Vì all-or-nothing, **không tồn tại
    bản ghi `success` mồ côi ngoài phiếu** → phiếu + transaction log luôn nhất quán. Transaction
    log (FR-9) là source-of-truth cho audit; phiếu là chứng từ của phiên hoàn tất.
  - Phiếu có **mã phiếu duy nhất** (auto-generated, format: `GSC-YYYY-{seq}`).
  - Phiếu kế thừa thông tin từ phiên làm việc: nhân viên thực hiện, **vị trí** (hằng số toàn
    phiếu — Quyết định 5), thời gian hoàn thành.
  - Phiếu là **bất biến** sau khi tạo — không thể sửa/xoá.
  - Mỗi phiên làm việc hoàn thành tạo đúng **1 phiếu** (1:1 relationship).
- **Priority**: Must

### FR-11: Danh sách phiếu chuyển đổi trạng thái trên web
- **Description**: Người dùng (supervisor/manager) xem danh sách phiếu chuyển đổi trạng thái trên
  giao diện web để theo dõi lịch sử chuyển đổi.
- **Acceptance Criteria**:
  - Trang web hiển thị danh sách phiếu với các cột: **Mã phiếu**, **Nhân viên thực hiện**, **Số
    lượng bản ghi**, **Thời gian tạo phiếu**.
  - Danh sách sắp xếp theo thời gian tạo mới nhất trước (DESC).
  - Có thể click vào từng phiếu để xem chi tiết (FR-12).
- **Priority**: Must

### FR-12: Chi tiết phiếu chuyển đổi trạng thái trên web
- **Description**: Người dùng xem chi tiết một phiếu chuyển đổi trạng thái cụ thể với đầy đủ thông tin bản ghi.
- **Acceptance Criteria**:
  - Trang hiển thị header phiếu: mã phiếu, nhân viên thực hiện, **vị trí** (hằng số toàn phiếu),
    thời gian tạo phiếu.
  - Trang hiển thị danh sách bản ghi trong phiếu với các cột: **SKU**, **Hàng hoá**, **Trạng thái
    chuyển đổi** (từ → sang), **Số lượng** (= số thực chuyển), **Thời gian chuyển đổi**.
  - Vì phiếu chỉ sinh khi toàn phiên `success`, mọi bản ghi trong phiếu đều ở trạng thái `success`.
  - Không có cột "Vị trí" theo dòng (vị trí là hằng số toàn phiếu, đã ở header).
  - Thời gian chuyển đổi: lưu UTC (FR-9), hiển thị theo timezone của kho.
- **Priority**: Must

---

## Non-Functional Requirements

### Consistency (Tính nhất quán tồn kho)
| Requirement | Metric | Target |
|-------------|--------|--------|
| Tổng tồn bất biến qua mỗi chuyển đổi | Tổng tồn trước = tổng tồn sau | 100% |
| Không double-count trong phiên | Mỗi hàng hoá chỉ có 1 bản ghi active/phiên; `success` chỉ xuất hiện khi commit toàn phiên | 100% |

### Atomicity
| Requirement | Metric | Target |
|-------------|--------|--------|
| Toàn bộ cập nhật tồn + ghi giao dịch của cả phiên nằm trong 1 DB transaction (all-or-nothing) | Không có trạng thái nửa vời ở **cấp phiên** | 100% |
| Phiên chỉ "completed" khi mọi bản ghi `success` | Không completed khi còn bản ghi lỗi | 100% |

> **Ngữ nghĩa**: Atomicity là **cấp phiên**. Lỗi bất kỳ bản ghi nào → rollback toàn bộ, không bản
> ghi nào tác động tồn. Không tồn tại partial-commit.

### Performance
| Requirement | Metric | Target |
|-------------|--------|--------|
| Validation phản hồi tức thì trên PDA | Latency mỗi bước validation | < 500ms |
| Commit phiên làm việc | Latency chốt toàn bộ phiên làm việc (≤ 50 bản ghi) | < 3s |

### Traceability (Truy vết)
| Requirement | Metric | Target |
|-------------|--------|--------|
| Audit log đầy đủ | Có: ai, hàng nào, từ/sang trạng thái, số lượng, ghi chú, thời điểm | 100% coverage |

### Reliability
| Requirement | Metric | Target |
|-------------|--------|--------|
| Availability | Uptime | 99.9% |

---

## Constraints

### Technical Constraints
- Không có transition matrix — mọi cặp trạng thái nguồn → đích đều hợp lệ, **trừ** trường hợp đích
  trùng nguồn (bị chặn ở FR-4).
- **Mỗi chuyển đổi là đổi toàn bộ tồn của trạng thái nguồn** — không có chuyển đổi một phần, không
  nhập số lượng.
- **Tồn chỉ thay đổi tại bước Kết thúc**, commit **toàn phiên all-or-nothing**.
- **Bản ghi `success` là bất biến** và chỉ tồn tại trong phiên đã completed.
- **1 phiên = 1 vị trí**.
- KHÔNG đồng bộ thay đổi trạng thái lên channel (Shopee, Lazada, TikTok).
- Không có approval workflow — không cần phê duyệt dù số lượng lớn.
- Thực thi trên thiết bị PDA (giao diện mobile-first, scan barcode).

### Business Constraints
- Chỉ áp dụng cho hàng hoá trong kho SmartFulfillment (UT03/WMS).
- **Tách hàng đa-trạng-thái về đơn-trạng-thái-một-vị-trí là thao tác luân chuyển vận hành BÊN
  NGOÀI feature** (move trước, convert sau) — **không thuộc phạm vi** của conversion. Conversion
  **giả định vị trí đã đơn-trạng-thái** và **guard chặn** nếu không phải (FR-4). Construction
  agent **không** được tự dựng luồng tách-status bên trong conversion.

---

## Tài liệu liên quan

- **UI/UX (đã chốt)**: https://claude.ai/design/p/86469589-f5e3-4fc0-9305-cfe199a8f4e8?file=Goods+Status+Conversion.dc.html&via=share

---

## Assumptions

| Assumption | Risk if Invalid | Mitigation |
|------------|-----------------|------------|
| **A-CRIT**: Mỗi `(hàng hoá, vị trí)` LUÔN ở đúng 1 trạng thái tại mọi thời điểm | **Spec vỡ**: FR-4 sai mô hình, "đổi toàn bộ" mơ hồ | **Đóng bằng 2 lớp**: (1) scope vận hành ngoài (tách-status không thuộc feature — Business Constraints); (2) guard FR-4 chặn mixed-status. Không còn phụ thuộc A-CRIT đúng. Vẫn cần WMS confirm one-status-per-location được **enforce** hay chỉ **allow**. |
| Trạng thái hàng hoá được quản lý bởi WMS và API sẵn sàng trả danh sách trạng thái hợp lệ | Flow bị chặn ở FR-4 | Confirm với team WMS trước construction |
| "Công việc active khác" có API kiểm tra (FR-2) | Vị trí bị dùng bởi job khác không được phát hiện, data race | Xác nhận API kiểm tra active job với team WMS |
| PDA có thể quét barcode vị trí và hàng hoá | Toàn bộ flow không khả dụng | Hardware assumption; đã dùng cho intent 001 |
| Tồn thực tế lưu theo cặp (vị trí, trạng thái) | Cập nhật atomic không thực hiện được | Confirm DB schema với WMS team |

---

## Open Questions

| Question | Owner | Resolution |
|----------|-------|-----------|
| `(hàng hoá, vị trí)` có thể ở nhiều trạng thái cùng lúc? | WMS team | **Đóng phía spec** (scope vận hành ngoài + guard FR-4). Còn lại: hỏi WMS one-status-per-location là **enforce** hay chỉ **allow**. |
| Phiên bỏ dở sau partial commit | — | **MOOT** — all-or-nothing ⟹ phiên bỏ dở = 0 thay đổi tồn, không orphan. |
| API lấy danh sách trạng thái hàng hoá hợp lệ (available values)? | WMS team | Pending (FR-4 phụ thuộc). |
| Hold ở cấp hàng hoá hay `(hàng hoá, vị trí)`? | WMS team | Ảnh hưởng FR-3 + FR-7 lý do lỗi (1). Pending. |
| Sinh `{seq}` mã phiếu: global hay theo kho? reset theo năm? chống race? | WMS team | Pending. |
| FR-11 (web) cần phân trang / filter / phân quyền xem không? | Product | Pending. |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-29 | **Loại bỏ toàn bộ logic lock/unlock**: xoá FR-13 (vòng đời lock vị trí), xoá acquire lock khỏi FR-2, xoá release lock khỏi FR-7, xoá Open Questions về lock scope / lifecycle / timeout-lease, cập nhật Assumption. |
| 2026-06-28 | **Đóng A-CRIT 2 lớp**: thêm Business Constraint (tách-status ngoài scope) + guard FR-4 chặn mixed-status. Thêm FR-13 (vòng đời lock vị trí). Cập nhật FR-2 (acquire lock), FR-7 (release/giữ lock), Assumption A-CRIT (mitigation 2 lớp). Open Questions: đa-trạng-thái → đóng phía spec. |
| 2026-06-28 | Chốt 7 quyết định: đổi toàn bộ; 1 hàng hoá=1 bản ghi; nút Kết thúc thủ công; chỉ Kết thúc đổi tồn; 1 phiên=1 vị trí; `(hàng hoá,vị trí)`=1 trạng thái (A-CRIT); **commit all-or-nothing**. Viết lại FR-4 (bỏ picker, hiển thị read-only, chọn đích từ danh sách hợp lệ), FR-6 (xoá tự do khi open), FR-7 (state machine + all-or-nothing + rollback toàn bộ), FR-8 (atomic cấp phiên). Làm rõ FR-1/FR-2 (1 phiên=1 vị trí), FR-5/FR-9/FR-10/FR-12 (số commit thực, UTC, vị trí ở header phiếu). Đổi NFR-Atomicity sang cấp phiên. MOOT open question phiên bỏ dở; nâng case "nhiều trạng thái" thành A-CRIT; thêm question granularity của hold. |
| 2026-06-28 | Tích hợp 2 clarification (tồn chỉ đổi khi commit; đổi toàn bộ). Sửa FR-4/FR-6/FR-7, làm rõ NFR-Atomicity, dời FR-9 cạnh FR-8. *(Bị thay thế bởi entry trên.)* |
| 2026-06-22 | Bản draft đầu tiên. |
