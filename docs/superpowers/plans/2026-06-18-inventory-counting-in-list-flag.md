---
change: inventory-counting-in-list-flag
design-doc: docs/superpowers/specs/2026-06-18-inventory-counting-in-list-flag-design.md
base-ref: ace4b83e20d7fb39ff9fe52e537a41f075b75a3d
---

# Inventory Counting In-List Flag — Kế Hoạch Triển Khai

> **Dành cho agentic workers:** SUB-SKILL BẮT BUỘC: Dùng superpowers:subagent-driven-development (khuyến nghị) hoặc superpowers:executing-plans để thực hiện kế hoạch này từng task một. Các bước dùng cú pháp checkbox (`- [ ]`) để theo dõi tiến độ.

**Mục tiêu:** Hiển thị trạng thái "Đã thêm" (badge + disable) cho variant và location đã có trong phiếu kiểm kê, bằng cách thêm field `inList` vào GraphQL queries và cập nhật UI trong `AddBySkuDialog` và `AddByLocationDialog`.

**Kiến trúc:** Backend đã bổ sung `inList` field — webapp chỉ cần (1) khai báo field trong query definitions và truyền `recordId` argument, (2) đọc `inList` trong component để render badge và disable tương tác. Thay đổi backward-compatible: `$recordId: Int` là optional nên các trang dùng `locationManagerList` không liên quan không bị ảnh hưởng.

**Tech Stack:** TypeScript · React · Apollo Client (useQuery, useMutation) · Ant Design (Tag, Checkbox, Modal) · GraphQL (gql tagged template)

## Global Constraints

- Không thêm dependency mới — chỉ dùng antd và apollo-client đã có sẵn.
- `$recordId: Int` phải là optional (không có dấu `!`) trong `query_locationManagerList.ts` để đảm bảo backward compatibility.
- Badge text phải là `"Đã thêm"` (tiếng Việt, đúng chính tả).
- Không xóa hay đổi tên bất kỳ field nào đang tồn tại trong query definitions.
- fetchPolicy hiện tại (`network-only` cho variant, `cache-and-network` cho location) giữ nguyên — không thay đổi.

---

## Sơ đồ file thay đổi

| File | Loại thay đổi | Trách nhiệm |
|------|--------------|-------------|
| `src/graphql/queries/query_fulfillmentVariantStockList.ts` | Sửa | Thêm `$recordId: Int` arg + `inList` field vào GraphQL query |
| `src/graphql/queries/query_locationManagerList.ts` | Sửa | Thêm `$recordId: Int` optional arg + `inList` field vào GraphQL query |
| `src/app/pages/InventoryCounting/InventoryCountingDetail/dialogs/AddBySkuDialog.tsx` | Sửa | Truyền `recordId` vào query variables + render badge/disable trong `VariantCard` |
| `src/app/pages/InventoryCounting/InventoryCountingDetail/dialogs/AddByLocationDialog.tsx` | Sửa | Truyền `recordId` vào slot query + giữ `inList` trong `slotList` mapping + render badge/disable Checkbox |

---

### Task 1.1: Thêm `$recordId: Int` arg và `inList` field vào `query_fulfillmentVariantStockList.ts`

**Files:**
- Sửa: `src/graphql/queries/query_fulfillmentVariantStockList.ts`

**Interfaces:**
- Produces: Query definition có thêm variable `$recordId: Int` và field `inList` trong `data` block — được dùng bởi Task 2.1

- [ ] **Bước 1: Đọc file hiện tại để nắm nội dung**

  Đọc: `src/graphql/queries/query_fulfillmentVariantStockList.ts`

  File hiện tại có query `fulfillmentVariantStockList` với các variables: `$brandId`, `$fulfillmentWarehouseId`, `$isExpiredDate`, `$pageNumber`, `$pageSize`, `$productStatusCode`, `$search`, `$variantName`, `$smeId`. Chưa có `$recordId` và chưa có field `inList` trong data block.

