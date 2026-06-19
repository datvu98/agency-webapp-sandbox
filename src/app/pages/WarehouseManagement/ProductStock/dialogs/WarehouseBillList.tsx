import React, { useMemo, useCallback, memo, useState } from "react";
import { useQuery } from "@apollo/client";
import { groupBy, sum } from "lodash";
import dayjs from "dayjs";
import { formatNumberToCurrency } from "utils/helper";
import { Flex, Modal, Spin, Table, Typography } from "antd";
import query_warehouse_bills_stock from "graphql/queries/query_warehouse_bills_stock";

const { Text } = Typography;

const WarehouseBillList = ({ onHide, idVariant, currentSmeWarehouse, skuVariant, stockAllocated }) => {
	const { data, loading } = useQuery(query_warehouse_bills_stock, {
		fetchPolicy: "network-only",
		variables: {
			where: {
				warehouse: {
					id: {
						_eq: currentSmeWarehouse?.id,
					},
				},
				status: {
					_eq: "new",
				},
				type: {
					_eq: 'out'
				},
				bill_items: {
					variant_id: { _eq: idVariant },
					quantity: { _neq: 0 },
				},
			},
		},
	});

	const columns = [
		{
			title: "Tên phiếu xuất",
			dataIndex: "name",
			key: "name",
			align: "left",
			width: "30%",
			render: (_item, record) => {
				return <Text>{record?.code}</Text>;
			},
		},
		{
			title: "Số lượng",
			dataIndex: "quantity",
			key: "quantity",
			align: "center",
			width: "15%",
			render: (item, record) => {
				console.log(record?.bill_items);
				const list_item = record?.bill_items?.filter((item) => item?.variant_id == idVariant);
				const quantity = sum(list_item?.map((item) => item?.quantity) || []);
				return <Text>{formatNumberToCurrency(quantity)}</Text>;
			},
		},
		{
			title: "Đơn hàng liên quan",
			dataIndex: "status",
			key: "status",
			align: "center",
			width: "20%",
			render: (item, record) => {
				return (
					<>
						<Text>{record?.order_code || "--"}</Text>
					</>
				);
			},
		},
	];

	return (
		<Modal width={1000} open={!!idVariant} centered onCancel={onHide} footer={null} destroyOnClose title="Thông tin phiếu tạm giữ tồn">
			<Spin spinning={loading}>
				<Flex justify="space-between" align="center">
					<span>{`Tổng tồn tạm giữ: ${stockAllocated}`}</span>
					<span>{`Mã SKU hàng hoá: ${skuVariant}`}</span>
					<span>{`Kho vật lý: ${currentSmeWarehouse?.name}`}</span>
				</Flex>
				<div style={{ position: "relative" }}>
					<Table style={loading ? { opacity: 0.4 } : {}} className="upbase-table" columns={columns as any} dataSource={data?.warehouse_bills || []} scroll={{ y: 350 }} />
				</div>
			</Spin>
		</Modal>
	);
};

export default memo(WarehouseBillList);
