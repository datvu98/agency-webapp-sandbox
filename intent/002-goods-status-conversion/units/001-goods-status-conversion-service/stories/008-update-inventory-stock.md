---
id: 008-update-inventory-stock
unit: 001-goods-status-conversion-service
intent: 002-goods-status-conversion
status: draft
priority: must
created: 2026-06-22T00:00:00+07:00
assigned_bolt: 008-goods-status-conversion-service
implemented: false
---

# Story: 008-update-inventory-stock

## User Story

**As a** system (called during session commit)
**I want** to atomically update inventory stock for a status conversion
**So that** the source status loses quantity and the target status gains quantity, with no net change in total stock

## Acceptance Criteria

- [ ] **Given** a record with item X, from_status A, to_status B, qty N, **When** the inventory update is applied, **Then** `qty(item X, location, status A) -= N` and `qty(item X, location, status B) += N` in the same atomic DB transaction
- [ ] **Given** the update is applied, **When** I sum all statuses for item X at the location, **Then** the total is the same as before the update
- [ ] **Given** the source status quantity is insufficient (qty < N), **When** the inventory update is attempted, **Then** the update fails with an error and neither deduct nor add is applied
- [ ] **Given** a DB error occurs during the atomic update, **Then** neither the deduct nor the add is applied (transaction rollback)

## Technical Notes

- Both deduct and add must be in a single DB transaction — partial application is never acceptable
- This is called per-record, not per-session — each record is independent
- `qty` used is the quantity captured at `add-record` time (from_status qty at that moment)
- If WMS inventory is managed via WMS API (not direct DB), the atomic guarantee must be at the WMS API level — confirm with WMS team

## Dependencies

### Requires
- 007-commit-session (called during commit processing)

### Enables
- 009-record-conversion-transaction (transaction recorded only on successful inventory update)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Source status qty is 0 at commit time (changed since record was added) | Fail the record; report as failed in commit result |
| Target status row doesn't exist yet | Create the row with qty = N (upsert behavior) |
| WMS inventory service times out during update | Fail the record; do not apply partial update |

## Out of Scope
- Compensating for previously applied updates (no reverse/undo)
- Multi-location or multi-session batch inventory updates
