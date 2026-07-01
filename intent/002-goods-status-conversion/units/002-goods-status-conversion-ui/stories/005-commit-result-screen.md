---
id: 005-commit-result-screen
unit: 002-goods-status-conversion-ui
intent: 002-goods-status-conversion
status: draft
priority: must
created: 2026-06-22T00:00:00+07:00
assigned_bolt: 009-goods-status-conversion-ui
implemented: false
---

# Story: 005-commit-result-screen

## User Story

**As a** warehouse staff
**I want** to see the result of my work session commit
**So that** I know which changes were applied and which failed, and can take action on failures

## Acceptance Criteria

- [ ] **Given** the commit completes successfully (all records), **When** the result screen loads, **Then** I see success count and a summary of committed records
- [ ] **Given** the commit has any failure, **When** the result screen loads, **Then** I see: success count, failed count, each failed record with its error reason; and the work session is still open
- [ ] **Given** failed records are shown, **When** I want to fix them, **Then** I can return to the work session list to delete/re-scan failed items and recommit
- [ ] **Given** the result screen shows failures, **Then** there is a "Return to list" button that navigates back to the Session List screen (NOT a new work session)
- [ ] **Given** the result screen is shown and all succeeded, **When** all is done, **Then** I can exit / return to the main menu

## Technical Notes

- Result data comes from CommitSession API response: `{ success: [], failed: [{ record, reason }] }`
- Show failed items prominently (not hidden)
- "Start new work session" button → navigate to Scan Location screen
- Session is in `committed` state at this point; no further actions on it

## Dependencies

### Requires
- 004-work session-list-screen (commit triggered from there)

### Enables
- 001-scan-location-screen (retry starts a new work session)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| All records failed | Show 0 success, N failed; encourage retry |
| Empty work session committed | Show "0 items processed" message |
| Network error during commit (API timeout) | Show error screen with retry commit option |

## Out of Scope
- Detailed transaction history (separate feature)
- In-place retry of failed records without a new work session
