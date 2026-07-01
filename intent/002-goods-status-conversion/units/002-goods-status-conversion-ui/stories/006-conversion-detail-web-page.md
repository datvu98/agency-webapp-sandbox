---
id: 006-conversion-detail-web-page
unit: 002-goods-status-conversion-ui
intent: 002-goods-status-conversion
status: draft
priority: must
created: 2026-06-23T00:00:00+07:00
assigned_bolt: 010-goods-status-conversion-ui-web
implemented: false
---

# Story: 006-conversion-detail-web-page

## User Story

**As a** supervisor / manager on web
**I want** to view the detail of a phiếu chuyển đổi trạng thái (conversion bill)
**So that** I can review what items were converted, from which status to which, and when

## Acceptance Criteria

- [ ] **Given** I navigate to a phiếu chuyển đổi detail page (from the list in story 007), **When** the page loads, **Then** I see the phiếu header: mã phiếu, nhân viên thực hiện, thời gian tạo phiếu
- [ ] **Given** the page loads, **Then** I see a table of successful conversion records with columns: **SKU** | **Hàng hoá** | **Trạng thái chuyển đổi** (from → to) | **Số lượng** | **Thời gian chuyển đổi**
- [ ] **Given** the work session has no successful records, **When** the page loads, **Then** an empty state message is shown (e.g., "Không có bản ghi chuyển đổi thành công")
- [ ] **Given** the "Trạng thái chuyển đổi" column, **Then** it displays as "{from_status} → {to_status}" with clear visual formatting
- [ ] **Given** the "Thời gian chuyển đổi" column, **Then** it displays in warehouse timezone (DD/MM/YYYY HH:mm:ss format)

## Technical Notes

- Calls `GET /conversion-bills/{bill_code}` API (story 011)
- Web page (React), not PDA
- Only success records displayed; failed records not shown on this view
- Navigate here from bill list page (story 007)

## Dependencies

### Requires
- 011-get-bill-detail-api (backend API must be available)

### Enables
- None (leaf screen)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Work session not found | 404 error page |
| Very long item name | Truncated with tooltip |
| API error / timeout | Error banner with retry button |

## Out of Scope
- Editing or reversing conversions from this page
- Failed records view (separate feature if needed)
- Export to CSV/Excel
