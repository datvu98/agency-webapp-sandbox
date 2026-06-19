# Warehouse Management

## Overview
Full WMS frontend for fulfillment provider users — inbound, outbound, location management, billing, stock.

## Capabilities

### Inbound
- HandOver list and detail — receive goods from carrier
- Restock — restock existing inventory

### Outbound / Processing
- Processing list — build outbound processing batches
- Processing create/detail
- Packing station — scan-to-pack workflow
- Packing detail, packing label printing

### Location Management
- View and manage warehouse bin/location layout
- Product stock overview per location

### Billing
- Warehouse bill inbound: list + detail
- Warehouse bill outbound: list + detail

### Warehouse Config
- Warehouse list, create, update

### History
- History export — audit trail of warehouse operations

## Pages
| Page | Path |
|------|------|
| `HandOverList` | `/inbound-manage/handover` |
| `HandOverDetail` | `/inbound-manage/handover/:id` |
| `Restock` | `/inbound-manage/restock` |
| `ProcessingList` | `/outbound-manage/processing` |
| `ProcessingCreate` | `/outbound-manage/processing/create` |
| `ProcessingDetail` | `/outbound-manage/processing/:id` |
| `PackStation` | `/outbound-manage/pack-station` |
| `PackingDetail` | `/outbound-manage/packing/:id` |
| `PackingLabel` | `/outbound-manage/packing/:id/label` |
| `LocationManagement` | `/warehouse-manage/location` |
| `ProductStock` | `/warehouse-manage/stock` |
| `WarehouseBillInList` | `/warehouse-manage/bill/in` |
| `WarehouseBillInDetail` | `/warehouse-manage/bill/in/:id` |
| `WarehouseBillOutList` | `/warehouse-manage/bill/out` |
| `WarehouseBillOutDetail` | `/warehouse-manage/bill/out/:id` |
| `WarehouseList` | `/warehouse-manage/warehouses` |
| `WarehouseCreate` | `/warehouse-manage/warehouses/create` |
| `WarehouseUpdate` | `/warehouse-manage/warehouses/:id` |
| `HistoryExport` | `/warehouse-manage/history` |

## Access
- Fulfillment provider users get this route set
- Agency users also see this under `WarehouseManagement` with full-access role

## Requirements

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

## Open Questions
- [ ] PackStation: barcode scanner or click-based or both?
- [ ] HistoryExport: what event types are included in the audit trail?
