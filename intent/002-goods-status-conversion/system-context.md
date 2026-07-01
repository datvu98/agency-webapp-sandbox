---
intent: 002-goods-status-conversion
phase: inception
status: context-defined
updated: 2026-06-22T00:00:00+07:00
---

# Goods Status Conversion — System Context

## System Overview

Hệ thống cung cấp PDA flow cho nhân viên kho chuyển đổi trạng thái hàng hoá theo phiên có kiểm soát.
Nhân viên quét vị trí → quét hàng hoá → nhập trạng thái đích → quản lý danh sách → chốt phiên.
Khi chốt, tồn thực tế được cập nhật nguyên tử (trừ trạng thái nguồn / cộng trạng thái đích)
và mỗi chuyển đổi được ghi nhận dưới dạng giao dịch.

Phạm vi: **UT03 / WMS — Inventory** của nền tảng UpS.

## Context Diagram

```mermaid
C4Context
    title System Context - 002-goods-status-conversion

    Person(staff, "Warehouse Staff", "Nhân viên kho, sử dụng PDA")

    System(gsc, "Goods Status Conversion", "PDA work session: scan → validate → set status → commit")

    System_Ext(wms_inv, "WMS Inventory Service", "Tra cứu tồn kho theo vị trí & trạng thái; cập nhật tồn sau chuyển đổi")
    System_Ext(wms_lock, "WMS Job Lock Service", "Kiểm tra vị trí có đang thuộc công việc active khác không")
    System_Ext(wms_hold, "WMS Hold Service", "Kiểm tra hàng hoá có bị tạm giữ không")
    System_Ext(tx, "Transaction Ledger", "Ghi nhận giao dịch loại 'Chuyển đổi trạng thái'")
    System_Ext(auth, "Auth Service", "Xác thực nhân viên đăng nhập")

    Rel(staff, gsc, "Quét & thao tác qua PDA")
    Rel(gsc, wms_inv, "Query tồn kho; cập nhật stock sau commit")
    Rel(gsc, wms_lock, "Kiểm tra lock vị trí")
    Rel(gsc, wms_hold, "Kiểm tra hold hàng hoá")
    Rel(gsc, tx, "Ghi nhận giao dịch")
    Rel(gsc, auth, "Verify user work session")
```

## Actors

| Actor | Type | Mô tả |
|-------|------|-------|
| Warehouse Staff | Human | Nhân viên kho thực hiện chuyển đổi trạng thái trên PDA |

## External Integrations

| System | Direction | Data Exchanged | Protocol |
|--------|-----------|----------------|----------|
| WMS Inventory Service | Both | Query: danh sách hàng theo vị trí, tồn kho theo (SKU, location, status) <br>Write: deduct source status, add target status | REST |
| WMS Job Lock Service | Inbound query | Location ID → có/không active job khác | REST |
| WMS Hold Service | Inbound query | Item ID → có/không active hold | REST |
| Transaction Ledger | Outbound | Conversion record: staff, item, location, from_status, to_status, qty, note, timestamp | REST / Event |
| Auth Service | Inbound | User work session validation | JWT / existing auth |

## Data Flows

### Inbound
- Barcode scan từ PDA (location barcode, item barcode)
- User JWT / work session token
- Status input (target status, notes) từ form

### Outbound
- Stock mutations: `UPDATE inventory SET qty = qty - n WHERE (sku, location, status = source)`
  và `UPDATE inventory SET qty = qty + n WHERE (sku, location, status = target)` — atomic
- Transaction records: 1 record per successful conversion

## High-Level Constraints

- KHÔNG đồng bộ lên channel (Shopee, Lazada, TikTok) — chỉ ảnh hưởng internal WMS stock
- KHÔNG có approval workflow
- Không có transition matrix — mọi cặp source → target đều hợp lệ
- PDA-first UI (mobile, barcode scanner)

## Key NFR Goals

- Per-record atomicity khi commit (trừ + cộng trong 1 DB transaction)
- Partial failure tolerance: 1 record lỗi không rollback cả phiên
- Validation latency < 500ms trên PDA
- Full audit trail cho tất cả chuyển đổi thành công
