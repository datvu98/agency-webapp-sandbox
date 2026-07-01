---
id: 002-scan-item-screen
unit: 002-goods-status-conversion-ui
intent: 002-goods-status-conversion
status: draft
priority: must
created: 2026-06-22T00:00:00+07:00
assigned_bolt: 009-goods-status-conversion-ui
implemented: false
---

# Story: 002-scan-item-screen

## User Story

**As a** warehouse staff
**I want** a scan item screen on my PDA
**So that** I can select which item at the scanned location I want to convert

## Acceptance Criteria

- [ ] **Given** a location is validated, **When** the scan item screen loads, **Then** I see the location name and a scan prompt for item barcode
- [ ] **Given** I scan a valid item at the location, **When** the API returns success, **Then** I see item info (name, current status, quantity) and the screen transitions to the Status Input Form
- [ ] **Given** I scan an item that doesn't belong to the location, **When** the API returns an error, **Then** the error message is displayed and scanner remains active
- [ ] **Given** I scan an item with an active hold, **When** the API returns error, **Then** exact message "Hàng hoá có phát sinh tạm giữ, bạn không chuyển đổi được trạng thái cho hàng hoá này." is shown
- [ ] **Given** I previously deleted a record for item X in this session, **When** I scan item X again, **Then** the validation passes (no "already in session" block)
- [ ] **Given** I scan an item already in the active session (not deleted), **When** the API returns error, **Then** the error message is shown

## Technical Notes

- Calls ValidateItem API (FR-3) with current session_id, item barcode, location_id
- Display item: SKU, name, current status, current qty at location
- Retry loop: error → show error → scanner stays active → user scans again

## Dependencies

### Requires
- 001-scan-location-screen (location must be set before item scan)

### Enables
- 003-status-input-form

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Item in session list but not yet deleted | Error: "Hàng hoá đã có trong danh sách phiên" |
| API timeout | "Không thể kết nối, thử lại" |

## Out of Scope
- Displaying all items at the location as a list to tap-select (scan-only for MVP)
