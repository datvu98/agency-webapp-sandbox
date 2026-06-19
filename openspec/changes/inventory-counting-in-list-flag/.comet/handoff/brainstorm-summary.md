# Brainstorm Summary

- Change: inventory-counting-in-list-flag
- Date: 2026-06-18

## Confirmed Technical Approach

Pages đã tồn tại. Cần 4 file thay đổi:

1. **`src/graphql/queries/query_fulfillmentVariantStockList.ts`**: Thêm `$recordId: Int` variable + truyền vào query call + thêm `inList` vào data fields.

2. **`src/graphql/queries/query_locationManagerList.ts`**: Thêm `$recordId: Int` optional variable + truyền vào query call + thêm `inList` vào data fields. Backward-compatible — các caller khác không truyền `recordId` thì `inList: null`.

3. **`AddBySkuDialog.tsx`**: `recordId` prop đã có nhưng chưa truyền vào query variables. Thêm vào. `VariantCard`: khi `item.inList === true` → hiển thị badge "Đã thêm" + disable click/toggle.

4. **`AddByLocationDialog.tsx`**: Truyền `recordId` vào query slot (type="slot" — query thứ 3). Area/rack queries không cần. Slot checkbox item: khi `inList === true` → badge "Đã thêm" + disabled.

**Refetch strategy:** `fetchPolicy: "network-only"` trên cả hai dialogs đã cover — mỗi lần mở dialog sẽ query lại. `onSuccess()` đóng dialog, không cần explicit refetch nội bộ.

## Key Trade-offs and Risks

- **Shared query file `query_locationManagerList.ts`:** Dùng ở nhiều trang LocationManagement. Thêm `$recordId: Int` optional → không breaking vì arg là optional.
- **Area/rack queries không có inList:** Đúng thiết kế — chỉ slot-level mới có storage equipment liên kết với record items.

## Testing Strategy

- Component test: mock `inList: true` response → badge render đúng, click disabled
- `fetchPolicy: "network-only"` tự động cover refetch sau reopen

## Spec Patches

None.
