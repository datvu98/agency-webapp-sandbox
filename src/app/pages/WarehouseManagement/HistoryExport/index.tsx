import { ArrowLeftOutlined } from "@ant-design/icons";
import { Card, Flex, Typography } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useState } from "react";
import { useLayoutEffect } from "react";
import { Helmet } from "react-helmet-async";
import TableInventory from "./components/TableInventory";
const { Text } = Typography;
const HistoryExport = () => {
	const { appendBreadcrumb } = useLayoutContext();

	useLayoutEffect(() => {
		appendBreadcrumb([
			{
				title: "Quản lý kho",
				pathname: "/warehouse-manage",
			},
			{
				title: "Lịch sử xuất tồn kho",
				pathname: "/history-export-product-stock",
			},
		]);
	}, []);
	return (
		<>
			<a href="/warehouse-manage/product-stock" className="mb-5" style={{ display: "block", marginBottom: 10 }}>
				<Flex align="center" gap={10}>
					<ArrowLeftOutlined className="color-base" />
					<Text className="color-base">Quay lại danh sách tồn kho</Text>
				</Flex>
			</a>
			<Helmet titleTemplate={"Lịch sử xuất tồn kho"} defaultTitle={"Lịch sử xuất tồn kho"}>
				<meta name="description" content={"Lịch sử xuất tồn kho"} />
			</Helmet>
			<Card>
				<Text style={{ fontStyle: "italic", color: " #3699ff", fontSize: 12, paddingLeft: 6 }}>Hệ thống chỉ lưu trữ dữ liệu file tải xuống trong vòng 7 ngày gần nhất.</Text>
				<TableInventory />
			</Card>
		</>
	);
};

export default HistoryExport;
