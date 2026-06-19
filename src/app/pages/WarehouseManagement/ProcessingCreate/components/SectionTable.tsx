import React, { memo, useMemo, useState } from "react";
import { Card, Checkbox, Select, Row, Col, Tooltip, Spin, Empty, Typography, Flex, Table } from "antd";
import { OPTIONS_ORDER_BY } from "../constants";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import Pagination from "app/components/Pagination";
import PaginationModal from "app/components/PaginationModal";
import { useQuery } from "@apollo/client";
import query_warehouseBillListWithPagination from "graphql/queries/query_warehouseBillListWithPagination";

const { Text } = Typography;

const SectionTable = ({ filtersTable, updateFilter, ids, setIds, optionsChannel, optionsStore, optionsSmeWarehouse, data, loading, error, refetch }) => {
	const listPackages = data?.warehouseBillListWithPagination?.data || [];

	const totalRecord = data?.warehouseBillListWithPagination?.meta?.totalItems;
	const totalPage = Math.ceil(totalRecord / filtersTable?.limit);

	const rowSelection = useMemo(() => {
		return {
			selectedRowKeys: ids?.map((item) => item?.id),
			onSelect: (record, selected) => {
				if (!ids?.map((item) => item?.id)?.includes(record?.id)) {
					setIds((prev) => [...prev, record]);
				} else {
					setIds((prev) => prev?.filter((st) => st?.id != record?.id));
				}
			},
			onSelectAll: (selected, selectedRows, changeRows) => {
				const changedRowIds = changeRows?.map((row) => row?.id) || [];
				const prevSelectedIds = ids?.map((item) => item?.id) || [];
				if (changedRowIds?.every((id) => prevSelectedIds?.includes(id))) {
					const updated = ids.filter((store) => !listPackages?.map((item: any) => item?.id).includes(store?.id));
					setIds(updated);
				} else {
					const updated = [...ids, ...changeRows];
					setIds(updated);
				}
			},
		};
	}, [ids, listPackages]);
	const columns = [
		{
			title: "Thông tin phiếu",
			dataIndex: "product",
			width: "25%",
			render: (_, record) => {
				return (
					<Flex vertical>
						<Text>{record?.code}</Text>
						<Text>Mã đơn hàng: {record?.orderCode}</Text>
					</Flex>
				);
			},
		},

		{
			title: "Thời gian",
			width: "25%",
			render: (_, record) => {
				let tts_expired = record?.shipExpiredAt ? dayjs(record?.shipExpiredAt).unix() : record?.shipExpiredAt;
				return (
					<Flex vertical gap={5}>
						{tts_expired ? (
							tts_expired - dayjs().unix() > 0 ? (
								<Flex gap={4}>
									<Text>Hạn còn lại:</Text>
									<Text className="color-base">
										{Math.floor((tts_expired - dayjs().unix()) / 3600)} giờ {Math.floor(((tts_expired - dayjs().unix()) % 3600) / 60)} phút
									</Text>
								</Flex>
							) : (
								<Flex>
									<Text>Hạn còn lại:</Text>
									<Text className="color-base">Quá hạn</Text>
								</Flex>
							)
						) : (
							"--"
						)}
						<Text>Thời gian tạo phiếu: {dayjs(record?.createdAt).format("DD/MM/YYYY HH:mm")}</Text>
					</Flex>
				);
			},
		},

		{
			title: "Số lượng",
			width: "25%",
			render: (_, record) => {
				return (
					<Flex vertical>
						<Text>Số lượng hàng hoá: {record?.totalVariants}</Text>
						<Text>Số lượng xuất: {record?.totalQuantity}</Text>
					</Flex>
				);
			},
		},

		{
			title: "Thông tin vận đơn",
			width: "25%",
			render: (_, record) => {
				return (
					<Flex vertical>
						<Text>{record?.shippingCarrier}</Text>
						<Text>Mã vận đơn: {record?.trackingNumber}</Text>
					</Flex>
				);
			},
		},
	];

	return (
		<Card bodyStyle={{ padding: 0 }}>
			<Flex
				align="center"
				style={{
					position: "sticky",
					top: 45,
					background: "#fff",
					zIndex: 2,
					borderBottom: "1px solid #f0f0f0",
					padding: "10px 15px",
				}}
			>
				<Row style={{ width: "100%" }} align="middle">
					<Col span={10}>
						<Text className="color-base">{`Đã chọn: ${ids?.length} phiếu xuất`}</Text>
					</Col>
					<Col span={14} className="d-flex justify-content-end">
						<Flex align="center" justify="end">
							<Text style={{ width: 120, textAlign: "right", marginRight: 8 }}>Sắp xếp theo: </Text>

							<Select
								style={{ width: 220 }}
								value={filtersTable?.order_by}
								options={OPTIONS_ORDER_BY}
								onChange={(value) => {
									updateFilter({
										...filtersTable,
										sort: "desc",
										order_by: value,
									});
								}}
							/>

							<Flex
								align="center"
								justify="center"
								onClick={() => updateFilter({ ...filtersTable, sort: "desc" })}
								style={{
									width: 38,
									height: 38,
									cursor: "pointer",
									border: filtersTable?.sort === "desc" ? "1px solid #FE5629" : "1px solid #D9D9D9",
									borderRadius: 4,
									marginLeft: 4,
								}}
							>
								<ArrowDownOutlined />
							</Flex>

							<Flex
								align="center"
								justify="center"
								onClick={() => updateFilter({ ...filtersTable, sort: "asc" })}
								style={{
									width: 38,
									height: 38,
									cursor: "pointer",
									border: filtersTable?.sort === "asc" ? "1px solid #FE5629" : "1px solid #D9D9D9",
									borderRadius: 4,
									marginLeft: 4,
								}}
							>
								<ArrowUpOutlined />
							</Flex>
						</Flex>
					</Col>
				</Row>
			</Flex>
			<Table
				rowKey="id"
				dataSource={listPackages}
				columns={columns}
				rowSelection={rowSelection}
				pagination={false}
				loading={loading ? { indicator: <Spin /> } : false}
				locale={{
					emptyText: error ? <Empty description={"Xảy ra lỗi trong quá trình tải dữ liệu"} /> : <Empty description={"Không có dữ liệu"} />,
				}}
				scroll={{ y: 400 }}
				sticky
			/>
			{!error && !loading && (
				<PaginationModal
					page={filtersTable?.page}
					limit={filtersTable?.limit}
					totalPage={totalPage}
					totalRecord={totalRecord}
					count={listPackages?.length}
					onPanigate={(page) => {
						let newFilter = {
							...filtersTable,
							page,
						};
						updateFilter(newFilter);
					}}
					onSizePage={(limit) => {
						let newFilter = {
							...filtersTable,
							page: 1,
							limit,
						};
						updateFilter(newFilter);
					}}
					emptyTitle={"Chưa có dữ liệu phiếu xuất"}
				/>
			)}
		</Card>
	);
};

export default memo(SectionTable);
