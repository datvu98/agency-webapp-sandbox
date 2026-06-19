import React, { memo, useState } from "react";
import { Modal, Table, Typography, Space, Tag } from "antd";

const { Text } = Typography;

const ModalResultsUploadAisle = ({ dataResults, onHide }) => {
	const [page, setPage] = useState(1);

	const totalRecord = dataResults?.meta?.failed || 0;

	const columns = [
		{
			title: "Mã luống đi",
			dataIndex: "code",
			key: "code",
			align: "center",
			width: "50%",
			render: (text) => <Text>{text}</Text>,
		},
		{
			title: "Lỗi",
			dataIndex: "error",
			key: "error",
			align: "center",
			render: (text) => <Text type={text ? "danger" : undefined}>{text || "-"}</Text>,
		},
	];

	return (
		<Modal open={!!dataResults} onCancel={onHide} centered title={"Kết quả tải file"} width={700} footer={null}>
			<Space direction="vertical" size="middle" style={{ width: "100%", marginBottom: 16 }}>
				<Text>
					Tổng số luống đi cần thêm vào khu vực : <Text strong>{dataResults?.meta?.total}</Text>
				</Text>

				<Text>
					Tổng số luống đi thêm thành công :{" "}
					<Text strong type="success">
						{dataResults?.meta?.success}
					</Text>
				</Text>

				<Text>
					Tổng số luống đi thêm thất bại :{" "}
					<Text strong type="danger">
						{dataResults?.meta?.failed}
					</Text>
				</Text>
			</Space>

			<Table
				columns={columns as any}
				dataSource={dataResults?.data || []}
				pagination={{
					current: page,
					pageSize: 5,
					total: totalRecord,
					onChange: (page) => setPage(page),
					showSizeChanger: false,
					showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} bản ghi`,
				}}
				locale={{
					emptyText: "Chưa có dữ liệu",
				}}
				bordered
				size="middle"
			/>
		</Modal>
	);
};

export default memo(ModalResultsUploadAisle);
