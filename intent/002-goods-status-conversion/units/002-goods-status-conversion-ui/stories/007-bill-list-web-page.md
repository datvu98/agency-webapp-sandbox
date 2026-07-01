---
id: 007-bill-list-web-page
unit: 002-goods-status-conversion-ui
intent: 002-goods-status-conversion
status: draft
priority: must
created: 2026-06-25T00:00:00+07:00
assigned_bolt: 010-goods-status-conversion-ui-web
implemented: false
---

# Story: 007-bill-list-web-page

## User Story

**As a** supervisor / manager on web
**I want** to view a list of all goods status conversion bills (phiếu chuyển đổi trạng thái)
**So that** I can track and review completed conversion work

## Acceptance Criteria

- [ ] **Given** I navigate to the phiếu list page, **When** the page loads, **Then** I see a table of phiếu with columns: **Mã phiếu**, **Nhân viên thực hiện**, **Số lượng bản ghi**, **Thời gian tạo phiếu**
- [ ] **Given** the list, **Then** it is sorted by thời gian tạo mới nhất trước (DESC)
- [ ] **Given** I click on a row, **Then** I am navigated to the phiếu detail page (story 006) for that bill
- [ ] **Given** no phiếu exist, **When** the page loads, **Then** an empty state message is shown (e.g., "Chưa có phiếu chuyển đổi trạng thái nào")
- [ ] **Given** there are many phiếu, **Then** pagination is available (20 per page)

## Technical Notes

- Calls `GET /conversion-bills` API (story 010)
- Web page (React), not PDA
- Navigation to detail page: `/conversion-bills/{bill_code}`

## Dependencies

### Requires
- 010-get-bill-list-api (backend API must be available)

### Enables
- 006-conversion-detail-web-page (list page is the entry point to detail)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| API error / timeout | Error banner with retry button |
| Very long staff name | Truncated with tooltip |

## Out of Scope
- Filtering by date range or staff
- Exporting list to CSV
