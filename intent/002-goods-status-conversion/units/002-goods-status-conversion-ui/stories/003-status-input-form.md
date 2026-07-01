---
id: 003-status-input-form
unit: 002-goods-status-conversion-ui
intent: 002-goods-status-conversion
status: draft
priority: must
created: 2026-06-22T00:00:00+07:00
assigned_bolt: 009-goods-status-conversion-ui
implemented: false
---

# Story: 003-status-input-form

## User Story

**As a** warehouse staff
**I want** a form to select the new status and enter notes for a validated item
**So that** I can record the intended status change with context

## Acceptance Criteria

- [ ] **Given** an item is validated, **When** the status form loads, **Then** I see: item name/SKU, current status, a status picker with available statuses, and a notes input field
- [ ] **Given** I select any target status that is NOT `new`/`available`, **When** I tap "Confirm", **Then** the record is added to the session and I return to the Scan Item screen
- [ ] **Given** I select target status `new`/`available`, **When** I tap "Confirm", **Then** a popup appears: "Bạn muốn chuyển hàng hoá sang trạng thái mới?"
- [ ] **Given** the popup appears, **When** I confirm, **Then** the record is added to the session and I return to the Scan Item screen
- [ ] **Given** the popup appears, **When** I cancel, **Then** the popup closes and I remain on the form (status picker stays)
- [ ] **Given** notes are optional, **When** I submit without notes, **Then** the record is added successfully with empty notes

## Technical Notes

- Status picker: values loaded from API (from ValidateItem response or separate endpoint)
- Popup: modal dialog with confirm/cancel buttons — Vietnamese text exact as specified
- After adding record: navigate back to Scan Item screen (not Location screen — location is still set)
- Figma designs required before implementation

## Dependencies

### Requires
- 002-scan-item-screen (item must be validated)

### Enables
- 004-session-list-screen (can navigate to list from this screen or after adding)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Status picker has only 1 option | Show picker with single option (allow same-status conversion) |
| Notes max length exceeded | Inline validation error under notes field |
| API error when adding record | Toast error; stay on form; allow retry |

## Out of Scope
- Editing a record after it's been added (delete + re-scan)
- Inputting a custom/free-text status not in the list
