---
id: 010-get-bill-list-api
unit: 001-goods-status-conversion-service
intent: 002-goods-status-conversion
status: draft
priority: must
created: 2026-06-25T00:00:00+07:00
assigned_bolt: 008-goods-status-conversion-service
implemented: false
---

# Story: 010-get-bill-list-api

## User Story

**As a** supervisor / manager on web
**I want** an API to retrieve the list of conversion bills (phiếu chuyển đổi trạng thái)
**So that** the web UI can display the history of completed status conversions

## Acceptance Criteria

- [ ] **Given** I call the GET bill list API, **Then** the response returns a paginated list of phiếu sorted by `created_at` DESC
- [ ] **Given** the list, **Then** each phiếu entry includes: `bill_code`, `staff_name`, `record_count` (number of success records), `created_at`
- [ ] **Given** no phiếu exist yet, **Then** the API returns an empty list (200 OK)
- [ ] **Given** the caller is not authorized, **Then** the API returns 403

## Technical Notes

- Data source: `ConversionWorkSession` where `status = completed` (each completed session = 1 phiếu)
- `record_count` = count of `ConversionRecord` with `state = success` for that session
- Paginated: default page size 20; supports `page` and `page_size` query params
- Read-only endpoint; no state mutation

## Dependencies

### Requires
- 007-commit-session (bill_code is generated on successful commit)

### Enables
- 007-bill-list-web-page (frontend calls this API)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Very large number of phiếu (1000+) | Paginated response; default page 1 |
| Staff with no completed phiếu | Empty list (200 OK) |

## Out of Scope
- Filtering by date range, staff, or status (future enhancement)
- Export to CSV / Excel
