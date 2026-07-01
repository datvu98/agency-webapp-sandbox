---
id: 007-commit-session
unit: 001-goods-status-conversion-service
intent: 002-goods-status-conversion
status: draft
priority: must
created: 2026-06-22T00:00:00+07:00
assigned_bolt: 008-goods-status-conversion-service
implemented: false
---

# Story: 007-commit-session

## User Story

**As a** warehouse staff
**I want** to commit my work session and finalize all recorded status changes
**So that** the inventory is updated and the work session is closed

## Acceptance Criteria

- [ ] **Given** my work session has records, **When** I commit and ALL records succeed, **Then** the system applies the changes, the work session status becomes "completed", and the system generates 1 **phiếu chuyển đổi trạng thái** with a unique `bill_code`
- [ ] **Given** I commit and **any record fails**, **Then** the work session **remains open** (status stays "open") and the system shows the list of failed records with their error reasons
- [ ] **Given** the work session remains open after a partial failure, **When** I resolve the failed records (delete + re-scan or delete them), **Then** I can attempt to commit again
- [ ] **Given** records that succeeded in a previous commit attempt, **Then** they are **NOT rolled back** even when the work session stays open due to other failures
- [ ] **Given** the work session is in "open" status, **Then** it can be committed multiple times until all records succeed
- [ ] **Given** the work session has no records, **When** I commit, **Then** the work session closes with status "completed" (empty commit is valid)
- [ ] **Given** the work session is already "completed", **When** I attempt to commit again, **Then** the system returns 400 "Phiên làm việc đã kết thúc"

## Technical Notes

- Commit logic: process each record → if any fails → return error list + session remains "open"; if all succeed → session → "completed" + generate bill_code (auto-increment, format GSC-YYYY-{seq})
- Records processed in this attempt that succeeded are applied immediately (not deferred)
- Successful records from this attempt are marked `success` and excluded from future commit attempts
- Only `pending` records are processed on each commit attempt
- Work session status: `open` → (all succeed) → `completed`; partial failure → stays `open`
- Response structure: `{ all_success: boolean, session_status: string, success: Record[], failed: [{ record, reason }] }`

## Dependencies

### Requires
- 005-add-record-to-session (records must exist to commit)
- 006-delete-session-record (deleted records excluded from commit)

### Enables
- 008-update-inventory-stock (each committed record triggers inventory update)
- 009-record-conversion-transaction (each committed record triggers transaction)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| All records fail on first attempt | Work session stays open; all records in failed list; staff must resolve |
| Concurrent commit calls for same work session | First commit processes; second returns 409 Conflict (commit already in progress) |
| Network failure mid-commit | Records already processed (success) are NOT rolled back; work session stays open |
| Recommit after partial failure (only pending records remain) | Only unprocessed (pending) records are retried |

## Out of Scope
- Full work session rollback (explicitly excluded)
- Auto-retry failed records without staff action