- [ ] **Bước 2: Sửa file — thêm `$recordId: Int` vào variable list, call args, và `inList` vào data fields**

  Thay toàn bộ nội dung file thành:

  ```typescript
  import gql from "graphql-tag";

  export default gql`
  	query fulfillmentVariantStockList(
  		$brandId: Int
  		$fulfillmentWarehouseId: Int!
  		$isExpiredDate: Boolean
  		$pageNumber: Int
  		$pageSize: Int
  		$productStatusCode: String
  		$recordId: Int
  		$search: String
  		$variantName: String
  		$smeId: Int
  	) {
  		fulfillmentVariantStockList(
  			fulfillmentWarehouseId: $fulfillmentWarehouseId
  			brandId: $brandId
  			isExpiredDate: $isExpiredDate
  			pageNumber: $pageNumber
  			pageSize: $pageSize
  			productStatusCode: $productStatusCode
  			recordId: $recordId
  			search: $search
  			variantName: $variantName
  			smeId: $smeId
  		) {
  			data {
  				assetUrl
  				brandId
  				gtin
  				inList
  				isExpiredDate
  				productId
  				productStatusCode
  				sku
  				stockActual
  				stockAllocated
  				stockAvailable
  				stockFloating
  				stockPrePurchaseOrder
  				stockPreallocate
  				stockReserve
  				stockReturning
  				stockShipping
  				stockSync
  				unit
  				variantId
  				variantName
  			}
  		}
  	}
  `;
  ```

- [ ] **Bước 3: Xác nhận TypeScript build không lỗi**

  Chạy: `cd /Users/huyduong/workspaces/upbase/agency-webapp && npx tsc --noEmit 2>&1 | head -30`

  Kỳ vọng: Không có lỗi liên quan đến file này (lỗi ở file khác chưa sửa là bình thường ở bước này).

- [ ] **Bước 4: Commit**

  ```bash
  cd /Users/huyduong/workspaces/upbase/agency-webapp
  git add src/graphql/queries/query_fulfillmentVariantStockList.ts
  git commit -m "feat(inventory-counting): add recordId arg and inList field to fulfillmentVariantStockList query"
  ```

---

### Task 1.2: Thêm `$recordId: Int` arg và `inList` field vào `query_locationManagerList.ts`

**Files:**
- Sửa: `src/graphql/queries/query_locationManagerList.ts`

**Interfaces:**
- Produces: Query definition có thêm variable `$recordId: Int` (optional, không có `!`) và field `inList` trong `data` block — được dùng bởi Task 2.2

- [ ] **Bước 1: Đọc file hiện tại**

  Đọc: `src/graphql/queries/query_locationManagerList.ts`

  File hiện tại có variables: `$areaId_in`, `$isActive`, `$levelId_in`, `$pageNumber`, `$pageSize`, `$rackId_in`, `$searchs`, `$searchFields`, `$type`, `$warehouseId`, `$priority`, `$usageCapacityRatio_gte`, `$usageCapacityRatio_lt`, `$priority_in`. Chưa có `$recordId` và chưa có `inList` trong data block.

- [ ] **Bước 2: Sửa file — thêm `$recordId: Int` (optional) vào variable list và call args, thêm `inList` vào data fields**

  Thay toàn bộ nội dung file thành:

  ```typescript
  import gql from "graphql-tag";

  export default gql`
  	query locationManagerList(
  		$areaId_in: [Int]
  		$isActive: Boolean
  		$levelId_in: [Int]
  		$pageNumber: Int
  		$pageSize: Int
  		$rackId_in: [Int]
  		$recordId: Int
  		$searchs: [String]
  		$searchFields: [String!]
  		$type: String
  		$warehouseId: Int
  		$priority: Int
  		$usageCapacityRatio_gte: Int
  		$usageCapacityRatio_lt: Int
  		$priority_in: [Int!]
  	) {
  		locationManagerList(
  			areaId_in: $areaId_in
  			priority: $priority
  			isActive: $isActive
  			levelId_in: $levelId_in
  			pageNumber: $pageNumber
  			pageSize: $pageSize
  			rackId_in: $rackId_in
  			recordId: $recordId
  			searchs: $searchs
  			searchFields: $searchFields
  			type: $type
  			warehouseId: $warehouseId
  			usageCapacityRatio_lt: $usageCapacityRatio_lt
  			usageCapacityRatio_gte: $usageCapacityRatio_gte
  			priority_in: $priority_in
  		) {
  			message
  			success
  			meta {
  				pageNumber
  				pageSize
  				totalItems
  				totalPages
  			}
  			data {
  				area {
  					code
  					createdAt
  					deletedAt
  					id
  					isActive
  					name
  					priority
  					type
  					updatedAt
  					warehouseId
  				}
  				code
  				createdAt
  				deletedAt
  				id
  				inList
  				isActive
  				name
  				priority
  				storageEquipment {
  					usageCapacityRatio
  					length
  					width
  					height
  					maxCapacity
  				}
  				level {
  					code
  					createdAt
  					deletedAt
  					id
  					isActive
  					name
  					priority
  					type
  					updatedAt
  					warehouseId
  				}
  				rack {
  					code
  					createdAt
  					deletedAt
  					id
  					isActive
  					name
  					priority
  					type
  					updatedAt
  					warehouseId
  				}
  				aisle {
  					code
  					createdAt
  					deletedAt
  					id
  					isActive
  					name
  					priority
  					type
  					updatedAt
  					warehouseId
  				}
  				type
  				updatedAt
  				warehouseId
  			}
  		}
  	}
  `;
  ```

