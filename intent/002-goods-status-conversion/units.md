---
intent: 002-goods-status-conversion
phase: inception
status: draft
updated: 2026-06-22T00:00:00+07:00
---

# Units: 002-goods-status-conversion

## Unit Structure

Project type `full-stack-web` → Backend (DDD) + Frontend (Feature-based).

## Requirement-to-Unit Mapping

| FR | Description | Unit |
|----|-------------|------|
| FR-1 | Start conversion session | 001-goods-status-conversion-service |
| FR-2 | Validate location | 001-goods-status-conversion-service |
| FR-3 | Validate item | 001-goods-status-conversion-service |
| FR-4 | Input new status & notes (business rules) | 001-goods-status-conversion-service |
| FR-5 | Add record to session list | 001-goods-status-conversion-service |
| FR-6 | Delete record from session list | 001-goods-status-conversion-service |
| FR-7 | Commit session (partial failure) | 001-goods-status-conversion-service |
| FR-8 | Update inventory stock (atomic) | 001-goods-status-conversion-service |
| FR-9 | Record conversion transaction | 001-goods-status-conversion-service |
| FR-10 | Tạo phiếu chuyển đổi khi commit thành công | 001-goods-status-conversion-service |
| FR-11 | Danh sách phiếu trên web (API) | 001-goods-status-conversion-service |
| FR-12 | Chi tiết phiếu trên web (API) | 001-goods-status-conversion-service |
| FR-7 (UI) | Commit action + result screen (PDA) | 002-goods-status-conversion-ui |
| FR-11 (UI) | Danh sách phiếu — web page | 002-goods-status-conversion-ui |
| FR-12 (UI) | Chi tiết phiếu — web page | 002-goods-status-conversion-ui |
| All user-facing FRs | PDA screens (FR-1..FR-7 UI layer) | 002-goods-status-conversion-ui |

## Units

### Unit 001: goods-status-conversion-service (Backend)

- **Type**: backend
- **Bolt Type**: ddd-construction-bolt
- **Purpose**: Session lifecycle, validation, inventory mutation, transaction recording, bill generation + read APIs
- **Assigned Requirements**: FR-1 to FR-12
- **Dependencies**: WMS Inventory Service, WMS Lock Service, WMS Hold Service, Transaction Ledger
- **Interface**: REST API consumed by frontend unit

### Unit 002: goods-status-conversion-ui (Frontend)

- **Type**: frontend
- **Bolt Type**: simple-construction-bolt
- **Purpose**: PDA screens for the full goods status conversion flow + Web pages for phiếu list and detail
- **Assigned Requirements**: All user-facing FRs (UI layer over Unit 001 APIs) + FR-11, FR-12 (Web)
- **Dependencies**: Unit 001 API
- **Interface**: Calls Unit 001 REST endpoints

## Dependency Graph

```
001-goods-status-conversion-service
               │
               ▼
002-goods-status-conversion-ui
```

## Units Summary

| Unit | Type | Bolt Type | Stories | Priority |
|------|------|-----------|---------|----------|
| 001-goods-status-conversion-service | backend | ddd-construction-bolt | 12 | Must |
| 002-goods-status-conversion-ui | frontend | simple-construction-bolt | 7 | Must |
