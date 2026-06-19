import { Button, Flex, Typography, Tabs, Dropdown, Table, Spin } from "antd";
import React, { useMemo, useState } from "react";
import { formatNumberToCurrency, showAlert } from "utils/helper";
import { useLocation, useNavigate } from "react-router-dom";
import { OPTIONS_TYPE_PICKUP, STATUS_PICKUP, TABS } from "../constants";
import { MenuProps } from "antd/lib/menu";
import { DownOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import Pagination from "app/components/Pagination";
import { useMutation } from "@apollo/client";
import mutate_processingListCancel from "graphql/mutations/mutate_processingListCancel";
import mutate_processingListCreatePickStep from "graphql/mutations/mutate_processingListCreatePickStep";
import ModalConfirm from "../dialogs/ModalConfirm";
import AssignPICDialog from "../dialogs/AssignPICDialog";
import _, { omit } from "lodash";
import queryString from 'querystring'

const { Text, Paragraph} = Typography;

const ProcessingListTable = ({ dataTable, refetch, error, dataPagination, optionPIC, optionsWarehouse, optionSmes, dataCount, ids, setIds }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const params = new URLSearchParams(location.search);
	const queryParams = Object.fromEntries(params.entries());
	const [showConfirm, setShowConfirm] = useState({
		show: false,
		id: null
	})
	const [showAssign, setShowAssign] = useState({
		show: false,
		id: null,
		type: ''
	})

	const [processingListCancel, {loading: loadingProcessingListCancel}] = useMutation(mutate_processingListCancel, {
		awaitRefetchQueries: true,
		refetchQueries: ['processingListListWithPagination', 'processingListStatusCount']
	})

	const [processingListCreatePickStep, {loading: loadingProcessingListCreatePickStep}] = useMutation(mutate_processingListCreatePickStep, {
		awaitRefetchQueries: true,
		refetchQueries: ['processingListListWithPagination', 'processingListStatusCount']
	})

	const page = useMemo(() => {
		try {
			let _page = Number(params.get("page"));
			if (!Number.isNaN(_page)) {
				return Math.max(1, _page);
			} else {
				return 1;
			}
		} catch (error) {
			return 1;
		}
	}, [params.get("page")]);

	const limit = useMemo(() => {
		try {
			let _value = Number(params.get("limit"));
			if (!Number.isNaN(_value)) {
				return Math.max(25, _value);
			} else {
				return 25;
			}
		} catch (error) {
			return 25;
		}
	}, [params.get("limit")]);

	const columns = [
		{
			title: "Mã danh sách",
			dataIndex: "code",
			key: "code",
			width: 150,
			render: (_item, record) => {
				return <Text>{record?.code}</Text>;
			},
		},
		{
			title: "Số lượng phiếu xuất",
			dataIndex: "quantity",
			key: "quantity",
			width: 200,
			align: "center",
			render: (_item, record) => {
				return <Text>{record?.totalItems}</Text>;
			},
		},
		{
			title: "Loại danh sách",
			dataIndex: "type",
			key: "type",
			width: 150,
			align: "center",
			render: (_item, record) => {
				return <Text>{OPTIONS_TYPE_PICKUP?.[record?.type]}</Text>;
			},
		},
		{
			title: "Trạng thái",
			dataIndex: "status",
			key: "status",
			width: 200,
			align: "center",
			render: (_item, record) => {
				let colorText = "#000";
				if (record?.status == 1) colorText = "#00DB6D";
				if (record?.status == 5) colorText = "#0D6EFD";
				if (record?.status == 4) colorText = "#F80D0D";

				return (
					<Text>
						<Text style={{ color: colorText }}>{STATUS_PICKUP?.[record?.status]}</Text>
						{record?.status == 3 && (
							<Text style={{ marginLeft: 4 }}>
								({record?.total_packaged}/<Text className="text-primary">{record?.totalItems}</Text>)
							</Text>
						)}
					</Text>
				);
			},
		},
		{
			title: "Nhân viên phụ trách",
			dataIndex: "staff",
			key: "staff",
			width: 200,
			align: "center",
			render: (_item, record) => {
				const subUser = optionPIC?.find((item) => {
					if (!Number(record?.picType)) {
						return item?.value == record?.picId
					}
					return item?.value?.includes('admin_')
				});
				return <Text>{subUser?.label || ""}</Text>;
			},
		},
		{
			title: "UpS",
			dataIndex: "ups",
			key: "ups",
			width: 200,
			align: "center",
			render: (_item, record) => {
				const listUpS = optionSmes?.filter((item) => record?.smeIds?.includes(item?.value));
				return (
					<Flex vertical align="center">
						{listUpS?.map((ups) => {
							return <Text>{ups?.label || ""}</Text>;
						})}
					</Flex>
				);
			},
		},
		{
			title: "Kho vật lý",
			dataIndex: "warehouse",
			key: "warehouse",
			width: 200,
			align: "center",
			render: (_item, record) => {
				const warehouse = optionsWarehouse?.find((item) => item?.value == record?.warehouseId);
				return <Text>{warehouse?.label || ""}</Text>;
			},
		},
		{
			title: "Thời gian tạo",
			dataIndex: "time",
			key: "time",
			width: 200,
			align: "center",
			render: (_item, record) => {
				return <Text>{dayjs(record?.createdAt).format("DD/MM/YYYY HH:mm")}</Text>;
			},
		},
		{
			title: "Ghi chú",
			dataIndex: "note",
			key: "note",
			width: 200,
			align: "center",
			render: (_item, record) => {
				return <Paragraph
				ellipsis={{ rows: 1, tooltip: record?.note }}
			>
				{record?.note}
			</Paragraph>
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
					if (key == "edit") {
						window.open(`${location.pathname}/${record?.id}`);
					}
					if (key == 'cancel') {
						setShowConfirm({
							show: true,
							id: record?.id
						})
					}
					if (key == 'assign') {
						setShowAssign({
							show: true,
							id: record?.id,
							type: 'assign'
						})
					}
					if (key == 'reAssign') {
						setShowAssign({
							show: true,
							id: record?.id,
							type: 'reAssign'
						})
					}
					if (key == 'create_pick_step') {
						let {data} = await processingListCreatePickStep({
							variables: {
								id: record?.id
							}
						})
						if (data?.processingListCreatePickStep?.success) {
							showAlert.success('Tạo lộ trình cho danh sách xử lý thành công')
						} else {
							showAlert.error(data?.processingListCreatePickStep?.message || 'Tạo lộ trình cho danh sách xử lý thất bại')
						}
					}
				};
				const items: any = [
					{
						label: "Xem chi tiết",
						key: "edit",
					},
					(record?.status == 'NEW' && {
						label: 'Tạo lộ trình',
						key: 'create_pick_step'
					}),
					(record?.status == 'PICK_STEP_CREATED' && {
						label: 'Phân công nhân viên',
						key: 'assign'
					}),
					(record?.status == 'READY_PICKUP' && {
						label: 'Phân công lại',
						key: 'reAssign'
					}),
					(['NEW', 'PICK_STEP_CREATED'].includes(record?.status) && {
						label: 'Huỷ',
						key: 'cancel'
					})
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

	let totalRecord = dataPagination?.totalItems || 0;
	let totalPage = Math.ceil(totalRecord / limit);
	const rowSelection = useMemo(() => {
			return {
				selectedRowKeys: ids?.map((item) => item?.id),
				onSelect: (record, selected) => {
					if (!ids?.map(item => item?.id)?.includes(record?.id)) {
						setIds((prev) => [...prev, record]);
					} else {
						setIds((prev) => prev?.filter((item) => item?.id != record?.id));
					}
				},
				onSelectAll: (selected, selectedRows, changeRows) => {
					const changedRowIds = changeRows?.map((row) => row?.id) || [];
					if (changedRowIds?.every((id) => ids?.map(item => item?.id)?.includes(id))) {
						const updated = ids.filter((item) => !dataTable?.map((item: any) => item?.id).includes(item?.id));
						setIds(updated);
					} else {
						const updated = [...ids, ...changeRows];
						setIds(updated);
					}
				},
			};
		}, [ids, dataTable]);
		console.log(ids)
	return (
		<Spin spinning={loadingProcessingListCancel || loadingProcessingListCreatePickStep}>
			{showConfirm?.show && <ModalConfirm 
				show={showConfirm?.show}
				onHide={() => {
					setShowConfirm({
						show: false,
						id: null
					})
				}}
				onConfirm={async () => {
					setShowConfirm(prev => ({
						...prev, 
						show: false
					}))
					let {data} = await processingListCancel({
						variables: {
							id: showConfirm?.id
						}
					})
					if (data?.processingListCancel?.success) {
						showAlert.success('Huỷ danh sách xử lý thành công')
					} else {
						showAlert.error(data?.processingListCancel?.message || 'Huỷ danh sách xử lý thất bại')
					}
					
				}}
			/>}
			{showAssign?.show && <AssignPICDialog 
				show={showAssign?.show}
				onHide={() => {
					setShowAssign({
						show: false,
						id: null,
						type: ''
					})
				}}
				type={showAssign?.type}
				id={showAssign?.id || 0}
				optionPIC={optionPIC}
			/>}
			<Tabs
				onChange={(key) => {
					navigate(`${location.pathname}?${queryString.stringify(omit({
						...queryParams,
						tab: key,
					}, ['page', 'limit']))}`);
				}}
				activeKey={params.get("tab") || "all"}
				items={TABS?.map((tab) => {
					if (tab?.key?.toLowerCase() == "all") {
						let total = dataCount?.processingListStatusCount?.data?.total;
						return {
							...tab,
							label: `${tab?.label} (${formatNumberToCurrency(total)})`,
						};
					}
					let total = dataCount?.processingListStatusCount?.data?.[`${_.camelCase(tab?.key)}`];
					return {
						...tab,
						label: `${tab?.label} (${formatNumberToCurrency(total)})`,
					};
				})}
			/>

			<Table
				className="setting-table ant-upbase"
				dataSource={dataTable || []}
				columns={columns as any}
				bordered
				tableLayout="auto"
				sticky={{ offsetHeader: 0 }}
				scroll={{ x: "max-content" }}
				pagination={false}
				rowSelection={rowSelection}
				rowKey="id"
			/>
			{!error && (
				<Pagination
					page={page}
					totalPage={totalPage}
					limit={limit}
					totalRecord={totalRecord}
					count={dataTable?.length}
					basePath={`${location.pathname}`}
					emptyTitle={"Không có dữ liệu"}
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

export default ProcessingListTable;