- [ ] **Bước 3: Xác nhận TypeScript build không lỗi**

  Chạy: `cd /Users/huyduong/workspaces/upbase/agency-webapp && npx tsc --noEmit 2>&1 | head -30`

  Kỳ vọng: Không có lỗi liên quan đến file này.

- [ ] **Bước 4: Commit**

  ```bash
  cd /Users/huyduong/workspaces/upbase/agency-webapp
  git add src/graphql/queries/query_locationManagerList.ts
  git commit -m "feat(inventory-counting): add recordId arg and inList field to locationManagerList query"
  ```

---

### Task 2.1: Truyền `recordId` vào query variables trong `AddBySkuDialog.tsx`

**Files:**
- Sửa: `src/app/pages/InventoryCounting/InventoryCountingDetail/dialogs/AddBySkuDialog.tsx`

**Interfaces:**
- Consumes: `query_fulfillmentVariantStockList` với variable `$recordId: Int` (từ Task 1.1); prop `recordId: number` đã có sẵn trong interface `Props`
- Produces: `variantData` có field `inList` trên từng item — được dùng bởi Task 3.1

- [ ] **Bước 1: Đọc file hiện tại**

  Đọc: `src/app/pages/InventoryCounting/InventoryCountingDetail/dialogs/AddBySkuDialog.tsx`

  Xác nhận: prop `recordId: number` đã có trong `Props`. Query `fulfillmentVariantStockList` hiện đang truyền `variables` tại dòng ~134-150 nhưng **chưa có** `recordId` trong object variables.

- [ ] **Bước 2: Thêm `recordId` vào variables của `useQuery`**

  Tìm block `useQuery(query_fulfillmentVariantStockList, ...)` (dòng ~134-150). Thay đổi object `variables`:

  ```typescript
  // TRƯỚC:
  const { data: variantData, loading: loadingVariants } = useQuery(
  	query_fulfillmentVariantStockList,
  	{
  		variables: {
  			fulfillmentWarehouseId: warehouseId,
  			smeId: selectedSmeId,
  			brandId: selectedBrandId,
  			productStatusCode: selectedStatusCode,
  			search: search || undefined,
  			isExpiredDate,
  			pageNumber: page,
  			pageSize: PAGE_SIZE,
  		},
  		fetchPolicy: "network-only",
  		skip: !open,
  	}
  );

  // SAU:
  const { data: variantData, loading: loadingVariants } = useQuery(
  	query_fulfillmentVariantStockList,
  	{
  		variables: {
  			fulfillmentWarehouseId: warehouseId,
  			recordId,
  			smeId: selectedSmeId,
  			brandId: selectedBrandId,
  			productStatusCode: selectedStatusCode,
  			search: search || undefined,
  			isExpiredDate,
  			pageNumber: page,
  			pageSize: PAGE_SIZE,
  		},
  		fetchPolicy: "network-only",
  		skip: !open,
  	}
  );
  ```

- [ ] **Bước 3: Xác nhận TypeScript build không lỗi**

  Chạy: `cd /Users/huyduong/workspaces/upbase/agency-webapp && npx tsc --noEmit 2>&1 | head -30`

  Kỳ vọng: Không có lỗi TypeScript.

- [ ] **Bước 4: Commit**

  ```bash
  cd /Users/huyduong/workspaces/upbase/agency-webapp
  git add src/app/pages/InventoryCounting/InventoryCountingDetail/dialogs/AddBySkuDialog.tsx
  git commit -m "feat(inventory-counting): pass recordId to fulfillmentVariantStockList query in AddBySkuDialog"
  ```

