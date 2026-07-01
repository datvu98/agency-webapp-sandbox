import React, { memo, useMemo, useState } from "react";
import { Modal, Table, Tooltip, Pagination, Typography, Flex, Button } from "antd";
import { CopyOutlined, CloseOutlined } from "@ant-design/icons";

const { Text } = Typography;

const ModalResult = ({ onHide, errors, total, type }) => {
	const [page, setPage] = useState(1);
	const [isCopied, setIsCopied] = useState(false);

	const totalRecord = errors?.length || 0;
	const pageSize = 5;

	const onCopyToClipBoard = async (text) => {
		await navigator.clipboard.writeText(text);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 1500);
	};

	const columns = [
		{
			title: "Mã danh sách xử lý",
			dataIndex: "code",
			key: "code",
			width: "30%",
			render: (item, record) => (
				<span>
					{record?.code}
					<Tooltip title={isCopied ? "Copy thành công" : "Copy"}>
						<CopyOutlined
							style={{
								marginLeft: 8,
								cursor: "pointer",
								color: "#1677ff",
							}}
							onClick={() => onCopyToClipBoard(record?.code)}
						/>
					</Tooltip>
				</span>
			),
		},
		{
			title: "Lỗi",
			dataIndex: "message",
			key: "message",
			render: (item, record) => <span style={{ wordBreak: "break-word" }}>{record?.message}</span>,
		},
	];

    const actionText = useMemo(() => {
        if (type == 'create_pick_step') {
            return 'tạo lộ trình'
        } 
        if (type == 'assign') {
            return 'phân công nhân viên'
        } 
        return 'phân công lại nhân viên'
    }, [type])

	return (
		<Modal
			centered
			open={true}
			footer={null}
			width={700}
			title="Kết quả xử lý"
			className="pickup-result-modal"
			closeIcon={<CloseOutlined onClick={onHide} />}
			onCancel={onHide}
		>
			<Flex style={{ marginBottom: 12 }} gap={4}>
				<Text strong>Số lượng phiếu cần {actionText}:</Text> {total}
			</Flex>

			<Flex style={{ marginBottom: 12 }} gap={4}>
				<Text strong>Số lượng phiếu {actionText} thành công:</Text> <Text style={{ color: "green" }}>{total - errors?.length}</Text>
			</Flex>
			<Flex style={{ marginBottom: 12 }} gap={4}>
				<Text strong>Số lượng phiếu {actionText} thất bại:</Text> <Text style={{ color: "red" }}>{errors?.length}</Text>
			</Flex>

			{errors?.length > 0 && (
				<>
					<Table dataSource={errors} columns={columns} pagination={false} bordered size="small" style={{ marginTop: 16, borderRadius: 8 }} />

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

export default memo(ModalResult);
