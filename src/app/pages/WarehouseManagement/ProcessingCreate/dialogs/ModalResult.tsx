import React, { memo, useState } from "react";
import { Modal, Table, Tooltip, Pagination, Typography, Flex, Button } from "antd";
import { CopyOutlined, CloseOutlined } from "@ant-design/icons";

const { Text } = Typography;

const ModalResultCreatePickup = ({ onHide, result }) => {
	const [page, setPage] = useState(1);
	const [isCopied, setIsCopied] = useState(false);

	const totalRecord = result?.warehouseBillErrors?.length || 0;
	const pageSize = 5;

	const onCopyToClipBoard = async (text) => {
		await navigator.clipboard.writeText(text);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 1500);
	};

	const columns = [
		{
			title: "Mã phiếu xuất",
			dataIndex: "system_package_number",
			key: "system_package_number",
			width: "40%",
			render: (item, record) => (
				<span>
					{record?.warehouseBillCode}
					<Tooltip title={isCopied ? "Copy thành công" : "Copy"}>
						<CopyOutlined
							style={{
								marginLeft: 8,
								cursor: "pointer",
								color: "#1677ff",
							}}
							onClick={() => onCopyToClipBoard(record?.warehouseBillCode)}
						/>
					</Tooltip>
				</span>
			),
		},
		{
			title: "Lỗi",
			dataIndex: "error_message",
			key: "error_message",
			render: (item, record) => <span style={{ wordBreak: "break-word" }}>{record?.error}</span>,
		},
	];

	return (
		<Modal
			centered
			open={!!result}
			footer={null}
			width={700}
			title="Kết quả tạo danh sách xử lý phiếu xuất kho"
			className="pickup-result-modal"
			closeIcon={<CloseOutlined onClick={onHide} />}
			onCancel={onHide}
		>
			<Flex style={{ marginBottom: 12 }} gap={4}>
				<Text strong>Phiếu xuất kho đã chọn:</Text> {result?.totalWarehouseBillProcessed}
			</Flex>

			<Flex style={{ marginBottom: 12 }} gap={4}>
				<Text strong>Phiếu xuất kho xử lý thành công:</Text> <Text style={{ color: "green" }}>{result?.totalWarehouseBillSuccess}</Text>
			</Flex>

			<Flex style={{ marginBottom: 12 }} gap={4}>
				<Text strong>Số danh sách được tạo:</Text> <Text style={{ color: "green" }}>{result?.totalProcessingListsCreated}</Text>
			</Flex>

			<Flex style={{ marginBottom: 12 }} gap={4}>
				<Text strong>Phiếu xuất kho xử lý thất bại:</Text> <Text style={{ color: "red" }}>{result?.totalWarehouseBillFailed}</Text>
			</Flex>

			{result?.totalWarehouseBillFailed > 0 && (
				<>
					<Table dataSource={result?.warehouseBillErrors} columns={columns} pagination={false} bordered size="small" style={{ marginTop: 16, borderRadius: 8 }} />

					<div style={{ textAlign: "right", marginTop: 16 }}>
						<Pagination current={page} total={totalRecord} pageSize={pageSize} onChange={(p) => setPage(p)} showSizeChanger={false} />
					</div>
				</>
			)}

			<Flex justify="end" style={{ textAlign: "right", marginTop: 20 }}>
				<Button onClick={onHide} className="btn-base" type="primary" style={{ width: 100 }}>
					Đóng
				</Button>
			</Flex>
		</Modal>
	);
};

export default memo(ModalResultCreatePickup);