---

### Task 2.2: Truyền `recordId` vào slot query variables trong `AddByLocationDialog.tsx` + giữ `inList` trong `slotList` mapping

**Files:**
- Sửa: `src/app/pages/InventoryCounting/InventoryCountingDetail/dialogs/AddByLocationDialog.tsx`

**Interfaces:**
- Consumes: `query_locationManagerList` với variable `$recordId: Int` (từ Task 1.2); prop `recordId: number` đã có sẵn trong interface `Props`
- Produces: `slotList` array có thêm field `inList: boolean | null` trên từng item — được dùng bởi Task 3.2

- [ ] **Bước 1: Đọc file hiện tại**

  Đọc: `src/app/pages/InventoryCounting/InventoryCountingDetail/dialogs/AddByLocationDialog.tsx`

  Xác nhận:
  - Prop `recordId: number` đã có trong `Props`.
  - Query slot (thứ 3) tại dòng ~35-39 chưa truyền `recordId`.
  - `slotList` useMemo tại dòng ~59-66 chưa map field `inList`.

- [ ] **Bước 2: Thêm `recordId` vào variables của query slot**

  Tìm query slot (dòng ~35-39):

  ```typescript
  // TRƯỚC:
  const { data: slotData, loading: loadingSlot } = useQuery(query_locationManagerList, {
  	variables: { warehouseId, type: "slot", isActive: true, areaId_in: [selectedArea], rackId_in: [selectedRack] },
  	fetchPolicy: "cache-and-network",
  	skip: !open || !selectedArea || !selectedRack,
  });

  // SAU:
  const { data: slotData, loading: loadingSlot } = useQuery(query_locationManagerList, {
  	variables: { warehouseId, type: "slot", isActive: true, areaId_in: [selectedArea], rackId_in: [selectedRack], recordId },
  	fetchPolicy: "cache-and-network",
  	skip: !open || !selectedArea || !selectedRack,
  });
  ```

- [ ] **Bước 3: Thêm `inList` vào `slotList` mapping**

  Tìm `useMemo` của `slotList` (dòng ~59-66):

  ```typescript
  // TRƯỚC:
  const slotList = useMemo(
  	() =>
  		(slotData?.locationManagerList?.data ?? []).map((i: any) => ({
  			label: i?.code,
  			value: i?.id,
  		})),
  	[slotData]
  );

  // SAU:
  const slotList = useMemo(
  	() =>
  		(slotData?.locationManagerList?.data ?? []).map((i: any) => ({
  			label: i?.code,
  			value: i?.id,
  			inList: i?.inList,
  		})),
  	[slotData]
  );
  ```

- [ ] **Bước 4: Xác nhận TypeScript build không lỗi**

  Chạy: `cd /Users/huyduong/workspaces/upbase/agency-webapp && npx tsc --noEmit 2>&1 | head -30`

  Kỳ vọng: Không có lỗi TypeScript.

- [ ] **Bước 5: Commit**

  ```bash
  cd /Users/huyduong/workspaces/upbase/agency-webapp
  git add src/app/pages/InventoryCounting/InventoryCountingDetail/dialogs/AddByLocationDialog.tsx
  git commit -m "feat(inventory-counting): pass recordId to slot query and keep inList in slotList mapping"
  ```

---

### Task 3.1: Render badge "Đã thêm" + disable click trong `VariantCard` khi `item.inList === true` — trong `AddBySkuDialog.tsx`

**Files:**
- Sửa: `src/app/pages/InventoryCounting/InventoryCountingDetail/dialogs/AddBySkuDialog.tsx`

**Interfaces:**
- Consumes: `item.inList` (boolean | null) từ `variantData` (Task 2.1 đã đảm bảo field này được query về)
- Produces: `VariantCard` hiển thị `<Tag color="green">Đã thêm</Tag>` và không gọi `onToggle` khi `item.inList === true`

**Lưu ý import:** File hiện tại import `{ Button, Checkbox, Col, Flex, Input, Modal, Row, Select, Spin, Typography }` từ `antd`. Cần thêm `Tag` vào import này.

