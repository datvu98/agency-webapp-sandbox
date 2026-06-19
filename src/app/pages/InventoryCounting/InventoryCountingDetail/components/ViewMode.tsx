import { useLazyQuery, useMutation } from "@apollo/client";
import { Button, Card, Checkbox, Col, Descriptions, Flex, Input, Pagination, Row, Table, Typography } from "antd";
import dayjs from "dayjs";
import queryString from "querystring";
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { showAlert } from "utils/helper";
import StockDeltaDialog from "../dialogs/StockDeltaDialog";
import ReassignDialog from "../../InventoryCountingList/dialogs/ReassignDialog";
import CancelDialog from "../../InventoryCountingList/dialogs/CancelDialog";
import CompleteDialog from "../../InventoryCountingList/dialogs/CompleteDialog";
import RecountDialog from "../../InventoryCountingList/dialogs/RecountDialog";
import mutate_inventoryCountingExport from "graphql/mutations/mutate_inventoryCountingExport";

type DialogKey = "reassign" | "cancel" | "complete" | "recount" | null;

interface StockDeltaTarget {
	locationCode: string;
	sku: string;
}

interface Props {
	record: any;
	recordId: number;
	page: number;
	limit: number;
	onRefetch: () => void;
}

const formatDate = (v?: string) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—");

