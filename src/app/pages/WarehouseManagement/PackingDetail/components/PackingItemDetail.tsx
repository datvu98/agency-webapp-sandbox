import React, { useMemo, useState } from "react";
import { Card, Button, Typography, Divider, Flex } from "antd";
import { BarcodeOutlined, WarningOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import mutate_printLabelPacking from "graphql/mutations/mutate_printLabelPacking";
import { printFromS3, showAlert } from "utils/helper";
import { useParams } from "react-router-dom";
import mutate_printLabelPackingTemp from "graphql/mutations/mutate_printLabelPackingTemp";
import HtmlPrint from "app/components/HTMLPrint";

const { Text, Title } = Typography;

export default function PackingItemDetail({ selectedRow, dataItem, dataDetail, dataCount }) {
	const { id } = useParams();
	const [html, setHtml] = useState(false);
	const [namePrint, setNamePrint] = useState("");
	const [printLabelPacking, { loading: loadingPrintLabelPacking }] = useMutation(mutate_printLabelPacking);
	const [printLabelPackingTemp, { loading: loadingPrintLabelPackingTemp }] = useMutation(mutate_printLabelPackingTemp);

	const currentItem = useMemo(() => {
		if (!selectedRow) return {};
		return dataItem?.find((item) => item?.id == selectedRow?.id);
	}, [dataItem, selectedRow]);

	const printHtml = (html, name) => {
		setNamePrint(name);
		setHtml(html);
	};
	return (
		<div style={{ background: "#f3f4f6", paddingLeft: 20, paddingRight: 20 }}>
			{/* Header */}
			{html && namePrint && <HtmlPrint setHtml={setHtml} setNamePrint={setNamePrint} html={html} namePrint={namePrint} />}

			<Card
				style={{
					borderRadius: 12,
					boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
				}}
				bodyStyle={{ padding: 20 }}
			>
				<Flex align="center" justify="space-between">
					<Flex vertical>
						<Text type="secondary">MÃ ĐƠN HÀNG HIỆN TẠI</Text>
						<Text style={{ margin: 0 }} strong>
							{currentItem?.warehouseBill?.orderCode}
						</Text>
					</Flex>

					{((!currentItem?.remainingQuantity && dataDetail?.processingList?.type == "SIO") ||
						(dataCount?.totalQuantityPacked == dataCount?.totalQuantityPacking && dataDetail?.processingList?.type == "MIO")) && (
						<Flex justify="end">
							<Button
								type="primary"
								className="btn-base"
								onClick={async () => {
									let { data } = await printLabelPacking({
										variables: {
											warehouseBillId: selectedRow?.warehouseBill?.id,
											workSessionId: Number(id),
										},
									});
									if (data?.printLabelPacking?.success) {
										if (data?.printLabelPacking?.data) {
											printFromS3(data?.printLabelPacking?.data);
										} else {
											let { data: dataPrintTemp } = await printLabelPackingTemp({
												variables: {
													warehouseBillId: selectedRow?.warehouseBill?.id,
													workSessionId: Number(id),
												},
											});
											if (dataPrintTemp?.printLabelPackingTemp?.success) {
												printHtml(dataPrintTemp?.printLabelPackingTemp?.data, "Mã_vận_đơn");
											} else {
												showAlert.error(dataPrintTemp?.printLabelPackingTemp?.message || "In vận đơn thất bại");
											}
										}
									} else {
										showAlert.error(data?.printLabelPacking?.message || "In vận đơn thất bại");
									}
								}}
							>
								In vận đơn
							</Button>
						</Flex>
					)}
				</Flex>
			</Card>
			<Card
				style={{
					borderRadius: 12,
					boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
				}}
				bodyStyle={{ padding: 0 }}
			>
				<div
					style={{
						padding: 12,
						borderBottom: "1px solid #eee",
						display: "flex",
						justifyContent: "space-between",
					}}
				>
					<Text strong>📦 Thông tin & Đóng gói</Text>
					{currentItem ? (
						<Text strong style={{ color: "#ff5628" }}>
							{currentItem?.quantity - currentItem?.remainingQuantity} / {currentItem?.quantity}
						</Text>
					) : (
						<Text strong style={{ color: "#ff5628" }}>
							0/0
						</Text>
					)}
				</div>

				{/* Product info */}
				<div style={{ padding: 20, textAlign: "center" }}>
					<Title level={4}>{currentItem?.variant?.variant_full_name}</Title>

					<Text type="secondary">MÃ VẠCH HÀNG HÓA</Text>

					<div
						style={{
							marginTop: 10,
							background: "#f0f2f5",
							padding: 16,
							borderRadius: 8,
							fontWeight: 600,
							letterSpacing: 2,
							fontSize: 24,
						}}
					>
						{currentItem?.variant?.gtin}
					</div>
				</div>

				<Divider style={{ margin: 0 }} />

				{/* Actions */}
				{/* <div
					style={{
						padding: 16,
						display: "flex",
						gap: 12,
						justifyContent: "center",
					}}
				>
					<Button icon={<WarningOutlined />}>BÁO THIẾU (F8)</Button>

					<Button icon={<ExclamationCircleOutlined />}>HÀNG LỖI (F9)</Button>
				</div> */}
			</Card>
		</div>
	);
}
