import React, { memo } from "react";
import { Modal, Button, Flex, Typography, Empty, Table } from "antd";
import { useQuery } from "@apollo/client";
import query_pickingListShowLocationVariant from "graphql/queries/query_pickingListShowLocationVariant";
import dayjs from "dayjs";
import { formatNumberToCurrency } from "utils/helper";

interface ModalDetailLocationProps {
	show: boolean;
	onHide: () => void;
	dataInfo: {
		id: number;
		variantId: string;
		sku: string;
		variantFullName: string;
	};
}
const { Text } = Typography;

const ModalDetailLocation: React.FC<ModalDetailLocationProps> = memo(({ show, onHide, dataInfo }) => {
	const { data: dataDetailLocation, loading: loadingDataDetailLocation } = useQuery(query_pickingListShowLocationVariant, {
		variables: {
			id: dataInfo?.id,
			variantId: dataInfo?.variantId,
		},
		fetchPolicy: "cache-and-network",
	});

	const columns = [
		{
			title: "Mã vị trí",
			dataIndex: "storageEquipmentCode",
			key: "storageEquipmentCode",
			width: "25%",
			align: "left",
			render: (item, record) => {
				return <Text>{record?.storageEquipmentCode || "--"}</Text>;
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
			title: "Mã lô",
			dataIndex: "lotNumber",
			key: "lotNumber",
			width: "25%",
			render: (item, record) => {
				return <span>{record?.lotNumber || "--"}</span>;
			},
		},
		{
			title: "Số lượng",
			dataIndex: "quantity",
			key: "quantity",
			width: "25%",
			align: "right",
			render: (item, record) => {
				return <span>{formatNumberToCurrency(record?.quantity)}</span>;
			},
		},
	];
	return (
		<Modal open={show} centered footer={null} onCancel={onHide} destroyOnClose width={1000} title='Thông tin vị trí'>
			<Flex align="center" gap={10}>
				<Text>
					Hàng hoá: <Text strong>{dataInfo?.variantFullName}</Text>
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
					dataSource={dataDetailLocation?.pickingListShowLocationVariant?.data || []}
					tableLayout="auto"
					scroll={{ x: "max-content" }}
				/>
			</div>
		</Modal>
	);
});

export default ModalDetailLocation;
