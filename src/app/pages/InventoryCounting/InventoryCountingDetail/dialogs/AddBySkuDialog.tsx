import { useMutation, useQuery } from "@apollo/client";
import { Button, Checkbox, Col, Flex, Input, Modal, Row, Select, Spin, Typography } from "antd";
import React, { useMemo, useState } from "react";
import mutate_inventoryCountingAddByVariant from "graphql/mutations/mutate_inventoryCountingAddByVariant";
import query_agencyGetSme from "graphql/queries/query_agencyGetSme";
import query_sme_brands from "graphql/queries/query_sme_brands";
import query_sme_product_status from "graphql/queries/query_sme_product_status";
import query_fulfillmentVariantStockList from "graphql/queries/query_fulfillmentVariantStockList";
import { showAlert } from "utils/helper";

const { Text } = Typography;

interface Props {
	open: boolean;
	recordId: number;
	warehouseId: number;
	onClose: () => void;
	onSuccess: () => void;
}

const PAGE_SIZE = 20;

interface VariantCardProps {
	item: any;
	selected: boolean;
	onToggle: (id: string) => void;
}

const VariantCard = ({ item, selected, onToggle }: VariantCardProps) => (
	<div
		onClick={() => onToggle(item?.variantId)}
		style={{
			border: `1.5px solid ${selected ? "#ff5629" : "#e8e8e8"}`,
			borderRadius: 8,
			padding: "10px 12px",
			cursor: "pointer",
			background: selected ? "#fff5f2" : "#fff",
			transition: "border-color 0.2s, background 0.2s",
			height: "100%",
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
			</Flex>
		</Flex>
	</div>
);

const AddBySkuDialog = ({ open, recordId, warehouseId, onClose, onSuccess }: Props) => {
	const [selectedSmeId, setSelectedSmeId] = useState<number | undefined>(undefined);
	const [selectedBrandId, setSelectedBrandId] = useState<number | undefined>(undefined);
	const [selectedStatusId, setSelectedStatusId] = useState<number | undefined>(undefined);
	const [tempSearch, setTempSearch] = useState("");
	const [search, setSearch] = useState("");
	const [isExpiredDate, setIsExpiredDate] = useState<boolean | undefined>(undefined);
	const [page, setPage] = useState(1);
	const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);

	const { data: smeData } = useQuery(query_agencyGetSme, {
		fetchPolicy: "cache-and-network",
		skip: !open,
	});

	const { data: brandData } = useQuery(query_sme_brands, {
		fetchPolicy: "cache-and-network",
		skip: !open,
	});

	const { data: statusData } = useQuery(query_sme_product_status, {
		fetchPolicy: "cache-and-network",
		skip: !open,
	});

	const selectedStatusCode = useMemo(() => {
		if (!selectedStatusId) return undefined;
		return (statusData?.sme_product_status ?? [])?.find(
			(s: any) => s?.id === selectedStatusId
		)?.status_code;
	}, [selectedStatusId, statusData]);

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

	const smeOptions = useMemo(
		() =>
			(smeData?.agencyGetSme ?? [])?.map((s: any) => ({
				label: `${s?.sme_id} - ${s?.full_name}`,
				value: s?.sme_id,
			})),
		[smeData]
	);

	const brandOptions = useMemo(
		() =>
			(brandData?.sme_brands ?? [])
				?.filter((b: any) => !selectedSmeId || b?.sme_id === selectedSmeId)
				?.map((b: any) => ({ label: b?.name, value: b?.id })),
		[brandData, selectedSmeId]
	);

	const filteredStatusOptions = useMemo(() => {
		const all = statusData?.sme_product_status ?? [];
		return (selectedSmeId ? all?.filter((s: any) => s?.sme_id === selectedSmeId) : all)?.map(
			(s: any) => ({ label: s?.name, value: s?.id })
		);
	}, [statusData, selectedSmeId]);

	const variantList: any[] = variantData?.fulfillmentVariantStockList?.data ?? [];

	const toggleVariant = (id: string) => {
		setSelectedVariantIds((prev) =>
			prev?.includes(id) ? prev?.filter((v) => v !== id) : [...prev, id]
		);
	};

	const [add, { loading }] = useMutation(mutate_inventoryCountingAddByVariant, {
		onCompleted: (data) => {
			const result = data?.inventoryCountingAddByVariant;
			if (result?.success) {
				showAlert.success(`Đã thêm ${result?.data?.addedCount ?? 0} SKU`);
				onSuccess();
			} else {
				showAlert.error(result?.message ?? "Thêm SKU thất bại");
			}
		},
		onError: () => showAlert.error("Thêm SKU thất bại"),
	});

	const handleOk = () => {
		if (!selectedVariantIds?.length) {
			showAlert.error("Vui lòng chọn ít nhất một SKU");
			return;
		}
		add({ variables: { input: {recordId, variantIds: selectedVariantIds} } });
	};

	const handleClose = () => {
		setSelectedSmeId(undefined);
		setSelectedBrandId(undefined);
		setSelectedStatusId(undefined);
		setTempSearch("");
		setSearch("");
		setIsExpiredDate(undefined);
		setPage(1);
		setSelectedVariantIds([]);
		onClose();
	};

	return (
		<Modal
			open={open}
			title="Thêm nhanh theo SKU"
			onCancel={handleClose}
			width={860}
			footer={
				<>
					<Button onClick={handleClose}>Huỷ</Button>
					<Button type="primary" loading={loading} onClick={handleOk}>
						Thêm ({selectedVariantIds?.length ?? 0} SKU)
					</Button>
				</>
			}
		>
			<Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
				<Col span={8}>
					<Select
						placeholder="Đối tác"
						allowClear
						showSearch
						optionFilterProp="label"
						style={{ width: "100%" }}
						options={smeOptions}
						value={selectedSmeId}
						onChange={(val) => {
							setSelectedSmeId(val);
							setSelectedBrandId(undefined);
							setSelectedStatusId(undefined);
							setPage(1);
						}}
					/>
				</Col>

				<Col span={8}>
					<Select
						placeholder="Nhãn hàng"
						allowClear
						showSearch
						optionFilterProp="label"
						style={{ width: "100%" }}
						options={brandOptions}
						value={selectedBrandId}
						onChange={(val) => {
							setSelectedBrandId(val);
							setPage(1);
						}}
					/>
				</Col>

				<Col span={8}>
					<Select
						placeholder="Trạng thái sản phẩm"
						allowClear
						showSearch
						optionFilterProp="label"
						style={{ width: "100%" }}
						options={filteredStatusOptions}
						value={selectedStatusId}
						onChange={(val) => {
							setSelectedStatusId(val);
							setPage(1);
						}}
					/>
				</Col>

				<Col span={16}>
					<Input.Search
						placeholder="Tìm SKU, tên hàng hoá"
						allowClear
						value={tempSearch}
						onChange={(e) => setTempSearch(e?.target?.value ?? "")}
						onSearch={(val) => {
							setSearch(val);
							setPage(1);
						}}
					/>
				</Col>

				<Col span={8} style={{ display: "flex", alignItems: "center" }}>
					<Checkbox
						checked={isExpiredDate === true}
						onChange={(e) => {
							setIsExpiredDate(e?.target?.checked ? true : undefined);
							setPage(1);
						}}
					>
						Quản lý HSD
					</Checkbox>
				</Col>
			</Row>

			<Spin spinning={loadingVariants}>
				<div
					style={{
						minHeight: 240,
						maxHeight: 420,
						overflowY: "auto",
						border: "1px solid #f0f0f0",
						borderRadius: 8,
						padding: 12,
					}}
				>
					{variantList?.length === 0 && !loadingVariants ? (
						<Flex justify="center" align="center" style={{ height: 200 }}>
							<Text type="secondary">Không có dữ liệu</Text>
						</Flex>
					) : (
						<Row gutter={[12, 12]}>
							{variantList?.map((item: any) => (
								<Col span={12} key={item?.variantId}>
									<VariantCard
										item={item}
										selected={selectedVariantIds?.includes(item?.variantId)}
										onToggle={toggleVariant}
									/>
								</Col>
							))}
						</Row>
					)}
				</div>

				{variantList?.length > 0 && (
					<Flex justify="space-between" align="center" style={{ marginTop: 10 }}>
						<Text type="secondary" style={{ fontSize: 13 }}>
							Đã chọn {selectedVariantIds?.length ?? 0} SKU
						</Text>
						<Flex gap={8} align="center">
							<Button size="small" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
								&lt;
							</Button>
							<Text style={{ fontSize: 13 }}>Trang {page}</Text>
							<Button size="small" disabled={variantList?.length < PAGE_SIZE} onClick={() => setPage((p) => p + 1)}>
								&gt;
							</Button>
						</Flex>
					</Flex>
				)}
			</Spin>
		</Modal>
	);
};

export default AddBySkuDialog;
