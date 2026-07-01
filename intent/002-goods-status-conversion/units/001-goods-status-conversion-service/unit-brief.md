---
unit: 001-goods-status-conversion-service
intent: 002-goods-status-conversion
phase: inception
status: draft
created: 2026-06-22T00:00:00+07:00
updated: 2026-06-22T00:00:00+07:00
---

# Unit Brief: Goods Status Conversion Service

## Purpose

Backend domain service quản lý toàn bộ lifecycle của một phiên chuyển đổi trạng thái hàng hoá:
khởi tạo phiên, xác thực vị trí và hàng hoá, quản lý danh sách bản ghi trong phiên,
chốt phiên với partial-failure tolerance, cập nhật tồn kho nguyên tử, và ghi nhận giao dịch.

## Scope

### In Scope
- Tạo và quản lý Conversion Session (open → committed)
- Validation: vị trí (active, có hàng, không bị lock), hàng hoá (thuộc vị trí, không có hold)
- Business rule: không có transition matrix; confirm popup khi target = NEW
- Quản lý danh sách bản ghi trong phiên (thêm, xoá, cho phép quét lại sau xoá)
- Commit phiên: xử lý từng bản ghi độc lập, partial failure không rollback cả phiên
- Inventory mutation: atomic deduct source status + add target status per record
- Transaction recording: 1 transaction record per successful conversion

### Out of Scope
- PDA UI / screens → Unit 002
- Channel sync (Shopee, Lazada, TikTok) — explicit exclusion
- Approval workflow
- Transition matrix validation

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Khởi tạo phiên chuyển đổi trạng thái (open session) | Must |
| FR-2 | Quét và xác thực vị trí (active, có hàng, không lock) | Must |
| FR-3 | Quét và xác thực hàng hoá (thuộc vị trí, không hold, re-scan ok) | Must |
| FR-4 | Business rules cho nhập trạng thái: no matrix, confirm for → NEW | Must |
| FR-5 | Ghi nhận bản ghi vào danh sách phiên | Must |
| FR-6 | Xoá bản ghi khỏi danh sách phiên (allow re-scan) | Must |
| FR-7 | Chốt phiên (per-record, partial failure tolerance) | Must |
| FR-8 | Cập nhật tồn thực tế nguyên tử (trừ nguồn + cộng đích) | Must |
| FR-9 | Ghi nhận giao dịch loại "Chuyển đổi trạng thái" | Must |
| FR-10 | Tạo phiếu chuyển đổi khi commit thành công | Must |
| FR-11 | API danh sách phiếu chuyển đổi trạng thái | Must |
| FR-12 | API chi tiết phiếu chuyển đổi trạng thái | Must |

---

## Domain Concepts

### Key Entities

| Entity | Description | Attributes |
|--------|-------------|------------|
| ConversionWorkSession | Phiên làm việc chuyển đổi — đơn vị công việc chứa danh sách bản ghi | id, staff_id, status (open/completed), bill_code (null until committed), created_at, completed_at |
| ConversionRecord | Một bản ghi chuyển đổi trong phiên làm việc | work_session_id, location_id, item_id, from_status, to_status, qty, notes, state (pending/success/failed) |
| LocationInventory | Tồn kho tại vị trí theo trạng thái | location_id, item_id, status, qty |
| ConversionTransaction | Bản ghi audit mỗi chuyển đổi thành công | id, work_session_id, record_id, staff_id, location_id, item_id, from_status, to_status, qty, notes, created_at; actor=`condition_converted`, type_code=`status change` |

### Key Operations

| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| StartSession | Khởi tạo phiên mới | staff_id | ConversionWorkSession (open) |
| ValidateLocation | Kiểm tra vị trí hợp lệ | location_id | LocationInfo + item list, or error |
| ValidateItem | Kiểm tra hàng hoá hợp lệ | item_id, location_id, work_session_id | ItemInfo or error |
| AddRecord | Thêm bản ghi vào phiên | work_session_id, item_id, to_status, notes | ConversionRecord |
| DeleteRecord | Xoá bản ghi khỏi phiên | work_session_id, record_id | void (item unblocked) |
| CommitWorkSession | Chốt phiên làm việc; tất cả thành công → completed + generate bill_code; bất kỳ lỗi → session remains open, trả danh sách lỗi | work_session_id | CommitResult (all_success, session_status, bill_code, success_list, failed_list) |
| UpdateStock | Atomic: trừ nguồn, cộng đích | ConversionRecord | void or error |
| RecordTransaction | Ghi audit transaction | ConversionRecord | ConversionTransaction |
| GetBillList | Danh sách phiếu (status=completed), paginated | page, page_size | List of phiếu summaries |
| GetBillDetail | Chi tiết một phiếu theo bill_code | bill_code | Phiếu header + success records |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 12 |
| Must Have | 12 |
| Should Have | 0 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-start-conversion-session | Start Conversion Session | Must | Planned |
| 002-validate-location | Validate Location | Must | Planned |
| 003-validate-item | Validate Item | Must | Planned |
| 004-input-new-status | Input New Status Business Rules | Must | Planned |
| 005-add-record-to-session | Add Record to Session | Must | Planned |
| 006-delete-session-record | Delete Session Record | Must | Planned |
| 007-commit-session | Commit Session | Must | Planned |
| 008-update-inventory-stock | Update Inventory Stock | Must | Planned |
| 009-record-conversion-transaction | Record Conversion Transaction | Must | Planned |
| 010-get-bill-list-api | Get Conversion Bill List API | Must | Planned |
| 011-get-bill-detail-api | Get Conversion Bill Detail API | Must | Planned |

---

## Dependencies

### Depends On

| Unit / System | Reason |
|---------------|--------|
| WMS Inventory Service | Query location item list; update stock |
| WMS Job Lock Service | Check if location has active job lock |
| WMS Hold Service | Check if item has active hold |
| Transaction Ledger | Write conversion transaction records |
| Auth Service | Validate staff session |

### Depended By

| Unit | Reason |
|------|--------|
| 002-goods-status-conversion-ui | Consumes all REST APIs exposed by this unit |

---

## Technical Context

### Suggested Technology
- NestJS backend service (per UpS tech stack)
- DDD patterns: Aggregate Root (ConversionWorkSession), Domain Service (inventory mutation), Repository pattern

### Integration Points

| Integration | Type | Protocol |
|-------------|------|----------|
| WMS Inventory Service | API | REST (internal) |
| WMS Job Lock Service | API | REST (internal) |
| WMS Hold Service | API | REST (internal) |
| Transaction Ledger | API / Event | REST or Kafka (confirm with WMS team) |

### Data Storage

| Data | Type | Notes |
|------|------|-------|
| ConversionWorkSession | SQL (PostgreSQL) | Lifecycle: open → committed |
| ConversionRecord | SQL (PostgreSQL) | Per-session; state: pending → success/failed |
| LocationInventory | SQL (WMS-owned) | This unit mutates via WMS API, not direct DB |
| ConversionTransaction | SQL / Event log | Audit; append-only |

---

## Constraints

- Inventory mutation MUST be atomic per record (both deduct + add in single DB transaction)
- No full session rollback on partial commit failure
- Re-scan allowed for deleted records in the same session
- Validation at each step (not deferred to commit)

---

## Success Criteria

### Functional
- [ ] Session lifecycle: start → add/delete records → commit works end-to-end
- [ ] Location validation rejects: inactive location, empty location, locked location
- [ ] Item validation rejects: wrong location, active hold
- [ ] Deleted record can be re-scanned in same session
- [ ] Commit: all records succeed → work session status "completed"
- [ ] Commit: any record fails → work session stays "open", failed records shown with reason
- [ ] Inventory: source status deducted, target status added, total unchanged
- [ ] Transaction record created per successful conversion with actor=condition_converted, type_code=status change

### Non-Functional
- [ ] Validation API response < 500ms p95
- [ ] Commit (≤ 50 records) < 3s
- [ ] No double-count under concurrent requests

### Quality
- [ ] Code coverage > 80%
- [ ] Integration tests hit real DB (no mocks)
- [ ] All acceptance criteria met

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| 007-goods-status-conversion-service | ddd-construction-bolt | 001, 002, 003, 005, 006 | Work session + validation core |
| 008-goods-status-conversion-service | ddd-construction-bolt | 004, 007, 008, 009, 010, 011 | Commit + inventory + transaction + bill + read APIs |

---

## Notes

- Confirm WMS lock/hold API contract before bolt 007 design phase.
- Transaction recording via REST vs Kafka TBD — lean toward REST for simplicity unless event sourcing is required.
- The "confirm for → NEW status" rule is a business rule enforced by API (not just UI) to prevent accidental status reversion.
