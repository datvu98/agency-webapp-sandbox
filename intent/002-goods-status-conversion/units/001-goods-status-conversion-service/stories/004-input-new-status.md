---
id: 004-input-new-status
unit: 001-goods-status-conversion-service
intent: 002-goods-status-conversion
status: draft
priority: must
created: 2026-06-22T00:00:00+07:00
assigned_bolt: 008-goods-status-conversion-service
implemented: false
---

# Story: 004-input-new-status

## User Story

**As a** warehouse staff
**I want** to input the new target status and optional notes for the validated item
**So that** I can record the intended status change before committing

## Acceptance Criteria

- [ ] **Given** an item is validated, **When** I request the status form, **Then** the system returns: item info, current status, and list of available target statuses
- [ ] **Given** I select any target status, **When** the target status is NOT `new`/`available`, **Then** the system accepts the input without additional confirmation
- [ ] **Given** I select target status `new`/`available`, **When** the system receives this input, **Then** the system requires a confirmation step (response with `requires_confirm: true`) before the record is finalized
- [ ] **Given** the confirmation is provided, **When** target status is `new`, **Then** the system proceeds to add the record
- [ ] **Given** I provide a note, **When** the note is submitted, **Then** the note is stored with the record (notes are optional — empty string is valid)
- [ ] **Given** no transition matrix is defined, **Then** the system accepts ANY source → target status pair without error

## Technical Notes

- The confirm-for-NEW rule is enforced at the API level (not just UI)
- Confirmation is a two-step call: (1) submit status → get `requires_confirm` flag; (2) confirm → add record
- Available statuses list should come from WMS configuration (not hardcoded)
- No validation on status pair; all pairs are valid

## Dependencies

### Requires
- 003-validate-item (item must be validated before status input)

### Enables
- 005-add-record-to-session (record is added after status confirmed)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Target status same as current status | Allowed (idempotent conversion — confirm with product) |
| Notes exceed max length | Validation error with max length message |
| Available statuses list is empty / WMS unavailable | Error: cannot proceed without status options |

## Out of Scope
- Changing quantity (this feature converts status for the full item quantity at the location)
- Multi-item batch status input in one form
