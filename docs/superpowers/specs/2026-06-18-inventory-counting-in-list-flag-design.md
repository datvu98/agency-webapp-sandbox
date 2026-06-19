---
comet_change: inventory-counting-in-list-flag
role: technical-design
canonical_spec: openspec
---

# Technical Design: inventory-counting-in-list-flag (agency-webapp)

## Context

Màn hình chỉnh sửa phiếu kiểm kê (`InventoryCountingDetail`) đã có hai dialog:
- `AddBySkuDialog` — gọi `fulfillmentVariantStockList`, nhận `recordId` làm prop nhưng chưa truyền vào query
- `AddByLocationDialog` — gọi `locationManagerList` 3 lần (area/rack/slot), nhận `recordId` làm prop nhưng chưa truyền vào query slot

Backend đã bổ sung `inList` field. Webapp cần cập nhật query definitions và render trạng thái "Đã thêm".

## Files Changed

| File | Thay đổi |
|------|----------|
| `src/graphql/queries/query_fulfillmentVariantStockList.ts` | Thêm `$recordId: Int` arg + `inList` field |
| `src/graphql/queries/query_locationManagerList.ts` | Thêm `$recordId: Int` optional arg + `inList` field |
| `InventoryCountingDetail/dialogs/AddBySkuDialog.tsx` | Truyền `recordId` vào query vars + render badge |
| `InventoryCountingDetail/dialogs/AddByLocationDialog.tsx` | Truyền `recordId` vào slot query + render badge |

## Implementation Detail

### 1. query_fulfillmentVariantStockList.ts

Thêm `$recordId: Int` vào variable list và query call. Thêm `inList` vào data fields:

```graphql
query fulfillmentVariantStockList(
  ...existing args...
  $recordId: Int
) {
  fulfillmentVariantStockList(
    ...existing args...
    recordId: $recordId
  ) {
    data {
      ...existing fields...
      inList
    }
  }
}
```

### 2. query_locationManagerList.ts

Thêm `$recordId: Int` optional. Backward-compatible — các trang LocationManagement không truyền `recordId` → `inList: null`, không ảnh hưởng UI cũ.

```graphql
query locationManagerList(
  ...existing args...
  $recordId: Int
) {
  locationManagerList(
    ...existing args...
    recordId: $recordId
  ) {
    data {
      ...existing fields...
      inList
    }
  }
}
```

### 3. AddBySkuDialog.tsx

**Query variables**: thêm `recordId` (prop đã có, chỉ cần truyền vào variables):
```typescript
variables: {
  fulfillmentWarehouseId: warehouseId,
  recordId,           // thêm
  smeId: selectedSmeId,
  ...
},
```

**VariantCard** — thêm `inList` badge và disable khi đã thêm:
```tsx
const VariantCard = ({ item, selected, onToggle }: VariantCardProps) => {
  const isAdded = item?.inList === true;
  return (
    <div
      onClick={() => !isAdded && onToggle(item?.variantId)}
      style={{
        ...existing styles,
        cursor: isAdded ? "not-allowed" : "pointer",
        opacity: isAdded ? 0.7 : 1,
      }}
    >
      {/* existing content */}
      {isAdded && (
        <Tag color="green" style={{ marginTop: 4, fontSize: 11 }}>Đã thêm</Tag>
      )}
    </div>
  );
};
```

### 4. AddByLocationDialog.tsx

Chỉ query slot (thứ 3) cần `recordId`. Area và rack queries không thay đổi:

```typescript
const { data: slotData, loading: loadingSlot } = useQuery(query_locationManagerList, {
  variables: {
    warehouseId, type: "slot", isActive: true,
    areaId_in: [selectedArea], rackId_in: [selectedRack],
    recordId,    // thêm
  },
  ...
});
```

`slotList` mapping — giữ lại `inList`:
```typescript
const slotList = useMemo(
  () =>
    (slotData?.locationManagerList?.data ?? []).map((i: any) => ({
      label: i?.code,
      value: i?.id,
      inList: i?.inList,   // thêm
    })),
  [slotData]
);
```

Slot item render — disabled + badge:
```tsx
<Checkbox
  checked={selectedSlots?.includes(slot?.value)}
  disabled={slot?.inList === true}
  onChange={...}
>
  {slot?.label}
  {slot?.inList === true && (
    <Tag color="green" style={{ marginLeft: 4, fontSize: 11 }}>Đã thêm</Tag>
  )}
</Checkbox>
```

## Refetch Strategy

`fetchPolicy: "network-only"` (AddBySkuDialog) đảm bảo mỗi lần mở dialog sẽ query lại với `inList` mới nhất. `onSuccess()` đóng dialog — khi mở lại sẽ tự refetch. Không cần explicit refetch thêm.

## Backward Compatibility

`query_locationManagerList.ts` được dùng ở nhiều trang LocationManagement. `$recordId: Int` là optional — các caller không truyền → `inList: null` → UI LocationManagement không bị ảnh hưởng.

## Testing Strategy

- Component test: render `VariantCard` với `item.inList = true` → Tag "Đã thêm" hiển thị, click không gọi `onToggle`
- Component test: render slot checkbox với `inList: true` → Checkbox disabled, Tag hiển thị
- E2E: mở AddBySkuDialog → add variant → đóng → mở lại → variant vừa add hiển thị "Đã thêm"
