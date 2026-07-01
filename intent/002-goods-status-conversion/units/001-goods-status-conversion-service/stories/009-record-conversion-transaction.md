---
id: 009-record-conversion-transaction
unit: 001-goods-status-conversion-service
intent: 002-goods-status-conversion
status: draft
priority: must
created: 2026-06-22T00:00:00+07:00
assigned_bolt: 008-goods-status-conversion-service
implemented: false
---

# Story: 009-record-conversion-transaction

## User Story

**As a** system (called after successful inventory update)
**I want** to create a transaction record for each successful status conversion
**So that** there is a complete audit trail of who changed what, when, and why

## Acceptance Criteria

- [ ] **Given** an inventory update succeeds, **When** the transaction is recorded, **Then** the transaction contains: staff_id, work_session_id, record_id, location_id, item_id, from_status, to_status, qty, notes, created_at
- [ ] **Given** the transaction is recorded, **When** I query by item_id or staff_id, **Then** the transaction is retrievable
- [ ] **Given** the transaction type is set, **Then** actor = `condition_converted`, type_code = `status change`
- [ ] **Given** an inventory update fails for a record, **Then** NO transaction is created for that record
- [ ] **Given** a transaction recording fails after a successful inventory update, **Then** the inventory update is NOT rolled back (transaction recording failure is non-fatal for the record)

## Technical Notes

- Transaction records are append-only (no updates or deletes)
- Write after successful UpdateStock — do not wrap both in the same DB transaction unless the WMS team requires it
- Last AC (non-fatal failure): if transaction write fails, log the error for manual reconciliation but do not fail the record from the user's perspective
- `created_at` = server timestamp at time of transaction write

## Dependencies

### Requires
- 008-update-inventory-stock (transaction only created if inventory update succeeded)

### Enables
- None (final step in the commit pipeline)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Transaction write fails (DB down) | Log error; record counted as success (inventory is already updated); alert for reconciliation |
| Duplicate transaction for same record_id | Idempotency: check for existing transaction by record_id; skip if already exists |

## Out of Scope
- Transaction querying / reporting UI — separate feature
- Transaction reversal / compensation
