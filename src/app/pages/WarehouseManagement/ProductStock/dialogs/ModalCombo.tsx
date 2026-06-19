import { Modal, Table, Typography } from "antd";
import React, { memo } from "react";
import { Link } from "react-router-dom";

const { Text } = Typography;

const ModalCombo = ({ dataCombo, onHide }) => {
	const columns = [
		{
			title: "SKU",
			dataIndex: "sku",
			key: "sku",
			align: "center",
			width: "50%",
			render: (_item, record) => {
				return <Text>{record?.combo_item?.sku}</Text>;
			},
		},
		{
			title: "Số lượng",
			dataIndex: "quantity",
			key: "quantity",
			align: "center",
			width: "50%",
			render: (item, record) => {
				return <Text>{record?.quantity}</Text>;
			},
		},
	];
	return (
		<Modal open={!!dataCombo} width={1000} centered onCancel={onHide} footer={null} destroyOnClose title="Thông tin combo">
			<Table bordered={true} columns={columns as any} dataSource={(dataCombo || []) as any} scroll={{ y: 350 }} pagination={false} />
		</Modal>
	);
};

export default memo(ModalCombo);
