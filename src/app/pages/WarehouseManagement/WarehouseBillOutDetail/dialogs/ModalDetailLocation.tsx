import React, { memo } from "react";
import { Modal, Button, Flex, Typography, Empty, Table } from "antd";
import { useQuery } from "@apollo/client";
import query_pickingListShowLocationVariant from "graphql/queries/query_pickingListShowLocationVariant";
import dayjs from "dayjs";
import { formatNumberToCurrency } from "utils/helper";
import query_warehouseBillShowLocationVariant from "graphql/queries/query_warehouseBillShowLocationVariant";

interface ModalDetailLocationProps {
	show: boolean;
	onHide: () => void;
	dataInfo: {
		variant_id: string;
		variant_full_name: string;
		sku: string;
        warehouse_bill_id: number;
        warehouse_bill_item_id: number
	};
}
const { Text } = Typography;

const ModalDetailLocation: React.FC<ModalDetailLocationProps> = memo(({ show, onHide, dataInfo }) => {
	const { data: dataDetailLocation, loading: loadingDataDetailLocation } = useQuery(query_warehouseBillShowLocationVariant, {
		variables: {
			variantId: dataInfo?.variant_id,
			warehouseBillId: dataInfo?.warehouse_bill_id,
			warehouseBillItemId: dataInfo?.warehouse_bill_item_id,
		},
		fetchPolicy: "cache-and-network",
	});

	const columns = [
		{
			title: "Mã lô",
			dataIndex: "lotNumber",
			key: "lotNumber",
			width: "25%",
			align: "left",
			render: (item, record) => {
				return <Text>{record?.lotNumber || "--"}</Text>;
			},
		},
		{
			title: "Hạn sử dụng",
			dataIndex: "expiredAt",
			key: "expiredAt",
			width: "25%",
			render: (item, record) => {
				return <span>{record?.expiredAt ? dayjs(record?.expiredAt).format("DD/MM/YYYY") : "--"}</span>;
			},
		},
		{
			title: "Số lượng xuất",
			dataIndex: "quantity",
			key: "quantity",
			width: "25%",
			align: "right",
			render: (item, record) => {
				return <Text strong>{formatNumberToCurrency(record?.quantity)}</Text>;
			},
		},
	];
	console.log(dataDetailLocation);
	return (
		<Modal open={show} centered footer={null} width="1000px" onCancel={onHide} destroyOnClose title="Thông tin xuất kho SKU">
			<Flex align="center" gap={10}>
				<Text>
					Hàng hoá: <Text strong>{dataInfo?.variant_full_name}</Text>
				</Text>
				<Text>|</Text>
				<Text>
					SKU: <Text strong>{dataInfo?.sku}</Text>
				</Text>
			</Flex>
			<div style={{ textAlign: "center", padding: "16px 8px" }}>
				<Table
					className="upbase-table"
					columns={columns as any}
					bordered
					loading={loadingDataDetailLocation}
					locale={{
						emptyText: (
							<Flex className="empty-table" vertical justify="center" align="center">
								<Empty className="icon-empty-table" description={false} />
								<Text>Chưa có thông tin vị trí</Text>
							</Flex>
						),
					}}
					pagination={false}
					dataSource={dataDetailLocation?.warehouseBillShowLocationVariant?.data || []}
					tableLayout="auto"
					scroll={{ x: "max-content" }}
					summary={(pageData) => {
						const totalQuantity = pageData.reduce((sum, record) => sum + (record.quantity || 0), 0);
						return (
							<Table.Summary.Row>
								<Table.Summary.Cell colSpan={2} index={0}>
									<Text strong>TỔNG CỘNG</Text>
								</Table.Summary.Cell>
								<Table.Summary.Cell index={3} align="right">
									<Text strong>{formatNumberToCurrency(totalQuantity)}</Text>
								</Table.Summary.Cell>
							</Table.Summary.Row>
						);
					}}
				/>
			</div>
		</Modal>
	);
});

export default ModalDetailLocation;
