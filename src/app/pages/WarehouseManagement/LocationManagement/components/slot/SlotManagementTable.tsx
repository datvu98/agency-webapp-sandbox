import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Flex, Space, Spin, Table, Tooltip, Typography } from "antd";
import { MenuProps } from "antd/lib/menu";
import Pagination from "app/components/Pagination";
import dayjs from "dayjs";
import _ from "lodash";
import queryString from "querystring";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { showAlert } from "utils/helper";
import ModalDetailStock from "../../dialogs/slot/ModalDetailStock";
// import RackManagementRow from "./RackManagementRow";
const { Text } = Typography;

const SlotManagementTable = ({ locationManagerUpdate, setShowDetail, data, loading, error, refetch }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const params = queryString.parse(location.search.slice(1, 100000));
	const [showDetailStock, setShowDetailStock] = useState<any>(null);

	const columns = [
		{
			title: "Mã vị trí",
			dataIndex: "code",
			key: "code",
			width: 150,
			render: (_item, record) => {
				return <Text>{record?.code}</Text>;
			},
		},
		{
			title: "Tên vị trí",
			dataIndex: "name",
			key: "name",
			width: 150,
			render: (_item, record) => {
				return <Text>{record?.name}</Text>;
			},
		},
		{
			title: "Trạng thái",
			dataIndex: "status",
			key: "status",
			width: 200,
			align: "center",
			render: (_item, record) => {
				return <Text style={{ color: !!record?.isActive ? "#52c41a" : "#ff4d4f" }}>{!!record?.isActive ? "Hoạt động" : "Dừng hoạt động"}</Text>;
			},
		},
		{
			title: "Trạng thái chứa",
			dataIndex: "usage_status",
			key: "usage_status",
			width: 200,
			align: "center",
			render: (_item, record) => {
				return <Text>{record?.storageEquipment?.usageCapacityRatio < 100 ? "Còn trống" : "Đã đầy"}</Text>;
			},
		},
		{
			title: "Tỷ lệ chứa",
			dataIndex: "usage_ratio",
			key: "usage_ratio",
			width: 200,
			align: "center",
			render: (_item, record) => {
				return (
					<Text
						style={{ color: record?.storageEquipment?.usageCapacityRatio < 100 ? "#52c41a" : "#ff4d4f", cursor: "pointer" }}
						onClick={() => {
							setShowDetailStock({
								show: true,
								location: record,
							});
						}}
					>
						{`${record?.storageEquipment?.usageCapacityRatio}%`}
					</Text>
				);
			},
		},

		{
			title: "Mã khu vực",
			dataIndex: "area_code",
			key: "area_code",
			width: 150,
			render: (_item, record) => {
				return <Text>{record?.area?.code}</Text>;
			},
		},
		{
			title: "Mã kệ",
			dataIndex: "rack_code",
			key: "rack_code",
			width: 150,
			render: (_item, record) => {
				return <Text>{record?.rack?.code}</Text>;
			},
		},
		{
			title: "Tầng",
			dataIndex: "level_code",
			key: "level_code",
			width: 150,
			render: (_item, record) => {
				return <Text>{record?.level?.code}</Text>;
			},
		},
		{
			title: "Mức độ ưu tiên",
			dataIndex: "priority",
			key: "priority",
			width: 200,
			align: "center",
			render: (_item, record) => {
				return <Text>{record?.priority}</Text>;
			},
		},
		{
			title: "Thời gian",
			dataIndex: "time",
			key: "time",
			width: 200,
			align: "center",
			render: (_item, record) => {
				return (
					<Tooltip
						placement="bottom"
						title={
							<Flex gap={5} vertical>
								<Text style={{ color: "#fff" }}>Thời gian tạo: {dayjs(record?.createdAt).format("DD/MM/YYYY HH:mm")}</Text>
								<Text style={{ color: "#fff" }}>Thời gian cập nhật: {dayjs(record?.updatedAt).format("DD/MM/YYYY HH:mm")}</Text>
							</Flex>
						}
					>
						<Text className="color-base cursor-pointer">Xem chi tiết</Text>
					</Tooltip>
				);
			},
		},
		{
			title: "Thao tác",
			dataIndex: "action",
			key: "action",
			width: 150,
			align: "center",
			render: (_item, record) => {
				const handleMenuClick: MenuProps["onClick"] = async ({ key }) => {
					try {
						switch (key) {
							case "edit":
								setShowDetail({
									type: "slot",
									dataDetail: record,
								});
								break;

							case "inactive":
								let { data: dataInactive } = await locationManagerUpdate({
									variables: {
										updated: {
											id: record?.id,
											isActive: false,
										},
									},
								});
								if (dataInactive?.locationManagerUpdate?.success) {
									showAlert.success("Dừng hoạt động vị trí lưu kho thành công.");
								} else {
									showAlert.error(dataInactive?.locationManagerUpdate?.message || "Dừng hoạt động vị trí lưu kho thất bại.");
								}
								break;

							case "active":
								let { data: dataActive } = await locationManagerUpdate({
									variables: {
										updated: {
											id: record?.id,
											isActive: true,
										},
									},
								});
								if (dataActive?.locationManagerUpdate?.success) {
									showAlert.success("Bật hoạt động vị trí lưu kho thành công.");
								} else {
									showAlert.error(dataActive?.locationManagerUpdate?.message || "Bật hoạt động vị trí lưu kho thất bại.");
								}
								break;
							default:
								break;
						}
					} catch (err) {
						console.error("Thao tác thất bại:", err);
					}
				};
				const items: MenuProps["items"] = [
					{
						label: "Chỉnh sửa",
						key: "edit",
					},
					{
						label: "Dừng hoạt động",
						key: "inactive",
						disabled: !record.isActive,
					},
					{
						label: "Bật hoạt động",
						key: "active",
						disabled: !!record.isActive,
					},
				];
				const menuProps = {
					items,
					onClick: handleMenuClick,
				};
				return (
					<Dropdown menu={menuProps}>
						<Button className="btn-base color-base">
							<Flex align="center" gap={4} justify="center">
								<Text className="color-base">Chọn</Text>
								<DownOutlined style={{ fontSize: 10 }} />
							</Flex>
						</Button>
					</Dropdown>
				);
			},
		},
	];

	return (
		<Spin spinning={false}>
			{showDetailStock?.show && <ModalDetailStock show={showDetailStock?.show} onHide={() => setShowDetailStock(null)} location={showDetailStock?.location} />}
			<Table
				className="setting-table ant-upbase"
				dataSource={data?.locationManagerList?.data || []}
				columns={columns as any}
				bordered
				tableLayout="auto"
				sticky={{ offsetHeader: 0 }}
				scroll={{ x: "max-content" }}
				pagination={false}
			/>
			{!error && !loading && (
				<Pagination
					page={data?.locationManagerList?.meta?.pageNumber}
					totalPage={data?.locationManagerList?.meta?.totalPages}
					loading={loading}
					limit={data?.locationManagerList?.meta?.pageSize}
					totalRecord={data?.locationManagerList?.meta?.totalItems}
					count={data?.locationManagerList?.data?.length}
					basePath={location.pathname}
					emptyTitle={"Chưa có vị trí lưu kho"}
					options={[
						{ label: 25, value: 25 },
						{ label: 50, value: 50 },
						{ label: 100, value: 100 },
					]}
				/>
			)}
		</Spin>
	);
};

export default SlotManagementTable;
