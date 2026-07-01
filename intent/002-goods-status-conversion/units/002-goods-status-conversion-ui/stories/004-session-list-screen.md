---
id: 004-work session-list-screen
unit: 002-goods-status-conversion-ui
intent: 002-goods-status-conversion
status: draft
priority: must
created: 2026-06-22T00:00:00+07:00
assigned_bolt: 009-goods-status-conversion-ui
implemented: false
---

# Story: 004-work session-list-screen

## User Story

**As a** warehouse staff
**I want** to view and manage the list of recorded items in my work session
**So that** I can review, correct, and decide when to commit

## Acceptance Criteria

- [ ] **Given** I navigate to the work session list, **When** there are records, **Then** each record shows: item name/SKU, from_status → to_status, notes (if any)
- [ ] **Given** I tap delete on a record, **When** confirmed, **Then** the record disappears from the list and the item can be re-scanned
- [ ] **Given** I tap "Continue scanning", **When** navigated, **Then** I return to the Scan Item screen (location remains set)
- [ ] **Given** I tap "Commit", **When** confirmed, **Then** the work session commit is triggered and I navigate to the Commit Result screen
- [ ] **Given** the list is empty, **When** I try to commit, **Then** commit proceeds (empty work session is valid per FR-7)

## Technical Notes

- List is fetched from work session records API
- Delete calls DeleteRecord API (FR-6) — confirmation dialog before delete
- "Continue scanning" navigates to Scan Item screen (not back to Location — location context is maintained)
- "Commit" button triggers CommitSession API (FR-7)

## Dependencies

### Requires
- 003-status-input-form (records must be added before they appear here)

### Enables
- 005-commit-result-screen (commit navigates here)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| List has many records (50+) | Scrollable list; all records shown |
| Delete API fails | Toast error; record stays in list |
| Commit called on empty work session | Allowed; navigate to Commit Result with empty lists |

## Out of Scope
- Editing records in-place (must delete + re-scan)
- Sorting or filtering the work session list
