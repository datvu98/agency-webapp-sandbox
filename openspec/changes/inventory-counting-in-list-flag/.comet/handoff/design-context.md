# Comet Design Handoff

- Change: inventory-counting-in-list-flag
- Phase: design
- Mode: compact
- Context hash: f00f1dbe32da6d76cb2b2cd2d27b8eb616f82f6f1f05fb84b133d0a2bd7e5a6b

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/inventory-counting-in-list-flag/proposal.md

- Source: openspec/changes/inventory-counting-in-list-flag/proposal.md
- Lines: 1-26
- SHA256: 93912a6735bb7ccdb495cdcd68b0b231a01b6757fdf3bb3073836b4a42809f05

```md
## Why

Backend đã bổ sung `inList: Boolean` flag vào `fulfillmentVariantStockList` và `locationManagerList`. Webapp cần cập nhật để truyền `recordId` và hiển thị trạng thái "đã thêm" trên mỗi item trong danh sách chọn khi manager tạo/chỉnh sửa phiếu kiểm kê.

## What Changes

- Cập nhật GraphQL query `fulfillmentVariantStockList`: thêm arg `recordId` và field `inList` vào query definition.
- Cập nhật GraphQL query `locationManagerList`: thêm arg `recordId` và field `inList` vào query definition.
- Màn hình tạo/chỉnh sửa phiếu kiểm kê: truyền `recordId` của phiếu đang mở khi gọi 2 query trên.
- Render badge/disabled state "Đã thêm" trên mỗi item có `inList: true` trong danh sách chọn variant và location.

## Capabilities

### New Capabilities

- `inventory-counting-variant-in-list-ui`: Hiển thị trạng thái "đã thêm" trên danh sách chọn variant trong màn hình tạo phiếu kiểm kê.
- `inventory-counting-location-in-list-ui`: Hiển thị trạng thái "đã thêm" trên danh sách chọn location trong màn hình tạo phiếu kiểm kê.

### Modified Capabilities

## Impact

- GraphQL query definitions cho `fulfillmentVariantStockList` và `locationManagerList`
- Component/hook gọi 2 query trên trong màn hình tạo/chỉnh sửa phiếu kiểm kê
- UI components danh sách chọn variant và location (thêm visual indicator cho `inList`)
- Phụ thuộc: backend inventory-system phải deploy `inventory-counting-in-list-flag` trước
```

## openspec/changes/inventory-counting-in-list-flag/design.md

- Source: openspec/changes/inventory-counting-in-list-flag/design.md
- Lines: 1-43
- SHA256: 0279320c5065a668231fb34fa9b1b600c0ef26fb42817f6a0db2c4b5517b3d04

```md
## Context

Backend (inventory-system) đã thêm:
- `fulfillmentVariantStockList(recordId?: Int)` → `VariantStockItem.inList?: Boolean`
- `locationManagerList(recordId?: Int)` → `LocationManager.inList?: Boolean`

Webapp hiện có màn hình tạo/chỉnh sửa phiếu kiểm kê (wizard 2 bước). Bước 2 cho phép manager thêm hàng hoá theo variant hoặc thêm vị trí theo location. 2 query trên được gọi tại đây nhưng chưa truyền `recordId` và chưa dùng `inList`.

## Goals / Non-Goals

**Goals:**
- Truyền `recordId` khi gọi `fulfillmentVariantStockList` và `locationManagerList` trong màn hình tạo/chỉnh sửa phiếu
- Render badge/disabled state "Đã thêm" trên item có `inList: true`

**Non-Goals:**
- Không thay đổi logic thêm/xoá items
- Không handle realtime sync — user refresh để cập nhật `inList`

## Decisions

### D1: Truyền `recordId` từ route/state của màn hình

`recordId` được lấy từ route params hoặc state của wizard (phiếu được tạo ở step 1, `recordId` có sẵn khi mở step 2). Không cần thêm state mới.

### D2: `inList: true` → disabled button, badge "Đã thêm"

Item đã có `inList: true` sẽ hiển thị badge "Đã thêm" và disable nút thêm. Tránh duplicate từ phía UI (server cũng đã deduplicate).

### D3: Refetch sau khi thêm item thành công

Sau mỗi mutation thêm variant/location thành công, trigger refetch `fulfillmentVariantStockList` và `locationManagerList` để cập nhật `inList`. Tránh stale state.

## Risks / Trade-offs

- **Stale `inList`:** Nếu không refetch, badge "Đã thêm" sẽ không hiện ngay sau khi add. Xử lý bằng D3.

## Migration Plan

Backend deploy trước. Webapp chỉ update query và UI — không breaking change.

## Open Questions

Không còn câu hỏi mở.
```

## openspec/changes/inventory-counting-in-list-flag/tasks.md

- Source: openspec/changes/inventory-counting-in-list-flag/tasks.md
- Lines: 1-19
- SHA256: b2735edecc5b60ce70495a6507c033888ad31a77edb91a72855cc10f5e05f223

