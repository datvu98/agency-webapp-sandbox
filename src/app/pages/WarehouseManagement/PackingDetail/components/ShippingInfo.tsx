import React, { useMemo } from "react";
import { Card, Typography, Alert, List } from "antd";
import { CarOutlined, ClockCircleOutlined, InfoCircleOutlined, FileTextOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Title } = Typography;

export default function ShippingInfo({ selectedRow, dataCount, dataDetail, dataItem }) {
	const currentItem = useMemo(() => {
		if (!selectedRow) return {};
		return dataItem?.find((item) => item?.id == selectedRow?.id);
	}, [dataItem, selectedRow]);
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 16, maxHeight: "60vh", overflowY: "auto", paddingRight: 4 }}>
			{/* Thông tin vận chuyển */}
			<Card
				title={
					<span>
						<CarOutlined style={{ color: "#ff5628", marginRight: 8 }} />
						THÔNG TIN VẬN CHUYỂN
					</span>
				}
			>
				<Card style={{ background: "#f3f4f6", marginBottom: 12, fontSize: 10 }} bodyStyle={{ padding: 12 }}>
					<Text type="secondary" style={{ fontSize: 10 }} strong>
						ĐƠN VỊ VẬN CHUYỂN
					</Text>
					<Title level={5} style={{ margin: 0, fontSize: 10 }}>
						{currentItem?.warehouseBill?.shippingCarrier ? currentItem?.warehouseBill?.shippingCarrier : "--"}
					</Title>
				</Card>

				<Alert
					icon={<ClockCircleOutlined />}
					type="error"
					showIcon
					message={
						<Text strong style={{ fontSize: 10 }}>
							HẠN GIAO HÀNG
						</Text>
					}
					description={
						<Text style={{ fontSize: 10 }} strong>
							{currentItem?.warehouseBill?.shipExpiredAt ? dayjs(currentItem?.warehouseBill?.shipExpiredAt).format("DD/MM/YYYY HH:mm") : "--"}
						</Text>
					}
				/>
			</Card>

			{/* Ghi chú đóng gói */}
			{/* <Card
				title={
					<span>
						<FileTextOutlined style={{ color: "#ff5628", marginRight: 8 }} />
						GHI CHÚ ĐÓNG GÓI
					</span>
				}
			>
				<Alert
					type="warning"
					showIcon
					icon={<InfoCircleOutlined />}
					message="Lưu ý quan trọng"
					description="Khách hàng yêu cầu bọc thêm lớp chống sốc cho góc hộp. Kiểm tra kỹ seal trước khi đóng gói."
				/>
			</Card> */}

			{/* <Card title="QUY CHUẨN ĐÓNG GÓI">
				<List
					dataSource={["Kiểm tra ngoại quan sản phẩm, đảm bảo không trầy xước.", "Đóng gói đúng loại hộp theo quy định.", "Dán tem và niêm phong trước khi xuất kho."]}
					renderItem={(item, index) => (
						<List.Item>
							<div style={{ display: "flex", gap: 12 }}>
								<div
									style={{
										width: 24,
										height: 24,
										borderRadius: 12,
										background: "#e6f0ff",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontWeight: 600,
									}}
								>
									{index + 1}
								</div>
								<Text>{item}</Text>
							</div>
						</List.Item>
					)}
				/>
			</Card> */}
		</div>
	);
}
