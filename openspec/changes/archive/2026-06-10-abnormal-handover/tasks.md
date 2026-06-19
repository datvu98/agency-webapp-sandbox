## 1. GraphQL Files

- [x] 1.1 Create `src/graphql/mutations/mutate_createAbnormalHandover.ts` — query fields: `success`, `message`, `data { totalItems successCount failedItems { warehouseBillId code error } createdHandoverLists { id code shippingCarrier shippingCarrierCode totalItems handoverAt } }`
- [x] 1.2 Add `isAbnormal` to the `data {}` block in `src/graphql/queries/query_handoverListListWithPagination.ts`

## 2. Helpers

- [x] 2.1 Add `buildBatches(bills)` to `src/app/pages/WarehouseManagement/HandOverList/helpers.ts`: `_.chain(bills).groupBy('shippingCarrier').flatMap(g => _.chunk(g, 50)).value()`
- [x] 2.2 Add `aggregate(results)` to `helpers.ts`: reduces `totalItems` and `successCount`, unions `failedItems`, flattens `createdHandoverLists` across all batch results

## 3. Fix ModalResult Error Columns

- [x] 3.1 In `src/app/pages/WarehouseManagement/HandOverList/dialogs/ModalResult.tsx` update error table: column "Mã Kiện" `dataIndex: "code"` (was `trackingNumber`), column "Lỗi" `dataIndex: "error"` (was `message`); remove hardcoded `'kkk'` render

## 4. New ModalSessionInfo Component

- [x] 4.1 Create `src/app/pages/WarehouseManagement/HandOverList/dialogs/ModalSessionInfo.tsx` — props: `open: boolean`, `handoverLists: any[]`, `onClose: () => void`
- [x] 4.2 Render heading "Hệ thống đã tạo {handoverLists.length} phiên bàn giao"
- [x] 4.3 Render Ant Design `Table` with columns: "Mã phiên" (`code`), "Đơn vị vận chuyển" (`shippingCarrier`), "Tổng số kiện" (`totalItems`)
- [x] 4.4 Render hint text "Vui lòng sang màn Bàn giao xuất hàng để kiểm tra thêm thông tin" and a "Đóng" button calling `onClose`

## 5. Rewrite AbnormalTable.tsx

- [x] 5.1 Remove imports and `useMutation` calls for `mutate_startHandover`, `mutate_upsertItemHandover`, `mutate_completeHandover`
- [x] 5.2 Add `const [createAbnormalHandover] = useMutation(mutate_createAbnormalHandover)`
- [x] 5.3 Add state `showSessionInfo: boolean` (default false) and `aggregatedResult` (default null); remove `processing` state
- [x] 5.4 Rewrite `handleCreateHandover`: (1) `setShowConfirm(false)`, `setShowProgress(true)`, `setProcessed([])` — (2) loop `buildBatches(selected)` sequentially with `for...of`, call mutation, push batch bills to `processed` in `finally`, catch network errors as synthetic `failedItems` — (3) after loop: `setShowProgress(false)`, `setAggregatedResult(aggregate(allResults))`, `setShowResult(true)`, `refetch()`
- [x] 5.5 Update `ModalResult` `onClose` prop: `() => { setShowResult(false); if (aggregatedResult?.createdHandoverLists?.length) setShowSessionInfo(true); }`
- [x] 5.6 Pass correct props to `ModalResult`: `total={aggregatedResult?.totalItems}`, `success={aggregatedResult?.successCount}`, `failed={aggregatedResult?.failedItems?.length}`, `errors={aggregatedResult?.failedItems}`
- [x] 5.7 Add `<ModalSessionInfo open={showSessionInfo} handoverLists={aggregatedResult?.createdHandoverLists ?? []} onClose={() => setShowSessionInfo(false)} />` to render

## 6. HandOverListTable Warning Badge

- [x] 6.1 In `src/app/pages/WarehouseManagement/HandOverList/components/HandOverListTable.tsx`, inside the `code` column `render` function add below the session code link: `{record?.isAbnormal && <Text type="danger" style={{ display: 'block', fontSize: 12 }}>Phiên được tạo tự động để xử lý các đơn bất thường</Text>}`
