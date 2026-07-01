---
id: 006-delete-work session-record
unit: 001-goods-status-conversion-service
intent: 002-goods-status-conversion
status: draft
priority: must
created: 2026-06-22T00:00:00+07:00
assigned_bolt: 007-goods-status-conversion-service
implemented: false
---

# Story: 006-delete-work session-record

## User Story

**As a** warehouse staff
**I want** to remove a record from my work session list
**So that** I can correct mistakes before committing, and re-scan the same item if needed

## Acceptance Criteria

- [ ] **Given** my work session has records, **When** I delete a specific record by record_id, **Then** the record is removed from the work session list
- [ ] **Given** I deleted a record for item X, **When** I scan item X again, **Then** the system treats it as a fresh scan (no "already in work session" block)
- [ ] **Given** I delete a record, **When** I query the work session list, **Then** the deleted record no longer appears
- [ ] **Given** the work session is still open after deletion, **Then** I can continue adding new records

## Technical Notes

- Deletion is a soft or hard delete from the work session record list — item is immediately unblocked for re-scan
- The backend must not hold any "previously seen" block on the item after deletion
- Only records in `pending` state can be deleted (records already processed in a partial commit are immutable)

## Dependencies

### Requires
- 005-add-record-to-work session (records must exist to be deleted)

### Enables
- 003-validate-item (re-scan of deleted item must pass validation)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Deleting a record that doesn't exist | 404 error |
| Deleting a record from a committed work session | 400 error: work session is closed |
| Deleting a record that was already processed (partial commit) | 400 error: record is immutable after processing |

## Out of Scope
- Bulk delete (delete all records in work session at once)
- Undo/restore deleted records
