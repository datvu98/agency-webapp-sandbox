import React, { useState } from "react";
import { Tabs, Badge, Card, Typography, List } from "antd";

const { Text } = Typography;

const dataPending = [
	{
		id: 1,
		code: "ORD-10293",
		name: "Smart Watch Series 8",
		location: "AW - S8 - MDN",
	},
	{
		id: 2,
		code: "ORD-006",
		name: "Product Name 006",
		location: "CH - N05 - 100",
	},
];

export default function PackingList({ selectedRow, setSelectedRow, dataItem, dataPagination, dataDetail, dataCount }) {
	const [activeKey, setActiveKey] = useState("pending");
	return (
		<Card>
			<Tabs
				activeKey={activeKey}
				onChange={setActiveKey}
				items={[
					{
						key: "pending",
						label: (
							<Text>
								CHỜ ĐÓNG GÓI{" "}
								{dataDetail?.processingList?.type == "SIO" && <Badge count={dataCount?.totalQuantityPacking - dataCount?.totalQuantityPacked} style={{ background: "#ff5628" }} />}
							</Text>
						),
					},
					{
						key: "history",
						label: <Text>LỊCH SỬ {dataDetail?.processingList?.type == "SIO" && <Badge count={dataCount?.totalQuantityPacked} />}</Text>,
					},
				]}
			/>

			<List
				style={{
					maxHeight: "60vh",
					overflowY: "auto",
					paddingRight: 4,
				}}
				dataSource={activeKey === "pending" ? dataItem?.filter((item) => !!item?.remainingQuantity) : dataItem?.filter((item) => item?.remainingQuantity != item?.quantity)}
				renderItem={(item: any) => (
					<Card
						key={item?.id}
						style={{
							marginBottom: 12,
							borderRadius: 10,
							borderLeft: selectedRow?.id == item?.id ? "4px solid #ff5628" : "1px solid #f0f0f0",
						}}
						bodyStyle={{ padding: 12 }}
						onClick={() => {
							setSelectedRow(item);
						}}
					>
						<div style={{ display: "flex", justifyContent: "space-between" }}>
							{dataDetail?.processingList?.type == "SIO" && <Text strong>{item?.warehouseBill?.orderCode}</Text>}
							<Text style={{ marginLeft: "auto" }}>x{activeKey == "pending" ? item?.remainingQuantity : item?.quantity - item?.remainingQuantity}</Text>
						</div>

						<Text>{item?.variant?.variant_full_name}</Text>

						<div style={{ marginTop: 4 }}>
							<Text type="secondary">{item?.variant?.gtin}</Text>
						</div>
					</Card>
				)}
			/>
		</Card>
	);
}
