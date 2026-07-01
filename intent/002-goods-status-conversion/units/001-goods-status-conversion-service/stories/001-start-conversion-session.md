---
id: 001-start-conversion-work session
unit: 001-goods-status-conversion-service
intent: 002-goods-status-conversion
status: draft
priority: must
created: 2026-06-22T00:00:00+07:00
assigned_bolt: 007-goods-status-conversion-service
implemented: false
---

# Story: 001-start-conversion-work session

## User Story

**As a** warehouse staff
**I want** to start a new goods status conversion work session
**So that** I can begin scanning and converting item statuses at a location

## Acceptance Criteria

- [ ] **Given** I am authenticated on the PDA, **When** I initiate a new conversion work session, **Then** a work session is created with status `open` and linked to my staff ID
- [ ] **Given** a work session is created, **When** I query the work session, **Then** it returns: work session_id, staff_id, status=open, created_at
- [ ] **Given** I already have an open work session (if applicable), **When** I start a new one, **Then** the previous work session remains unchanged (work sessions are independent)

## Technical Notes

- Session is the Aggregate Root for the entire conversion flow
- `staff_id` taken from authenticated JWT token
- Session status: `open` → `committed` (no intermediate states)

## Dependencies

### Requires
- None (first story)

### Enables
- 002-validate-location (needs work session context)
- 005-add-record-to-work session (records belong to a work session)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Unauthenticated request | 401 Unauthorized |
| Session creation DB failure | 500 with error message; no partial work session |

## Out of Scope
- Multiple concurrent work sessions per staff — not in scope for MVP
- Session expiry / timeout