- [ ] **Bước 1: Thêm `Tag` vào antd import**

  Tìm dòng import antd (dòng ~2):

  ```typescript
  // TRƯỚC:
  import { Button, Checkbox, Col, Flex, Input, Modal, Row, Select, Spin, Typography } from "antd";

  // SAU:
  import { Button, Checkbox, Col, Flex, Input, Modal, Row, Select, Spin, Tag, Typography } from "antd";
  ```

- [ ] **Bước 2: Cập nhật component `VariantCard` để xử lý `inList`**

  Tìm component `VariantCard` (dòng ~29-100). Thay toàn bộ component bằng version mới có `isAdded` logic:

  ```typescript
  const VariantCard = ({ item, selected, onToggle }: VariantCardProps) => {
  	const isAdded = item?.inList === true;
  	return (
  		<div
  			onClick={() => !isAdded && onToggle(item?.variantId)}
  			style={{
  				border: `1.5px solid ${selected ? "#ff5629" : "#e8e8e8"}`,
  				borderRadius: 8,
  				padding: "10px 12px",
  				cursor: isAdded ? "not-allowed" : "pointer",
  				background: selected ? "#fff5f2" : "#fff",
  				transition: "border-color 0.2s, background 0.2s",
  				height: "100%",
  				opacity: isAdded ? 0.7 : 1,
  			}}
  		>
  			<Flex align="flex-start" gap={10}>
  				<div style={{ flexShrink: 0, position: "relative" }}>
  					<img
  						src={item?.assetUrl}
  						alt="variant"
  						width={56}
  						height={56}
  						style={{ borderRadius: 6, objectFit: "cover", border: "1px solid #f0f0f0" }}
  						onError={(e: any) => {
  							e.currentTarget.src =
  								"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Crect width='56' height='56' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='10' fill='%23bbb'%3ENo img%3C/text%3E%3C/svg%3E";
  						}}
  					/>
  					{selected && (
  						<div
  							style={{
  								position: "absolute",
  								top: -6,
  								right: -6,
  								width: 18,
  								height: 18,
  								borderRadius: "50%",
  								background: "#ff5629",
  								display: "flex",
  								alignItems: "center",
  								justifyContent: "center",
  							}}
  						>
  							<span style={{ color: "#fff", fontSize: 11, lineHeight: 1 }}>✓</span>
  						</div>
  					)}
  				</div>

  				<Flex vertical gap={2} style={{ minWidth: 0, flex: 1 }}>
  					<Text strong style={{ fontSize: 13, lineHeight: "18px" }} ellipsis={{ tooltip: item?.variantName }}>
  						{item?.variantName}
  					</Text>
  					<Text type="secondary" style={{ fontSize: 12 }}>
  						SKU: {item?.sku}
  					</Text>
  					{item?.gtin && (
  						<Text type="secondary" style={{ fontSize: 12 }}>
  							GTIN: {item?.gtin}
  						</Text>
  					)}
  					<Flex gap={12} style={{ marginTop: 2 }}>
  						<Text style={{ fontSize: 12 }}>
  							Tồn TT: <b>{item?.stockActual ?? 0}</b>
  						</Text>
  						{item?.unit && (
  							<Text type="secondary" style={{ fontSize: 12 }}>
  								{item?.unit}
  							</Text>
  						)}
  					</Flex>
  					{isAdded && (
  						<Tag color="green" style={{ marginTop: 4, fontSize: 11, width: "fit-content" }}>
  							Đã thêm
  						</Tag>
  					)}
  				</Flex>
  			</Flex>
  		</div>
  	);
  };
  ```

- [ ] **Bước 3: Xác nhận TypeScript build không lỗi**

  Chạy: `cd /Users/huyduong/workspaces/upbase/agency-webapp && npx tsc --noEmit 2>&1 | head -30`

  Kỳ vọng: Không có lỗi TypeScript.

- [ ] **Bước 4: Kiểm tra thủ công logic**

  Xác nhận trong code đã sửa:
  - Khi `item.inList === true`: `cursor: "not-allowed"`, `opacity: 0.7`, `onClick` không gọi `onToggle`, hiển thị `<Tag color="green">Đã thêm</Tag>`.
  - Khi `item.inList !== true` (null, undefined, false): giữ nguyên behavior cũ, click gọi `onToggle`.

