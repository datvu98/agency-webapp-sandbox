---
intent: 002-goods-status-conversion
created: 2026-06-22T00:00:00+07:00
completed: null
status: in-progress
---

# Inception Log: goods-status-conversion

## Overview

**Intent**: Chuyển đổi trạng thái hàng hoá — cho phép nhân viên kho chuyển đổi trạng thái hàng hoá tại vị trí cụ thể trên PDA theo quy trình quét-xác thực-cập nhật có kiểm soát.
**Type**: green-field
**Created**: 2026-06-22

## Artifacts Created

| Artifact | Status | File |
|----------|--------|------|
| Requirements | ✅ | requirements.md |
| System Context | ✅ | system-context.md |
| Units | ✅ | units.md |
| Unit Brief — service | ✅ | units/001-goods-status-conversion-service/unit-brief.md |
| Unit Brief — ui | ✅ | units/002-goods-status-conversion-ui/unit-brief.md |
| Stories — service (11) | ✅ | units/001-goods-status-conversion-service/stories/*.md |
| Stories — ui (7) | ✅ | units/002-goods-status-conversion-ui/stories/*.md |
| Bolt 007 | ✅ | memory-bank/bolts/007-goods-status-conversion-service/bolt.md |
| Bolt 008 | ✅ | memory-bank/bolts/008-goods-status-conversion-service/bolt.md |
| Bolt 009 | ✅ | memory-bank/bolts/009-goods-status-conversion-ui/bolt.md |
| Bolt 010 | ✅ | memory-bank/bolts/010-goods-status-conversion-ui-web/bolt.md |

## Summary

| Metric | Count |
|--------|-------|
| Functional Requirements | 12 |
| Non-Functional Requirements | 4 groups (Consistency, Atomicity, Performance, Traceability) |
| Units | 2 (1 backend, 1 frontend/web) |
| Stories | 18 (11 backend, 7 frontend/web) |
| Bolts Planned | 4 (007, 008, 009, 010) |

## Units Breakdown

| Unit | Stories | Bolts | Priority |
|------|---------|-------|----------|
| 001-goods-status-conversion-service | 11 | 2 (007, 008) | Must |
| 002-goods-status-conversion-ui | 7 | 2 (009, 010) | Must |

## Decision Log

| Date | Decision | Rationale | Approved |
|------|----------|-----------|----------|
| 2026-06-22 | No transition matrix — all status pairs allowed | Product requirement: no restriction on source→target pair | Pending |
| 2026-06-22 | Commit is all-or-nothing at work session level: any record fails → work session stays open; staff must resolve then recommit | UX requirement: session không kết thúc khi còn lỗi | Pending |
| 2026-06-22 | No channel sync (Shopee/Lazada/TikTok) | Out of scope for this intent | Pending |
| 2026-06-22 | Confirm-for-NEW enforced at API level (not just UI) | Business rule must not be bypassable from any client | Pending |
| 2026-06-22 | Transaction type: actor=`condition_converted`, type_code=`status change` | WMS transaction standard | Pending |
| 2026-06-22 | Rename Session → Work Session (phiên làm việc) | Terminology alignment with product team | Pending |
| 2026-06-22 | Backend split into 2 bolts: session+validation (007) and commit+inventory (008) | Max 5-6 stories per bolt; dependency chain required | Pending |
| 2026-06-25 | 1 committed work session = 1 phiếu chuyển đổi trạng thái (bill_code auto-generated on commit) | Business requirement: tạo phiên trên PDA → tạo phiếu hiển thị trên web | Pending |
| 2026-06-25 | Web split into 2 views: list phiếu (FR-11) + detail phiếu (FR-12); separate bolt 010 | Separation of PDA flow (bolt 009) vs web read views (bolt 010); cleaner dependency | Pending |

## Scope Changes

| Date | Change | Reason | Impact |
|------|--------|--------|--------|
| 2026-06-25 | FR-10 (detail view) → split into FR-10 (tạo phiếu), FR-11 (list web), FR-12 (detail web); story 010 repurposed as list API; story 011 added as detail API; story 007 (frontend) added as list web page; bolt 010 created for web pages | Clarification: PDA session tạo phiếu hiển thị trên web; web cần cả list và detail | +2 FR, +2 backend stories, +1 frontend story, +1 bolt |

## Ready for Construction

**Checklist**:
- [x] Requirements documented (12 FR, 4 NFR groups)
- [x] System context defined
- [x] Units decomposed (2 units)
- [x] Stories created for all units (18 stories)
- [x] Bolts planned (4 bolts: 007, 008, 009, 010)
- [ ] Human review complete (Checkpoint 3 pending)

## Next Steps

1. Human review of all artifacts (Checkpoint 3)
2. PM + Chapter Lead PR approval
3. Begin Construction Phase: `/specsmd-construction-agent --intent="002-goods-status-conversion" --bolt="007-goods-status-conversion-service"`

## Dependencies

- Bolt 007 has no dependencies — can start immediately after approval
- Bolt 008 requires bolt 007 to complete
- Bolt 009 requires bolts 007 + 008 to complete
- Bolt 010 requires bolt 008 to complete (can run in parallel with bolt 009)
- Open questions on WMS Lock API must be resolved before bolt 007 starts
- UI/UX designs resolved: https://claude.ai/design/p/86469589-f5e3-4fc0-9305-cfe199a8f4e8?file=Goods+Status+Conversion.dc.html&via=share
