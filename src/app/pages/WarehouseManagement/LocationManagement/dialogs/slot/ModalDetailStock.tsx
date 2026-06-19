import React, { memo, useState, useMemo } from "react";
import { Modal, Table, Typography, Pagination, Spin } from "antd";
import { useQuery } from "@apollo/client";
import dayjs from "dayjs";
import client from "../../../../../../apollo";
import query_locationManagerProductList from "graphql/queries/query_locationManagerProductList";
import query_sme_catalog_product_variant from "graphql/queries/query_sme_catalog_product_variant";

const { Title, Text } = Typography;

const queryGetSmeProductVariants = async (ids) => {
	if (!ids?.length) return [];

	const { data } = await client.query({
		query: query_sme_catalog_product_variant,
		variables: { where: { id: { _in: ids } } },
		fetchPolicy: "network-only",
	});

	return data?.sme_catalog_product_variant || [];
};

const ModalDetailStock = memo(({ show, onHide, location }: any) => {
	const [page, setPage] = useState(1);
	const [dataTable, setDataTable] = useState([]);
	const pageSize = 5;

	const { loading } = useQuery(query_locationManagerProductList, {
		variables: { id: location?.id },
		fetchPolicy: "cache-and-network",
		onCompleted: async (data) => {
			const ids = data?.locationManagerProductList?.data?.map((i) => i?.variantId);
			const dataVariants = await queryGetSmeProductVariants(ids);

			const variantList = data?.locationManagerProductList?.data?.map((item) => {
				const variant = dataVariants?.find((_var) => _var?.id === item?.variantId);
				return {
					key: item?.variantId,
					sku: variant?.sku,
					product_status_name: variant?.product_status_name,
					size: variant?.size,
					expiredAt: item?.expiredAt,
					stockActual: item?.stockActual,
				};
			});

			setDataTable(variantList || []);
		},
	});

	const totalRecord = dataTable?.length || 0;

	const columns = useMemo(
		() => [
			{
				title: "SKU hàng hoá",
				dataIndex: "sku",
				align: "center",
				width: "20%",
				render: (value) => <Text style={{ wordBreak: "break-word" }}>{value}</Text>,
			},
			{
				title: "Trạng thái",
				dataIndex: "product_status_name",
				align: "center",
				width: "20%",
			},
			{
				title: "Kích cỡ hàng hoá",
				dataIndex: "size",
				align: "center",
				width: "20%",
			},
			{
				title: "Hạn sử dụng",
				dataIndex: "expiredAt",
				align: "center",
				width: "20%",
				render: (value) => (value ? dayjs(value).add(7, "hour").format("DD/MM/YYYY") : ""),
			},
			{
				title: "Số lượng",
				dataIndex: "stockActual",
				align: "center",
				width: "20%",
			},
		],
		[]
	);

	const currentPageData = useMemo(() => dataTable?.slice((page - 1) * pageSize, page * pageSize), [dataTable, page]);

	return (
		<Modal open={show} onCancel={onHide} footer={null} centered width={900} destroyOnClose title={"Thông tin chi tiết hàng hoá trong vị trí"}>
			<Spin spinning={loading}>
				<div style={{ marginBottom: 12 }}>
					<Text strong>{`Vị trí: ${location?.name}`}</Text>
				</div>

				<div style={{ marginBottom: 12 }}>
					<Text strong>{`Tỷ lệ chứa: ${location?.storageEquipment?.usageCapacityRatio}%`}</Text>
				</div>

				<div style={{ marginBottom: 12 }}>
					<Text strong>Danh sách hàng hoá đang chứa:</Text>
				</div>

				<Table
					bordered={false}
					columns={columns as any}
					dataSource={currentPageData}
					size="middle"
					locale={{
						emptyText: "Chưa có dữ liệu",
					}}
					pagination={{
						current: page,
						pageSize: 5,
						total: totalRecord,
						onChange: (page) => setPage(page),
						showSizeChanger: false,
						showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} bản ghi`,
					}}
				/>
			</Spin>
		</Modal>
	);
});

export default ModalDetailStock;
