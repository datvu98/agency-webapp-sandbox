## Why

Warehouse bills that were physically picked up by a carrier (`packStatus ∈ {shipping, shipped, completed}`) sometimes exist in the system with `status = new` and no corresponding handover session — meaning the handover was never formally recorded. The agency webapp needs a new "Bất thường" (Abnormal) sub-tab in the Handover screen so operators can select these bills, trigger retroactive handover session creation, and track progress in real time.

## What Changes

- Add a new **`createAbnormalHandover` GraphQL mutation file** consumed by the abnormal tab.
- **Rewrite `AbnormalTable.tsx`**: replace the stubbed 3-mutation flow with a single `createAbnormalHandover` call per carrier-group batch.
- Add a new **`ModalSessionInfo` dialog** showing the list of created handover sessions after processing completes.
- **Fix `ModalResult.tsx`** error-table column bindings (`code` / `error` instead of `trackingNumber` / `message`).
- Add `isAbnormal` to the **`handoverListListWithPagination` query**, and display a warning badge in `HandOverListTable.tsx` for abnormal sessions.

## Capabilities

### New Capabilities

- `abnormal-handover`: Frontend flow that groups selected warehouse bills by carrier, batches them to ≤50, calls `createAbnormalHandover` sequentially per batch, tracks live progress, and shows aggregated results plus a session-info summary.

### Modified Capabilities

- `warehouse-management`: `HandOverListTable` gains a conditional warning badge for rows where `isAbnormal = true`.

## Impact

- **Files changed**: `src/app/pages/WarehouseManagement/HandOverList/` — `AbnormalTable.tsx`, `HandOverListTable.tsx`, `helpers.ts`, `dialogs/ModalResult.tsx`, new `dialogs/ModalSessionInfo.tsx`; `src/graphql/mutations/mutate_createAbnormalHandover.ts` (new); `src/graphql/queries/query_handoverListListWithPagination.ts`
- **No breaking changes** to existing handover tabs or mutations
- **Dependencies**: backend `createAbnormalHandover` mutation must be deployed before this frontend change goes live
