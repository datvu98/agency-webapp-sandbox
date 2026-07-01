---
id: 003-validate-item
unit: 001-goods-status-conversion-service
intent: 002-goods-status-conversion
status: draft
priority: must
created: 2026-06-22T00:00:00+07:00
assigned_bolt: 007-goods-status-conversion-service
implemented: false
---

# Story: 003-validate-item

## User Story

**As a** warehouse staff
**I want** the system to validate the item I just scanned
**So that** I only proceed with items that are eligible for status conversion

## Acceptance Criteria

- [ ] **Given** I scan an item barcode at a validated location, **When** the item exists at that location and has no active hold, **Then** the system returns item info (current status, quantity)
- [ ] **Given** I scan an item barcode, **When** the item does not belong to the currently scanned location, **Then** the system returns an appropriate error message
- [ ] **Given** I scan an item barcode, **When** the item has an active hold/reserve record, **Then** the system returns error "Hàng hoá có phát sinh tạm giữ, bạn không chuyển đổi được trạng thái cho hàng hoá này."
- [ ] **Given** I previously deleted a record for this item from the session, **When** I scan the same item again, **Then** the system allows it (no validation block for previously-deleted items)

## Technical Notes

- Calls WMS Inventory Service to confirm item belongs to location
- Calls WMS Hold Service to check active holds/reserves
- The "deleted item can re-scan" rule: backend must NOT track deleted records as a block — once deleted, the item is free to be re-added
- Item barcode may encode: SKU, batch, serial — confirm encoding with WMS team

## Dependencies

### Requires
- 002-validate-location (item must be validated against a specific location)

### Enables
- 004-input-new-status (status form opens after item validated)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Item exists at location but with 0 quantity | TBD — confirm with WMS team whether to allow |
| Item barcode is partial / damaged scan | Error: "Không nhận dạng được mã hàng hoá" |
| WMS Hold Service unavailable | Fail-safe: block the item (conservative approach) |
| Same item scanned twice (not deleted first) | Error: "Hàng hoá đã có trong danh sách phiên" |

## Out of Scope
- Modifying hold/reserve records
- Checking item-level permissions beyond hold status
