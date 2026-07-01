---
id: 002-validate-location
unit: 001-goods-status-conversion-service
intent: 002-goods-status-conversion
status: draft
priority: must
created: 2026-06-22T00:00:00+07:00
assigned_bolt: 007-goods-status-conversion-service
implemented: false
---

# Story: 002-validate-location

## User Story

**As a** warehouse staff
**I want** the system to validate the location I just scanned
**So that** I only proceed with valid, available locations that contain goods

## Acceptance Criteria

- [ ] **Given** I scan a location barcode, **When** the location is active and contains goods and is not locked by another job, **Then** the system returns the location info and list of items at that location
- [ ] **Given** I scan a location barcode, **When** the location is not active in the warehouse, **Then** the system returns an appropriate error message
- [ ] **Given** I scan a location barcode, **When** the location is active but contains no goods, **Then** the system returns error "Vị trí không chứa hàng hoá"
- [ ] **Given** I scan a location barcode, **When** the location is currently part of another active job, **Then** the system returns error "Vị trí đang thuộc công việc khác"
- [ ] **Given** the validation passes, **Then** the returned item list only contains items at that specific location

## Technical Notes

- Calls WMS Inventory Service to check location status and get item list
- Calls WMS Job Lock Service to check if location has an active lock
- Order of checks: active → has goods → not locked (fail-fast on first error)
- Returns location metadata + items list for use in item scanning step

## Dependencies

### Requires
- 001-start-conversion-session (session must exist for context)

### Enables
- 003-validate-item (item scanning happens at the validated location)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| WMS Inventory Service unavailable | 503 with retry guidance |
| WMS Lock Service unavailable | Fail-safe: block the location (conservative approach) |
| Location barcode not found in WMS | Error: "Vị trí không tồn tại" |
| Location has items but all have 0 quantity | Treat as empty → error "Vị trí không chứa hàng hoá" |

## Out of Scope
- Creating or modifying location records
- Releasing existing job locks