- [ ] **Bước 5: Commit**

  ```bash
  cd /Users/huyduong/workspaces/upbase/agency-webapp
  git add src/app/pages/InventoryCounting/InventoryCountingDetail/dialogs/AddBySkuDialog.tsx
  git commit -m "feat(inventory-counting): render 'Da them' badge and disable click in VariantCard when inList=true"
  ```

---

### Task 3.2: Render badge "Đã thêm" + Checkbox disabled khi `slot.inList === true` — trong `AddByLocationDialog.tsx`

**Files:**
- Sửa: `src/app/pages/InventoryCounting/InventoryCountingDetail/dialogs/AddByLocationDialog.tsx`

**Interfaces:**
- Consumes: `slot.inList` (boolean | null) từ `slotList` (Task 2.2 đã đảm bảo field này được map)
- Produces: Checkbox hiển thị `disabled` và `<Tag color="green">Đã thêm</Tag>` khi `slot.inList === true`

**Lưu ý import:** File hiện tại import `{ Button, Checkbox, Col, Form, Modal, Row, Select, Space }` từ `antd`. Cần thêm `Tag` vào import.

**Lưu ý logic "Chọn tất cả":** Nút "Chọn tất cả" hiện dùng `allSlotIds` (toàn bộ slotList). Không cần thay đổi: slot đã thêm sẽ có Checkbox disabled, người dùng không thể bỏ chọn chúng thủ công, và backend sẽ bỏ qua duplicate khi submit.

- [ ] **Bước 1: Thêm `Tag` vào antd import**

  Tìm dòng import antd (dòng ~2):

  ```typescript
  // TRƯỚC:
  import { Button, Checkbox, Col, Form, Modal, Row, Select, Space } from "antd";

  // SAU:
  import { Button, Checkbox, Col, Form, Modal, Row, Select, Space, Tag } from "antd";
  ```

- [ ] **Bước 2: Cập nhật render Checkbox slot để xử lý `inList`**

  Tìm block render `{slotList?.map((slot) => ...)}` (dòng ~184-200). Thay thế toàn bộ map block:

  ```tsx
  // TRƯỚC:
  {slotList?.map((slot) => (
  	<Col span={8} key={slot?.value}>
  		<Checkbox
  			checked={selectedSlots?.includes(slot?.value)}
  			onChange={(e) => {
  				setSelectedSlots(
  					e?.target?.checked
  						? [...selectedSlots, slot?.value]
  						: selectedSlots?.filter((id) => id !== slot?.value)
  				);
  			}}
  		>
  			{slot?.label}
  		</Checkbox>
  	</Col>
  ))}

  // SAU:
  {slotList?.map((slot) => (
  	<Col span={8} key={slot?.value}>
  		<Checkbox
  			checked={selectedSlots?.includes(slot?.value)}
  			disabled={slot?.inList === true}
  			onChange={(e) => {
  				setSelectedSlots(
  					e?.target?.checked
  						? [...selectedSlots, slot?.value]
  						: selectedSlots?.filter((id) => id !== slot?.value)
  				);
  			}}
  		>
  			{slot?.label}
  			{slot?.inList === true && (
  				<Tag color="green" style={{ marginLeft: 4, fontSize: 11 }}>
  					Đã thêm
  				</Tag>
  			)}
  		</Checkbox>
  	</Col>
  ))}
  ```

- [ ] **Bước 3: Xác nhận TypeScript build không lỗi**

  Chạy: `cd /Users/huyduong/workspaces/upbase/agency-webapp && npx tsc --noEmit 2>&1 | head -30`

  Kỳ vọng: Không có lỗi TypeScript.

- [ ] **Bước 4: Kiểm tra thủ công logic**

  Xác nhận trong code đã sửa:
  - Khi `slot.inList === true`: `<Checkbox disabled>` + hiển thị `<Tag color="green">Đã thêm</Tag>` sau label.
  - Khi `slot.inList !== true`: Checkbox bình thường, không có Tag.

- [ ] **Bước 5: Commit**

  ```bash
  cd /Users/huyduong/workspaces/upbase/agency-webapp
  git add src/app/pages/InventoryCounting/InventoryCountingDetail/dialogs/AddByLocationDialog.tsx
  git commit -m "feat(inventory-counting): render 'Da them' badge and disable Checkbox when slot.inList=true"
  ```

---

