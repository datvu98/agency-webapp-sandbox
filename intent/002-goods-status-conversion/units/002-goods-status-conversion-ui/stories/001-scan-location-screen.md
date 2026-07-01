---
id: 001-scan-location-screen
unit: 002-goods-status-conversion-ui
intent: 002-goods-status-conversion
status: draft
priority: must
created: 2026-06-22T00:00:00+07:00
assigned_bolt: 009-goods-status-conversion-ui
implemented: false
---

# Story: 001-scan-location-screen

## User Story

**As a** warehouse staff
**I want** a scan location screen on my PDA
**So that** I can start a conversion session by scanning a location barcode

## Acceptance Criteria

- [ ] **Given** I enter the goods status conversion feature, **When** the screen loads, **Then** I see a scan prompt and the camera/scanner is activated
- [ ] **Given** I scan a valid location, **When** the API returns success, **Then** the screen transitions to the Scan Item screen, showing the location name and item count
- [ ] **Given** I scan an invalid location (any error case), **When** the API returns an error, **Then** the error message is displayed inline and the scanner remains active for retry
- [ ] **Given** error "Vị trí không chứa hàng hoá", **Then** that exact message is shown
- [ ] **Given** error "Vị trí đang thuộc công việc khác", **Then** that exact message is shown

## Technical Notes

- Screen first calls StartSession API (FR-1), then ValidateLocation API (FR-2)
- Error display: banner/toast below scan area; does not navigate away
- Scanner remains active after error (user can scan a different location)
- Figma designs required before implementation

## Dependencies

### Requires
- None (first screen in the flow)

### Enables
- 002-scan-item-screen

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| API timeout | "Không thể kết nối, thử lại" with retry button |
| Scanner hardware unavailable | Manual barcode entry fallback (if supported by PDA) |

## Out of Scope
- Manually typing location ID (barcode scan only for MVP)
- Switching locations mid-session (would require a new session)