const ViewMode = ({ record, recordId, page, limit, onRefetch }: Props) => {
	const navigate = useNavigate();
	const location = useLocation();
	const params = queryString.parse(location?.search?.slice(1, 100000) ?? "") as any;

	const [dialog, setDialog] = useState<DialogKey>(null);
	const [stockDelta, setStockDelta] = useState<StockDeltaTarget | null>(null);
	const [searchText, setSearchText] = useState((params?.q as string) ?? "");
	const [showDiff, setShowDiff] = useState(false);
	const [showUnchecked, setShowUnchecked] = useState(false);

	const [exportFunc, { loading: exporting }] = useMutation(mutate_inventoryCountingExport);

	const handleExport = async () => {
		const res = await exportFunc({ variables: { input: { recordId } } });
		const url = res?.data?.inventoryCountingExport?.data?.url;
		if (url) {
			window.open(url, "_blank");
		} else {
			showAlert.error(res?.data?.inventoryCountingExport?.message || "Xuất dữ liệu thất bại");
		}
	};

	const items: any[] = record?.items ?? [];
	const latestSession = record?.sessionCount ?? 1;

	const filteredItems = useMemo(() => {
		let rows = items;
		if (searchText) {
			const q = searchText.toLowerCase();
			rows = rows.filter((r: any) => r?.locationCode?.toLowerCase()?.includes(q) || r?.productName?.toLowerCase()?.includes(q));
		}
		if (showDiff) {
			rows = rows.filter(
				(r: any) => (r?.session1Diff ?? 0) !== 0 || (r?.session2Diff ?? 0) !== 0 || (r?.session3Diff ?? 0) !== 0 || r?.session1IsAnomaly || r?.session2IsAnomaly || r?.session3IsAnomaly
			);
		}
		if (showUnchecked) {
			rows = rows.filter((r: any) => r?.session1CountedQty == null);
		}
		return rows;
	}, [items, searchText, showDiff, showUnchecked]);

	const sessionKey = (n: number, field: string) => `session${n}${field}`;

	const systemQtyRender = (_: any, row: any) => {
		const hasFlag = row?.[sessionKey(latestSession, "HasStockDelta")];
		return (
			<span>
				{row?.[sessionKey(latestSession, "SystemQty")] ?? "—"}
				{hasFlag && (
					<Button type="link" size="small" style={{ padding: "0 4px" }} onClick={() => setStockDelta({ locationCode: row?.locationCode, sku: row?.sku })}>
						△
					</Button>
				)}
			</span>
		);
	};

	const sessionResultRender = (n: number) => (_: any, row: any) => {
		const qty = row?.[sessionKey(n, "CountedQty")];
		return qty != null ? qty : "—";
	};

	const columns = [
		{ title: "Mã vị trí", dataIndex: "locationCode", key: "locationCode" },
		{ title: "Mã GTIN", dataIndex: "gtin", key: "gtin" },
		{ title: "Mã SKU", dataIndex: "sku", key: "sku" },
		{ title: "Tên hàng hoá", dataIndex: "productName", key: "productName" },
		{ title: "ĐVT", dataIndex: "unit", key: "unit" },
		{ title: "Tình trạng HH", dataIndex: "condition", key: "condition" },
		{ title: "SL hệ thống", key: "systemQty", render: systemQtyRender },
		{ title: "Kết quả lần 1", key: "r1", render: sessionResultRender(1) },
		{ title: "Kết quả lần 2", key: "r2", render: sessionResultRender(2) },
		{ title: "Kết quả lần 3", key: "r3", render: sessionResultRender(3) },
		{
			title: "Chênh lệch",
			key: "diff",
			render: (_: any, row: any) => row?.[sessionKey(latestSession, "Diff")] ?? "—",
		},
		{
			title: "Bất thường",
			key: "anomaly",
			render: (_: any, row: any) => (row?.[sessionKey(latestSession, "IsAnomaly")] ? "✓" : "—"),
		},
	];

	const closeAndRefetch = () => {
		setDialog(null);
		onRefetch();
	};

	const actionButtons = () => {
		switch (record?.status) {
			case "approved":
				return (
					<>
						<Button onClick={() => setDialog("reassign")}>Phân công lại</Button>
						<Button danger onClick={() => setDialog("cancel")}>
							Huỷ
						</Button>
					</>
				);
			case "counting":
				return (
					<>
						<Button onClick={() => setDialog("complete")} disabled={!record?.allSessionsEnded}>
							Hoàn thành phiếu
						</Button>
						<Button danger onClick={() => setDialog("cancel")} disabled={!record?.allSessionsEnded}>
							Huỷ
						</Button>
					</>
				);
			case "counted":
				return (
					<>
						<Button onClick={() => setDialog("recount")}>Kiểm đếm lại</Button>
						<Button danger onClick={() => setDialog("cancel")} disabled={!record?.allSessionsEnded}>
							Huỷ
						</Button>
					</>
				);
			default:
				return null
		}
	};

	return (
		<Card>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
					marginBottom: 16,
				}}
			>
				<Typography.Title level={4} style={{ margin: 0 }}>
					{record?.code ?? '--'}
				</Typography.Title>
				<Flex gap={10}>
					{actionButtons()}
					<Button loading={exporting} onClick={handleExport} type="primary">
						Xuất dữ liệu
					</Button>
				</Flex>
			</div>

			<Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
				<Descriptions.Item label="Mã phiếu">{record?.code ?? '--'}</Descriptions.Item>
				<Descriptions.Item label="Trạng thái">{record?.status ?? '--'}</Descriptions.Item>
				<Descriptions.Item label="Người tạo">{record?.createdById ?? "—-"}</Descriptions.Item>
				<Descriptions.Item label="Người hoàn thành">{record?.completedById ?? "—-"}</Descriptions.Item>
				<Descriptions.Item label="Thời gian hoàn thành">{formatDate(record?.completedAt)}</Descriptions.Item>
			</Descriptions>

			<Row gutter={24} style={{ marginBottom: 16 }}>
				{[
					{
						label: "Vị trí (thực tế/cần kiểm)",
						value: `${record?.totalLocationCounted ?? 0}/${record?.totalLocationRequest ?? 0}`,
					},
					{
						label: "Số lượng (thực tế/hệ thống)",
						value: `${record?.totalStockCounted ?? 0}/${record?.totalStockRequest ?? 0}`,
					},
					{ label: "Lệch (%)", value: `${record?.avgDiff ?? 0}%` },
					{ label: "Bất thường", value: record?.totalAnomalyCount ?? 0 },
				].map((item) => (
					<Col key={item.label} span={6}>
						<div
							style={{
								background: "#fafafa",
								border: "1px solid #eee",
								borderRadius: 6,
								padding: "12px 16px",
								textAlign: "center",
							}}
						>
							<div style={{ fontSize: 12, color: "#888" }}>{item.label}</div>
							<div style={{ fontSize: 18, fontWeight: 600 }}>{item.value}</div>
						</div>
					</Col>
				))}
			</Row>

			<div style={{ marginBottom: 12, display: "flex", gap: 16, alignItems: "center" }}>
				<Input.Search placeholder="Tìm mã vị trí, tên hàng hoá" value={searchText} onChange={(e) => setSearchText(e?.target?.value ?? "")} allowClear style={{ width: 280 }} />
				<Checkbox checked={showDiff} onChange={(e) => setShowDiff(e?.target?.checked ?? false)}>
					Hiển thị kết quả bị chênh lệch và bất thường
				</Checkbox>
				<Checkbox checked={showUnchecked} onChange={(e) => setShowUnchecked(e?.target?.checked ?? false)}>
					Hiển thị các vị trí chưa kiểm kê
				</Checkbox>
			</div>

			<Table rowKey="id" dataSource={filteredItems} columns={columns} pagination={false} size="small" scroll={{ x: "max-content" }} />

			<div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
				<Pagination
					current={page}
					pageSize={limit}
					total={record?.totalItems ?? 0}
					showSizeChanger
					onChange={(p, ps) => {
						navigate(`${location.pathname}?${queryString.stringify({ ...params, page: p, limit: ps })}`);
					}}
				/>
			</div>

			{dialog === "reassign" && <ReassignDialog open recordId={recordId} onClose={() => setDialog(null)} onSuccess={closeAndRefetch} />}
			{dialog === "cancel" && <CancelDialog open recordId={recordId} onClose={() => setDialog(null)} onSuccess={closeAndRefetch} />}
			{dialog === "complete" && <CompleteDialog open recordId={recordId} onClose={() => setDialog(null)} onSuccess={closeAndRefetch} />}
			{dialog === "recount" && <RecountDialog open recordId={recordId} sessionCount={record?.sessionCount ?? 0} onClose={() => setDialog(null)} onSuccess={closeAndRefetch} />}
			{stockDelta && <StockDeltaDialog open recordId={recordId} locationCode={stockDelta.locationCode} sku={stockDelta.sku} onClose={() => setStockDelta(null)} />}
		</Card>
	);
};

export default ViewMode;