```md
## 1. Cập nhật GraphQL query definitions

- [ ] 1.1 Thêm arg `recordId: Int` và field `inList` vào query `fulfillmentVariantStockList` (fragment/query definition)
- [ ] 1.2 Thêm arg `recordId: Int` và field `inList` vào query `locationManagerList` (fragment/query definition)

## 2. Truyền recordId từ màn hình phiếu kiểm kê

- [ ] 2.1 Trong hook/component gọi `fulfillmentVariantStockList` ở màn hình tạo/chỉnh sửa phiếu: lấy `recordId` từ route params hoặc wizard state và truyền vào query
- [ ] 2.2 Trong hook/component gọi `locationManagerList` ở màn hình tạo/chỉnh sửa phiếu: lấy `recordId` từ route params hoặc wizard state và truyền vào query

## 3. Render trạng thái đã thêm trên UI

- [ ] 3.1 Danh sách chọn variant: item có `inList: true` hiển thị badge "Đã thêm" và disable nút thêm
- [ ] 3.2 Danh sách chọn location: item có `inList: true` hiển thị badge "Đã thêm" và disable nút thêm

## 4. Refetch sau khi thêm thành công

- [ ] 4.1 Sau mutation thêm variant thành công: trigger refetch `fulfillmentVariantStockList`
- [ ] 4.2 Sau mutation thêm location thành công: trigger refetch `locationManagerList`
```

## openspec/changes/inventory-counting-in-list-flag/specs/inventory-counting-location-in-list-ui/spec.md

- Source: openspec/changes/inventory-counting-in-list-flag/specs/inventory-counting-location-in-list-ui/spec.md
- Lines: 1-26
- SHA256: ce0f65ba4986ee1832d05d531e87629623bcd84b28816762cbb5b0873225b572

```md
## ADDED Requirements

### Requirement: Webapp truyền recordId khi gọi locationManagerList
Webapp SHALL truyền `recordId` của phiếu kiểm đang chỉnh sửa vào arg `recordId` của query `locationManagerList` khi manager mở modal chọn location để thêm vào phiếu.

#### Scenario: recordId được truyền khi mở modal chọn location
- **WHEN** manager mở màn hình tạo/chỉnh sửa phiếu kiểm và mở danh sách chọn location
- **THEN** query `locationManagerList` được gọi với `recordId` của phiếu đang mở

### Requirement: Location có inList true hiển thị trạng thái đã thêm
Webapp SHALL hiển thị trạng thái "Đã thêm" trên item location có `inList: true`. Nút thêm SHALL bị disabled hoặc ẩn. Item có `inList: false` hiển thị bình thường.

#### Scenario: Location đã thêm hiển thị badge và disabled
- **WHEN** danh sách chọn location load xong với `inList` data từ server
- **THEN** location có `inList: true` hiển thị badge "Đã thêm" và nút thêm bị disabled

#### Scenario: Location chưa thêm hiển thị nút thêm bình thường
- **WHEN** danh sách chọn location load xong
- **THEN** location có `inList: false` hiển thị nút thêm active như trước

### Requirement: Danh sách inList được cập nhật sau khi thêm location thành công
Sau khi mutation thêm location thành công, webapp SHALL refetch `locationManagerList` để cập nhật `inList`.

#### Scenario: inList cập nhật sau khi thêm
- **WHEN** manager thêm location thành công
- **THEN** danh sách chọn location được refetch và location vừa thêm hiển thị trạng thái "Đã thêm"
```

## openspec/changes/inventory-counting-in-list-flag/specs/inventory-counting-variant-in-list-ui/spec.md

- Source: openspec/changes/inventory-counting-in-list-flag/specs/inventory-counting-variant-in-list-ui/spec.md
- Lines: 1-26
- SHA256: da253b07dfe2357e07b41f336dc46a6c619894e6442f2491dbd465d2392cdef5

```md
## ADDED Requirements

### Requirement: Webapp truyền recordId khi gọi fulfillmentVariantStockList
Webapp SHALL truyền `recordId` của phiếu kiểm đang chỉnh sửa vào arg `recordId` của query `fulfillmentVariantStockList` khi manager mở modal chọn variant để thêm vào phiếu.

#### Scenario: recordId được truyền khi mở modal chọn variant
- **WHEN** manager mở màn hình tạo/chỉnh sửa phiếu kiểm và mở danh sách chọn variant
- **THEN** query `fulfillmentVariantStockList` được gọi với `recordId` của phiếu đang mở

### Requirement: Variant có inList true hiển thị trạng thái đã thêm
Webapp SHALL hiển thị trạng thái "Đã thêm" trên item variant có `inList: true`. Nút thêm SHALL bị disabled hoặc ẩn. Item có `inList: false` hiển thị bình thường.

#### Scenario: Variant đã thêm hiển thị badge và disabled
- **WHEN** danh sách chọn variant load xong với `inList` data từ server
- **THEN** variant có `inList: true` hiển thị badge "Đã thêm" và nút thêm bị disabled

#### Scenario: Variant chưa thêm hiển thị nút thêm bình thường
- **WHEN** danh sách chọn variant load xong
- **THEN** variant có `inList: false` hiển thị nút thêm active như trước

### Requirement: Danh sách inList được cập nhật sau khi thêm variant thành công
Sau khi mutation thêm variant thành công, webapp SHALL refetch `fulfillmentVariantStockList` để cập nhật `inList`.

#### Scenario: inList cập nhật sau khi thêm
- **WHEN** manager thêm variant thành công
- **THEN** danh sách chọn variant được refetch và variant vừa thêm hiển thị trạng thái "Đã thêm"
```

