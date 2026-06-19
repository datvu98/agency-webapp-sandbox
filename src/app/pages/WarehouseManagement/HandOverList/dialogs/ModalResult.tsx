import React, { memo } from "react";
import { Modal, Row, Col, Card, Typography, Table, Button } from "antd";

const { Title, Text } = Typography;

interface ErrorItem {
	warehouseBillId: number;
	code: string;
	error: string;
}

interface ModalResultProps {
	open: boolean;
	total: number;
	success: number;
	failed: number;
	errors: ErrorItem[];
	onClose: () => void;
}

const ModalResult: React.FC<ModalResultProps> = ({ open, total, success, failed, errors, onClose }) => {
	const columns = [
		{
			title: "Mã Kiện",
			dataIndex: "code",
			key: "code",
			render: (value: string) => <a>{value}</a>,
		},
		{
			title: "Lỗi",
			dataIndex: "error",
			key: "error",
			render: (value: string) => <span>{value}</span>,
		},
	];

	return (
		<Modal open={open} centered width={760} footer={null} closable={false}>
			<Title
				level={3}
				style={{
					color: "#0F2B56",
					marginBottom: 24,
				}}
			>
				Kết quả phiếu thêm vào phiên
			</Title>

			<Row gutter={16}>
				<Col span={8}>
					<Card
						styles={{
							body: {
								textAlign: "center",
								padding: 20,
							},
						}}
					>
						<Text
							style={{
								color: "#5B6472",
								fontSize: 16,
							}}
						>
							TỔNG SỐ KIỆN
						</Text>

						<div
							style={{
								fontSize: 42,
								fontWeight: 700,
								color: "#0F2B56",
								marginTop: 8,
							}}
						>
							{total}
						</div>
					</Card>
				</Col>

				<Col span={8}>
					<Card
						style={{
							background: "#F3FFF7",
							borderColor: "#D8F5E3",
						}}
						styles={{
							body: {
								textAlign: "center",
								padding: 20,
							},
						}}
					>
						<Text
							style={{
								color: "#11A75C",
								fontSize: 16,
								fontWeight: 500,
							}}
						>
							THÀNH CÔNG
						</Text>

						<div
							style={{
								fontSize: 42,
								fontWeight: 700,
								color: "#11A75C",
								marginTop: 8,
							}}
						>
							{success}
						</div>
					</Card>
				</Col>

				<Col span={8}>
					<Card
						style={{
							background: "#FFF5F5",
							borderColor: "#FFDCDC",
						}}
						styles={{
							body: {
								textAlign: "center",
								padding: 20,
							},
						}}
					>
						<Text
							style={{
								color: "#FF3B30",
								fontSize: 16,
								fontWeight: 500,
							}}
						>
							THẤT BẠI
						</Text>

						<div
							style={{
								fontSize: 42,
								fontWeight: 700,
								color: "#FF3B30",
								marginTop: 8,
							}}
						>
							{failed}
						</div>
					</Card>
				</Col>
			</Row>

			{errors?.length > 0 && (
				<>
					<Title
						level={5}
						style={{
							marginTop: 24,
							marginBottom: 12,
						}}
					>
						Bảng mã lỗi
					</Title>

					<Table rowKey="warehouseBillId" columns={columns} dataSource={errors} pagination={false} bordered size="middle" />
				</>
			)}

			<div
				style={{
					display: "flex",
					justifyContent: "flex-end",
					marginTop: 24,
					paddingTop: 20,
					borderTop: "1px solid #F0F0F0",
				}}
			>
				<Button
					type="primary"
					size="large"
					onClick={onClose}
					style={{
						minWidth: 92,
						borderRadius: 8,
					}}
				>
					Đóng
				</Button>
			</div>
		</Modal>
	);
};

export default memo(ModalResult);
