import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Flex, Space, Spin, Table, Tooltip, Typography } from "antd";
import { MenuProps } from "antd/lib/menu";
import Pagination from "app/components/Pagination";
import dayjs from "dayjs";
import _ from "lodash";
import queryString from "querystring";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { showAlert } from "utils/helper";
import { OPTIONS_TYPE_EQUIPMENT } from "../../constants";
// import RackManagementRow from "./RackManagementRow";
const { Text } = Typography;

const StorageEquipmentTable = ({ storageEquipmentUpdate, setShowDetail, data, loading, error, refetch, dataWarehouse }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const params = queryString.parse(location.search.slice(1, 100000));
	const columns = [
		{
			title: "Mã thiết bị",
			dataIndex: "code",
			key: "code",
			width: 150,
			render: (_item, record) => {
				console.log(record);
				return <Text>{record?.code}</Text>;
			},
		},
		{
			title: "Loại thiết bị",
			dataIndex: "type",
			key: "type",
			width: 200,
			render: (_item, record) => {
				const containerType = OPTIONS_TYPE_EQUIPMENT?.find((item) => item?.value == record?.containerType);
				return <Text>{containerType?.label}</Text>;
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
			title: "Số lượng",
			dataIndex: "usageCapacity",
			key: "usageCapacity",
			width: 200,
			align: "center",
			render: (_item, record) => {
				return <Text className="color-base">{record?.usageCapacity}</Text>;
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
			title: "Kho",
			dataIndex: "warehouse",
			key: "warehouse",
			width: 200,
			align: "center",
			render: (_item, record) => {
				let currentWh = dataWarehouse?.smeWarehouseByAgency?.data?.find((wh) => wh?.id == record?.warehouseId);
				return <Text>{currentWh?.name}</Text>;
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
									type: "storage",
									dataDetail: record,
								});
								break;

							case "inactive":
								let { data: dataInactive } = await storageEquipmentUpdate({
									variables: {
										updated: {
											id: record?.id,
											isActive: false,
										},
									},
								});
								if (dataInactive?.storageEquipmentUpdate?.success) {
									showAlert.success("Dừng hoạt động thiết bị chứa thành công.");
								} else {
									showAlert.error(dataInactive?.storageEquipmentUpdate?.message || "Dừng hoạt động thiết bị chứa thất bại.");
								}
								break;

							case "active":
								let { data: dataActive } = await storageEquipmentUpdate({
									variables: {
										updated: {
											id: record?.id,
											isActive: true,
										},
									},
								});
								if (dataActive?.storageEquipmentUpdate?.success) {
									showAlert.success("Bật hoạt động thiết bị chứa thành công.");
								} else {
									showAlert.error(dataActive?.storageEquipmentUpdate?.message || "Bật hoạt động thiết bị chứa thất bại.");
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
			<Table
				className="setting-table ant-upbase"
				dataSource={data?.storageEquipmentList?.data || []}
				columns={columns as any}
				bordered
				tableLayout="auto"
				sticky={{ offsetHeader: 0 }}
				scroll={{ x: "max-content" }}
				pagination={false}
			/>
			{!error && !loading && (
				<Pagination
					page={data?.storageEquipmentList?.meta?.pageNumber}
					totalPage={data?.storageEquipmentList?.meta?.totalPages}
					loading={loading}
					limit={data?.storageEquipmentList?.meta?.pageSize}
					totalRecord={data?.storageEquipmentList?.meta?.totalItems}
					count={data?.storageEquipmentList?.data?.length}
					basePath={location.pathname}
					emptyTitle={"Chưa có thiết bị chứa"}
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

export default StorageEquipmentTable;
