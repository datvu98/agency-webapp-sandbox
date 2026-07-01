---
id: 005-add-record-to-work session
unit: 001-goods-status-conversion-service
intent: 002-goods-status-conversion
status: draft
priority: must
created: 2026-06-22T00:00:00+07:00
assigned_bolt: 007-goods-status-conversion-service
implemented: false
---

# Story: 005-add-record-to-work session

## User Story

**As a** warehouse staff
**I want** the system to add the validated item and its new status to my work session list
**So that** I can accumulate multiple changes before committing them

## Acceptance Criteria

- [ ] **Given** an item has been validated and status confirmed, **When** I add a record to the work session, **Then** the record is saved with: work session_id, item_id, location_id, from_status (current), to_status, notes, timestamp
- [ ] **Given** a record is added, **When** I query the work session list, **Then** the new record appears in the list
- [ ] **Given** a record is added, **When** I scan another item at the same location, **Then** the work session remains open and I can add more records
- [ ] **Given** the work session is in `open` status, **Then** records can be added at any time before commit

## Technical Notes

- Record status on creation: `pending` (becomes `success` or `failed` after commit)
- `from_status` is captured at add-time from the current item state
- `qty` is the full quantity of the item at the location in `from_status`
- A work session can have multiple records for different items at the same location

## Dependencies

### Requires
- 004-input-new-status (status must be provided and confirmed)

### Enables
- 006-delete-work session-record (records can be deleted once added)
- 007-commit-work session (records are what gets committed)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Adding a record to a committed work session | 400 error: "Phiên đã kết thúc" |
| Session not found | 404 error |
| Concurrent adds to same work session | Last-write-wins per record (records are independent) |

## Out of Scope
- Modifying existing records (must delete + re-add)
- Partial quantity conversion (full quantity only for MVP)
