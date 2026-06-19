## MODIFIED Requirements

### Requirement: HandoverList table shows warning badge for abnormal sessions
In the "Bàn giao xuất hàng" tab, `HandOverListTable` SHALL render a red warning line beneath the session code for any row where `isAbnormal = true`. The text SHALL be "Phiên được tạo tự động để xử lý các đơn bất thường". Rows with `isAbnormal = false` SHALL show no warning.

#### Scenario: Warning shown for abnormal session
- **WHEN** the main handover list table renders a record with `isAbnormal = true`
- **THEN** a red warning line is visible below the session code in that row

#### Scenario: No warning for normal sessions
- **WHEN** the main handover list table renders a record with `isAbnormal = false`
- **THEN** no warning line is shown in that row

#### Scenario: isAbnormal field fetched in list query
- **WHEN** `handoverListListWithPagination` is queried
- **THEN** each record includes the `isAbnormal` field