### Task 4.1: Confirm refetch coverage cho variant list (fetchPolicy: network-only đã cover)

**Files:**
- Chỉ đọc: `src/app/pages/InventoryCounting/InventoryCountingDetail/dialogs/AddBySkuDialog.tsx`

**Interfaces:**
- Không produce thay đổi code — đây là verification task để xác nhận hành vi refetch đúng

- [ ] **Bước 1: Đọc và xác nhận fetchPolicy của query variant**

  Đọc `src/app/pages/InventoryCounting/InventoryCountingDetail/dialogs/AddBySkuDialog.tsx`.

  Xác nhận: `useQuery(query_fulfillmentVariantStockList, { ..., fetchPolicy: "network-only", skip: !open })`.

  `fetchPolicy: "network-only"` nghĩa là: mỗi lần `skip` chuyển từ `true` sang `false` (dialog mở lại), Apollo sẽ tự động gửi request mới đến server — không đọc cache. Đây là cơ chế refetch tự động.

- [ ] **Bước 2: Xác nhận onSuccess() đóng dialog**

  Trong `AddBySkuDialog`, callback `onSuccess` được truyền vào từ parent và được gọi sau mutation thành công:

  ```typescript
  onCompleted: (data) => {
    const result = data?.inventoryCountingAddByVariant;
    if (result?.success) {
      showAlert.success(`Đã thêm ${result?.data?.addedCount ?? 0} SKU`);
      onSuccess(); // Parent sẽ đóng dialog → open = false
    }
  ```

  Khi `open = false` → `skip = true`. Khi mở lại: `open = true` → `skip = false` → Apollo tự refetch vì `fetchPolicy: "network-only"`. Backend trả về `inList: true` cho variant vừa thêm → UI hiển thị badge.

- [ ] **Bước 3: Ghi nhận kết quả xác nhận**

  Không có thay đổi code. Ghi nhận: Task 4.1 confirmed — `fetchPolicy: "network-only"` + `skip: !open` đảm bảo refetch đúng khi dialog mở lại. Không cần thêm explicit refetch.

---

### Task 4.2: Confirm refetch coverage cho location list (fetchPolicy: cache-and-network đã cover)

**Files:**
- Chỉ đọc: `src/app/pages/InventoryCounting/InventoryCountingDetail/dialogs/AddByLocationDialog.tsx`

**Interfaces:**
- Không produce thay đổi code — đây là verification task để xác nhận hành vi refetch đúng

- [ ] **Bước 1: Đọc và xác nhận fetchPolicy của query slot**

  Đọc `src/app/pages/InventoryCounting/InventoryCountingDetail/dialogs/AddByLocationDialog.tsx`.

  Xác nhận: `useQuery(query_locationManagerList, { ..., fetchPolicy: "cache-and-network", skip: !open || !selectedArea || !selectedRack })`.

  `fetchPolicy: "cache-and-network"` nghĩa là: Apollo render ngay từ cache (nếu có) và đồng thời gửi network request để cập nhật — user thấy dữ liệu mới nhất sau mỗi lần mở dialog có area/rack đã chọn.

- [ ] **Bước 2: Xác nhận handleClose reset state**

  `handleClose()` gọi `form?.resetFields()`, `setSelectedRack(undefined)`, `setSelectedSlots([])`. Khi dialog mở lại, user phải chọn lại area → rack → slot. Khi `selectedRack` có giá trị mới, query slot chạy lại với `recordId` được truyền vào → backend trả về `inList` mới nhất.

- [ ] **Bước 3: Ghi nhận kết quả xác nhận**

  Không có thay đổi code. Ghi nhận: Task 4.2 confirmed — `fetchPolicy: "cache-and-network"` + reset state khi đóng dialog đảm bảo refetch đúng khi dialog mở lại và user chọn rack. Không cần thêm explicit refetch.

---

## Tóm tắt thứ tự thực hiện

```
Task 1.1 → Task 1.2 → Task 2.1 → Task 2.2 → Task 3.1 → Task 3.2 → Task 4.1 → Task 4.2
```

- Task 1.x phải hoàn thành trước Task 2.x (query cần có `$recordId` trước khi component truyền vào).
- Task 2.x phải hoàn thành trước Task 3.x (component cần query `inList` trước khi render badge).
- Task 4.x có thể chạy độc lập (chỉ là verification, không có code change).
