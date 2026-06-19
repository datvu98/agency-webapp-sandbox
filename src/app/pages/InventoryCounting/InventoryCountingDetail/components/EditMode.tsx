import { useMutation } from "@apollo/client";
import { Button, Card, Col, Flex, Form, Input, Radio, Row, Table, Typography } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import mutate_inventoryCountingApprove from "graphql/mutations/mutate_inventoryCountingApprove";
import { showAlert } from "utils/helper";
import ApproveDialog from "../../InventoryCountingList/dialogs/ApproveDialog";
import RemoveItemDialog from "../dialogs/RemoveItemDialog";
import AddByLocationDialog from "../dialogs/AddByLocationDialog";
import AddBySkuDialog from "../dialogs/AddBySkuDialog";
import mutate_inventoryCountingUpdateNote from "graphql/mutations/mutate_inventoryCountingUpdateNote";

type ViewToggle = "location" | "sku";

interface Props {
	record: any;
	recordId: number;
	onRefetch: () => void;
}

const EditMode = ({ record, recordId, onRefetch }: Props) => {
	const navigate = useNavigate();
	const [form] = Form.useForm();
	const [viewMode, setViewMode] = useState<ViewToggle>("location");
	const [removeItemId, setRemoveItemId] = useState<number | null>(null);
	const [showAddLocation, setShowAddLocation] = useState(false);
	const [showAddSku, setShowAddSku] = useState(false);
	const [showApprove, setShowApprove] = useState(false);

	const items: any[] = record?.items ?? [];

	const [inventoryCountingUpdateNote, {loading: loadingInventoryCountingUpdateNote}] = useMutation(mutate_inventoryCountingUpdateNote, {
		awaitRefetchQueries: true,
		refetchQueries: ['inventoryCountingDetail']
	})

	const locationRows = Object.values(
		items.reduce((acc: Record<string, any>, item: any) => {
			const key = item?.locationCode;
			if (!acc[key]) {
				acc[key] = { locationCode: key, totalSkus: 0, totalQty: 0, ids: [] };
			}
			acc[key].totalSkus += 1;
			acc[key].totalQty += item?.session1SystemQty ?? 0;
			acc[key].ids.push(item?.id);
			return acc;
		}, {})
	) as any[];

	const skuRows = Object.values(
		items.reduce((acc: Record<string, any>, item: any) => {
			const key = item?.sku;
			if (!acc[key]) {
				acc[key] = {
					sku: key,
					gtin: item?.gtin,
					productName: item?.productName,
					totalLocations: 0,
					totalQty: 0,
					ids: [],
				};
			}
			acc[key].totalLocations += 1;
			acc[key].totalQty += item?.session1SystemQty ?? 0;
			acc[key].ids.push(item?.id);
			return acc;
		}, {})
	) as any[];

	const totalLocations = locationRows.length;
	const totalSkus = skuRows.length;
	const totalQty = items.reduce((s: number, i: any) => s + (i?.session1SystemQty ?? 0), 0);

	const locationColumns = [
		{ title: "Mã vị trí", dataIndex: "locationCode", key: "locationCode" },
		{ title: "Tổng SKUs", dataIndex: "totalSkus", key: "totalSkus" },
		{ title: "Tổng số lượng kiểm đếm", dataIndex: "totalQty", key: "totalQty" },
		{
			title: "",
			key: "delete",
			width: 48,
			render: (_: any, row: any) => (
				<Button type="text" danger size="small" onClick={() => setRemoveItemId(row.ids)}>
					Xoá
				</Button>
			),
		},
	];

	const skuColumns = [
		{ title: "Mã SKU", dataIndex: "sku", key: "sku" },
		{ title: "Mã GTIN", dataIndex: "gtin", key: "gtin" },
		{ title: "Tên hàng hoá", dataIndex: "productName", key: "productName" },
		{ title: "Tổng vị trí", dataIndex: "totalLocations", key: "totalLocations" },
		{ title: "Tổng số lượng", dataIndex: "totalQty", key: "totalQty" },
		{
			title: "",
			key: "delete",
			width: 48,
			render: (_: any, row: any) => (
				<Button type="text" danger size="small" onClick={() => setRemoveItemId(row.ids)}>
					Xoá
				</Button>
			),
		},
	];

	return (
		<Card>
			<Typography.Title level={4} style={{ marginBottom: 16 }}>
				Chi tiết kiểm kê — {record?.code}
			</Typography.Title>

			<Form form={form} layout="vertical" initialValues={{ note: record?.note }} style={{ marginBottom: 24 }}>
				<Row gutter={10}>
					<Col span={12}>
						<Form.Item label="Kho">
							<Input value={record?.warehouseName} disabled />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item label="Mã kiểm kê">
							<Input value={record?.code} disabled />
						</Form.Item>
					</Col>
				</Row>
				<Form.Item name="note" label="Ghi chú">
					<Input.TextArea maxLength={255} rows={3} showCount />
				</Form.Item>
			</Form>

			<div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
				<Radio.Group
					value={viewMode}
					onChange={(e) => setViewMode(e.target.value)}
					optionType="button"
					buttonStyle="solid"
					options={[
						{ value: "location", label: "Xem theo vị trí" },
						{ value: "sku", label: "Xem theo SKUs" },
					]}
				/>
				<span style={{ color: "#888", fontSize: 13 }}>
					Tổng vị trí: <b>{totalLocations}</b> | Tổng SKUs: <b>{totalSkus}</b> | Tổng SL: <b>{totalQty}</b>
				</span>
			</div>
            <Flex justify="end">
				<Button type="primary" onClick={() => (viewMode === "location" ? setShowAddLocation(true) : setShowAddSku(true))}>Thêm nhanh</Button>
            </Flex>
			<Table
				rowKey={viewMode === "location" ? "locationCode" : "sku"}
				dataSource={viewMode === "location" ? locationRows : skuRows}
				columns={viewMode === "location" ? locationColumns : skuColumns}
				pagination={false}
				size="small"
				style={{ marginBottom: 16 }}
			/>

			<Flex gap={8} justify="end">
				<Button type="primary" onClick={() => setShowApprove(true)}>
					Duyệt
				</Button>
				<Button onClick={async () => {
					const {data} = await inventoryCountingUpdateNote({
						variables: {
							input: {
								recordId,
								note: form.getFieldValue('note') || ''
							}
						}
					})
					if (data?.inventoryCountingUpdateNote?.success) {
						showAlert.success("Đã lưu")
					} else {
						showAlert.error(data?.inventoryCountingUpdateNote?.message || 'Có lỗi xảy ra')
					}
				}}>Lưu lại</Button>
			</Flex>

			{showApprove && (
				<ApproveDialog
					open
					recordId={recordId}
					onClose={() => setShowApprove(false)}
					onSuccess={() => {
						setShowApprove(false);
						navigate("/inventory-counting?tab=approved");
					}}
				/>
			)}

			{removeItemId !== null && (
				<RemoveItemDialog
					open
					recordId={recordId}
					itemIds={Array.isArray(removeItemId) ? removeItemId : [removeItemId]}
					onClose={() => setRemoveItemId(null)}
					onSuccess={() => {
						setRemoveItemId(null);
						onRefetch();
					}}
				/>
			)}

			{showAddLocation && (
				<AddByLocationDialog
					open
					recordId={recordId}
					warehouseId={record?.warehouseId}
					onClose={() => setShowAddLocation(false)}
					onSuccess={() => {
						setShowAddLocation(false);
						onRefetch();
					}}
				/>
			)}

			{showAddSku && (
				<AddBySkuDialog
					open
					recordId={recordId}
					warehouseId={record?.warehouseId}
					onClose={() => setShowAddSku(false)}
					onSuccess={() => {
						setShowAddSku(false);
						onRefetch();
					}}
				/>
			)}
		</Card>
	);
};

export default EditMode;
