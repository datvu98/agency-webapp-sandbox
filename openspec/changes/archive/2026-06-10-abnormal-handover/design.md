## Context

The `HandOverList` page already has three tabs: the main handover list, an "Abnormal" table (`AbnormalTable.tsx`), and a return-receipt tab. `AbnormalTable.tsx` is scaffolded but `handleCreateHandover` is stubbed — it uses a `setTimeout` placeholder and has the old 3-mutation (start→upsertItem→complete) flow commented out. That flow cannot work for abnormal bills because: (1) the bills have no `ProcessingListItem`, (2) the normal flow's `workSessionService.active()` would block if the operator already has an active session.

The backend now exposes `createAbnormalHandover(input: { warehouseBillIds: [Int!]! })` which creates one auto-completed `HandoverList` per call. The frontend is responsible for grouping bills by carrier and chunking to ≤50 before calling.

Existing modal infrastructure (`ModalConfirm`, `ModalProgress`, `ModalResult`) is already wired in `AbnormalTable.tsx`. A new `ModalSessionInfo` dialog needs to be added to display the created handover session codes after processing.

## Goals / Non-Goals

**Goals:**
- Replace the stubbed `handleCreateHandover` with a real sequential batching loop using `createAbnormalHandover`.
- Show live progress per bill via `ModalProgress` (updated after each batch completes).
- Show aggregated results in `ModalResult` across all batches, then `ModalSessionInfo` listing created sessions.
- Fix `ModalResult`'s error table column bindings.
- Surface `isAbnormal` warning badge in `HandOverListTable`.

**Non-Goals:**
- Any changes to `ModalConfirm` or `ModalProgress` component logic.
- Parallel batch execution — sequential is required to prevent duplicate sessions per carrier.
- Backend implementation (covered in the inventory-system change).

## Decisions

### D1: Group by carrier on frontend, one mutation call per chunk

**Decision**: `helpers.ts` gains `buildBatches(bills)` using `_.chain(bills).groupBy('shippingCarrier').flatMap(g => _.chunk(g, 50)).value()`. Each element is one batch of ≤50 bills sharing the same carrier. `handleCreateHandover` iterates these with `for...of` (sequential).

**Rationale**: The backend validates that all bills in a single call share the same carrier. Sequential execution prevents two concurrent calls for the same carrier (which would cause one to fail the `handover_list_items` uniqueness check). `for...of` with `await` is the simplest sequential pattern — no Promise.reduce or queue abstraction needed.

**Alternative considered**: Parallel calls with Promise.allSettled → rejected because two batches from the same carrier (60 bills → 50+10) would race and the second would fail.

---

### D2: Accumulate `processed` in `finally` block per batch

**Decision**: After each mutation call (success or failure), push the batch bills into `processed` state in a `finally` block. `ModalProgress` reads `processed.length / selected.length`.

**Rationale**: Progress must advance even when a batch returns `failedItems` (partial failure is still "processed"). Using `finally` ensures the progress bar doesn't stall on network errors — the batch's bills are marked as processed regardless.

---

### D3: Aggregate results client-side, then chain ModalResult → ModalSessionInfo

**Decision**: `helpers.ts` gains `aggregate(results)` that reduces across all batch responses: sums `totalItems` and `successCount`, unions `failedItems`, flattens `createdHandoverLists`. After the loop: show `ModalResult` with the aggregated data. `ModalResult`'s `onClose` conditionally opens `ModalSessionInfo` if `createdHandoverLists.length > 0`.

**Rationale**: The backend returns per-call results. Aggregation on the frontend avoids a round-trip and keeps the component tree simple. The modal chain (Result → SessionInfo) mirrors the natural UX flow: see what succeeded/failed first, then see the created sessions.

---

### D4: Network errors produce synthetic failedItems, don't abort the loop

**Decision**: `catch` around each mutation call creates a synthetic `failedItem` array from the batch bills (error = network/unknown) and pushes to `allResults` before continuing to the next batch.

**Rationale**: If one carrier's batch fails with a network error, the operator should still see results for other carriers. Aborting on first error would leave processed bills with no feedback.

## Risks / Trade-offs

- **Progress jumps, not streams**: All bills in a batch appear as "processed" only after the backend returns. For a 50-bill batch this could take >10s. Mitigation: `ModalProgress` is shown; the ≤50 cap limits worst-case wait per batch.
- **Race condition on same bill across sessions**: If two operators run `createAbnormalHandover` concurrently with overlapping bill IDs, one batch will have those bills in `failedItems` with `already_processed`. This surfaces correctly in `ModalResult`.
- **`ModalSessionInfo` only shows sessions from the current run**: Operators need to navigate to the main handover tab to see historical abnormal sessions. The hint text "Vui lòng sang màn Bàn giao xuất hàng để kiểm tra thêm thông tin" covers this.

## Migration Plan

1. Backend `createAbnormalHandover` mutation must be deployed first.
2. This frontend change is purely additive (new tab functionality) — existing tabs are unaffected.
3. Rollback: revert `AbnormalTable.tsx` to the stubbed version; the `isAbnormal` badge is cosmetic and can be left in place.
