import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, Col, Collapse, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image, Input, Table } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Pagination from "app/components/Pagination";
import queryString from "querystring";
import { InfoCircleOutlined } from "@ant-design/icons";
import ModalConfirm from "../dialogs/ModalConfirm";
import mutate_update_sme_warehouses_by_pk from "graphql/mutations/mutate_update_sme_warehouses_by_pk";
import { showAlert } from "utils/helper";
import mutate_userSetDefaultWarehouseByAgency from "graphql/mutations/mutate_userSetDefaultWarehouseByAgency";
import mutate_userEnableWarehouseByAgency from "graphql/mutations/mutate_userEnableWarehouseByAgency";
import mutate_userUpdateWarehouseByAgency from "graphql/mutations/mutate_userUpdateWarehouseByAgency";

const { Text } = Typography;
const { Search } = Input;

interface DialogConfirmType {
	isOpen?: boolean;
	idWh?: number;
	title?: string;
	isLocationManage?: boolean;
	type?: string;
}

const WarehouseListTable = ({ dataWarehouse, error, loading, refetch }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const [dialogConfirm, setDialogConfirm] = useState<DialogConfirmType>({});
	const params = queryString.parse(location.search.slice(1, 100000)) as any;

	//Mutation go here
	const [mutateUpdateWarehouse, { loading: loadingUpdateWarehouse }] = useMutation(mutate_userUpdateWarehouseByAgency, {
		awaitRefetchQueries: true,
		refetchQueries: ["smeWarehouseByAgency"],
	});
	const [mutateDefaultWarehouse, { loading: loadingSetWhDefault }] = useMutation(mutate_userSetDefaultWarehouseByAgency, {
		awaitRefetchQueries: true,
	});

	const [mutateEnableWarehouse, { loading: loadingEnableWh }] = useMutation(mutate_userEnableWarehouseByAgency, {
		awaitRefetchQueries: true,
		refetchQueries: ["smeWarehouseByAgency"],
	});

	const page = useMemo(() => {
		try {
			let _page = Number(params.page);
			if (!Number.isNaN(_page)) {
				return Math.max(1, _page);
			} else {
				return 1;
			}
		} catch (error) {
			return 1;
		}
	}, [params.page]);

	const limit = useMemo(() => {
		try {
			let _value = Number(params.limit);
			if (!Number.isNaN(_value)) {
				return Math.max(25, _value);
			} else {
				return 25;
			}
		} catch (error) {
			return 25;
		}
	}, [params.limit]);

	const setDefaultWarehouse = useCallback(async () => {
		setDialogConfirm({});
		const { data } = await mutateDefaultWarehouse({
			variables: {
				id: dialogConfirm.idWh,
			},
		});
		if (data?.userSetDefaultWarehouseByAgency?.success) {
			showAlert.success(data?.userSetDefaultWarehouseByAgency?.message);
			refetch();
			return;
		} else {
			showAlert.error(data?.userSetDefaultWarehouseByAgency?.message || "Có lỗi xảy ra");
		}
	}, [dialogConfirm.idWh]);

	const setIsLocationManage = useCallback(async () => {
		setDialogConfirm({});
		const { data } = await mutateUpdateWarehouse({
			variables: {
				userUpdateWarehouseInput: {
					id: dialogConfirm.idWh,
					is_location_manage: dialogConfirm?.isLocationManage,
				},
			},
		});
		if (data?.userUpdateWarehouseByAgency?.success) {
			showAlert.success(data?.userUpdateWarehouseByAgency?.message);
			return;
		} else {
			showAlert.error(data?.userUpdateWarehouseByAgency?.message || "Có lỗi xảy ra");
		}
	}, [dialogConfirm.idWh]);

	const totalRecord = dataWarehouse?.smeWarehouseByAgency?.meta?.total || 0;
	let totalPage = Math.ceil(totalRecord / limit);
	const columns = [
		{
			title: "Tên kho",
			dataIndex: "name",
			key: "name",
			width: 200,
			render: (_item, record) => {
				return (
					<Flex vertical>
						{record?.name}
						<Flex align="center">
							<Text style={{ color: "gray" }}>Mã kho: {record?.code} </Text>
						</Flex>
					</Flex>
				);
			},
		},
		{
			title: "Địa chỉ",
			dataIndex: "address",
			key: "address",
			width: 400,
			render: (item, record) => {
				return <Text>{record?.address || "--"}</Text>;
			},
		},
		{
			title: "Cấu hình",
			dataIndex: "setting",
			key: "setting",
			align: "center",
			width: 250,
			render: (item, record) => {
				return (
					<Flex vertical gap={10}>
						<Row gutter={10}>
							<Col span={14} style={{ display: "flex", justifyContent: "end", alignItems: "center", gap: 10 }}>
								<Text>Kho mặc định</Text>
								<Tooltip title="Khi phát sinh đơn hàng, hệ thống sẽ thực hiện trừ tồn ở kho mặc định.">
									<InfoCircleOutlined />
								</Tooltip>
							</Col>
							<Col span={10}>
								<Switch
									checked={!!record?.is_default}
									disabled={!!record?.is_default || record?.status == 0}
									onChange={(value) => {
										setDialogConfirm({
											isOpen: true,
											type: "setDefaultWarehouse",
											idWh: record?.id,
											title: "Chú ý: Bạn chỉ có thể chọn một kho mặc định tại một thời điểm. Khi bạn chọn một kho mới, kho mặc định trước đó sẽ tự động bị tắt.",
										});
									}}
								/>
							</Col>
						</Row>
						<Row gutter={10}>
							<Col span={14} style={{ display: "flex", justifyContent: "end", alignItems: "center", gap: 10 }}>
								<Text>Quản lý vị trí</Text>
								<Tooltip title="Bật để cấu hình và quản lý vị trí trong kho">
									<InfoCircleOutlined />
								</Tooltip>
							</Col>
							<Col span={10}>
								<Switch
									checked={!!record?.is_location_manage}
									onChange={(value) => {
										setDialogConfirm({
											isOpen: true,
											type: "setIsLocationManage",
											idWh: record?.id,
											title: !!record?.is_location_manage
												? `Hệ thống sẽ dừng chạy luồng xử lý tồn kho theo luồng quản lý vị trí. Bạn có đồng ý tắt quản lý theo vị trí cho kho ${record?.name}?`
												: `Hệ thống sẽ chạy luồng xử lý tồn kho theo luồng quản lý vị trí. Bạn có đồng ý bật quản lý theo vị trí cho kho ${record?.name}?`,
											isLocationManage: !!record?.is_location_manage ? false : true,
										});
									}}
								/>
							</Col>
						</Row>
					</Flex>
				);
			},
		},
		{
			title: "Trạng thái hoạt động",
			dataIndex: "status",
			align: "center",
			key: "status",
			width: 200,
			render: (item, record) => {
				return (
					<>
						<Switch
							checked={record?.status == 10}
							disabled={record?.is_default}
							onChange={async () => {
								const { data } = await mutateEnableWarehouse({
									variables: {
										id: record?.id,
										isEnable: record?.status == 10 ? false : true,
									},
								});
								if (!!data?.userEnableWarehouseByAgency?.success) {
									showAlert.success("Cập nhật trạng thái kho thành công");
								} else {
									showAlert.error(data?.userEnableWarehouseByAgency?.message);
								}
							}}
						/>
					</>
				);
			},
		},
		{
			title: "Thao tác",
			dataIndex: "action",
			align: "center",
			key: "action",
			width: 200,
			render: (item, record) => {
				return (
					<Button
						type="primary"
						className="btn-base"
						onClick={() => {
							navigate(`${location.pathname}/${record?.id}`);
						}}
					>
						Cập nhật
					</Button>
				);
			},
		},
	];
	return (
		<>
			{!!dialogConfirm?.isOpen && (
				<ModalConfirm
					title={dialogConfirm?.title || ""}
					onHide={() => setDialogConfirm({})}
					onConfirm={dialogConfirm?.type == "setDefaultWarehouse" ? setDefaultWarehouse : setIsLocationManage}
				/>
			)}
			<Table
				className="ant-upbase"
				dataSource={dataWarehouse?.smeWarehouseByAgency?.data || []}
				loading={loading || loadingEnableWh || loadingSetWhDefault || loadingUpdateWarehouse}
				columns={columns as any}
				scroll={{ x: "max-content" }}
				bordered
				pagination={false}
			/>
			{!error && (
				<Pagination
					page={page}
					totalPage={totalPage}
					loading={loading}
					limit={limit}
					totalRecord={totalRecord}
					count={dataWarehouse?.smeWarehouseByAgency?.data?.length}
					basePath={location.pathname}
					emptyTitle={"Không có dữ liệu"}
					options={[
						{ label: 25, value: 25 },
						{ label: 50, value: 50 },
						{ label: 100, value: 100 },
					]}
				/>
			)}
		</>
	);
};

export default WarehouseListTable;
