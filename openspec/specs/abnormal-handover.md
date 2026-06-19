# Abnormal Handover

## Overview
Frontend flow for retroactively creating handover sessions for warehouse bills that were physically picked up by a carrier but never formally handed over (bills with `packStatus ∈ {shipping, shipped, completed, cancelled}` and `status = new`). Operators select these bills in the "Bất thường" sub-tab, trigger batch creation, and see live progress and results.

## Capabilities

### abnormal-handover
Groups selected warehouse bills by carrier, chunks to ≤50, calls `createAbnormalHandover` sequentially per batch, tracks live progress via `ModalProgress`, and shows aggregated results in `ModalResult` followed by a `ModalSessionInfo` summary of created sessions.

## Requirements

### Requirement: Frontend groups selected bills by carrier and chunks to ≤50 before calling
The webapp SHALL group selected warehouse bills by `shippingCarrier`, chunk each carrier group to a maximum of 50 bills, and call `createAbnormalHandover` once per chunk sequentially (not in parallel). A `buildBatches(bills)` helper SHALL implement this logic.

#### Scenario: 20 bills across 2 carriers — 2 sequential calls
- **WHEN** a user selects 15 GHN bills and 5 GHTK bills and confirms
- **THEN** the webapp calls `createAbnormalHandover` for GHN (15 bills), waits for response, then calls `createAbnormalHandover` for GHTK (5 bills)

#### Scenario: Single carrier with 60 bills — 2 sequential calls
- **WHEN** a user selects 60 bills all from the same carrier and confirms
- **THEN** the webapp makes two sequential calls: first with 50 bills, then with the remaining 10

### Requirement: Frontend shows live progress across batches via ModalProgress
After each batch call completes (success or error), the webapp SHALL append that batch's bills to the `processed` state array in a `finally` block. `ModalProgress` SHALL reflect `processed.length / selected.length` as the progress percentage.

#### Scenario: Progress updates between batches
- **WHEN** the first batch of 15 GHN bills completes
- **THEN** ModalProgress shows 15 / 20 processed before the second batch starts

#### Scenario: Progress advances even on network error
- **WHEN** a batch call throws a network error
- **THEN** the batch bills are still added to `processed` and progress advances

### Requirement: Network errors produce synthetic failedItems and do not abort the loop
If a batch mutation call throws (network error, timeout), the webapp SHALL catch the error, create synthetic `failedItem` entries for each bill in that batch (with `error = 'network_error'`), and continue processing the remaining batches.

#### Scenario: Network error on first batch does not prevent second batch
- **WHEN** the first carrier batch fails with a network error
- **THEN** the webapp still calls `createAbnormalHandover` for the second carrier batch and includes both results in the final aggregation

### Requirement: ModalResult shows aggregated results across all batches
After all batches complete, the webapp SHALL display `ModalResult` with aggregated data: `totalItems = sum of all batch totalItems`, `successCount = sum of all batch successCounts`, `failedItems = union of all batch failedItems`. An `aggregate(results)` helper SHALL implement this reduction. The error table SHALL use `code` (systemPackageNumber) as "Mã Kiện" and `error` as "Lỗi".

#### Scenario: Aggregate across two batches
- **WHEN** batch 1 returns successCount=15 and batch 2 returns successCount=4 with 1 failedItem
- **THEN** ModalResult shows total=20, success=19, failed=1 with the 1 failed bill in the error table

#### Scenario: Error table uses correct field names
- **WHEN** ModalResult renders the error table
- **THEN** the "Mã Kiện" column reads from `record.code` and "Lỗi" column reads from `record.error`

### Requirement: ModalSessionInfo shown after ModalResult is closed
After the operator closes `ModalResult`, if `createdHandoverLists` is non-empty the webapp SHALL open `ModalSessionInfo`. It SHALL display: heading "Hệ thống đã tạo {N} phiên bàn giao", a table with columns "Mã phiên" (`code`), "Đơn vị vận chuyển" (`shippingCarrier`), "Tổng số kiện" (`totalItems`), and hint text "Vui lòng sang màn Bàn giao xuất hàng để kiểm tra thêm thông tin" plus a "Đóng" button.

#### Scenario: Session info shown after results when sessions were created
- **WHEN** operator closes ModalResult and at least one HandoverList was created across all batches
- **THEN** ModalSessionInfo opens listing all created HandoverLists from all batches

#### Scenario: No session info when all bills failed
- **WHEN** operator closes ModalResult and `createdHandoverLists` is empty
- **THEN** ModalSessionInfo does not open
