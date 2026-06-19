import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, Col, Collapse, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image, Tag, Tabs, Dropdown, Select, Table } from "antd";
import React, { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import queryString from "querystring";
import { PackStatusName, STATUS_BILL_OUT, SUB_TABS } from "../constants";
import { omit } from "lodash";
import { DownOutlined } from "@ant-design/icons";
import Pagination from "app/components/Pagination";
import query_processingListItemListWithPagination from "graphql/queries/query_processingListItemListWithPagination";
import client from "apollo";
import query_warehouseBillListWithPagination from "graphql/queries/query_warehouseBillListWithPagination";
import { AlignType } from "rc-table/lib/interface";
import ModalDetailLocationWhBill from "../dialogs/ModalDetailLocationWhBill";

const { Text, Paragraph } = Typography;

const queryWarehouseBillList = async (ids) => {
	if (ids?.length == 0) return [];

	const { data } = await client.query({
		query: query_warehouseBillListWithPagination,
		variables: {
			where: {
				id: { _in: ids },
			},
		},
		fetchPolicy: "network-only",
	});

	return data?.warehouseBillListWithPagination?.data || [];
};

const OutboundTable = ({generalData}) => {
	const { id } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const params = queryString.parse(location.search.slice(1, 100000)) as any;
	const [ids, setIds] = useState<any>([]);
	const [dataTable, setDataTable] = useState([]);
	const [showDetailLocation, setShowDetailLocation] = useState({
		show: false,
		id: 0,
		warehouseBillId: ""
	});
	console.log(generalData)
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
	}, [params?.limit]);

	let {
		data: processingListItemListWithPagination,
		loading,
		error,
	} = useQuery(query_processingListItemListWithPagination, {
		variables: {
			limit,
			offset: (page - 1) * limit,
			where: {
				processingListId: {
					_eq: Number(id),
				},
			},
		},
		fetchPolicy: "cache-and-network",
		onCompleted: async (data) => {
			let warehouseBillList = await queryWarehouseBillList(data?.processingListItemListWithPagination?.data?.map((item) => item?.warehouseBillId));
			let mergeData = data?.processingListItemListWithPagination?.data?.map((item) => {
				let warehouseBill = warehouseBillList?.find((bill) => bill?.id == item?.warehouseBillId);
				return {
					...item,
					warehouseBill,
				};
			});
			setDataTable(mergeData);
		},
	});

	const totalRecord = processingListItemListWithPagination?.processingListItemListWithPagination?.meta?.totalItems || 0;
	const totalPage = Math.ceil(totalRecord / limit);
	const columns = [
		{
			title: "Mã phiếu",
			dataIndex: "code",
			key: "code",
			width: "25%",
			render: (_item, record) => {
				return (
					<Flex vertical>
						<Text>Mã phiếu xuất: {record?.warehouseBill?.code || "--"}</Text>
						<Text>Mã kiện hàng: {record?.warehouseBill?.systemPackageNumber || "--"}</Text>
					</Flex>
				);
			},
		},
		{
			title: "Vận chuyển",
			dataIndex: "tracking_no",
			key: "tracking_no",
			align: "center" as AlignType,
			width: "25%",
			render: (_item, record) => {
				return (
					<Flex vertical>
						<Text>ĐVVC: {record?.warehouseBill?.shippingCarrier || "--"}</Text>
						<Text>Mã vận đơn: {record?.warehouseBill?.shippingCode || "--"}</Text>
					</Flex>
				);
			},
		},
		{
			title: "Trạng thái phiếu",
			dataIndex: "status",
			key: "status",
			align: "center" as AlignType,
			width: "25%",
			render: (_item, record) => {
				const { status, pack_status } = PackStatusName(record?.warehouseBill?.packStatus, record?.warehouseBill?.orderStatus)
				console.log(record)
				return (
					<Flex vertical>
						<Text>Trạng thái xuất: {STATUS_BILL_OUT?.find(stt => stt?.value == record?.warehouseBill?.fulfillmentStatus)?.label || "--"}</Text>
						<Text>Trạng thái đơn: {status || "--"}</Text>
					</Flex>
				);
			},
		},
		{
			title: "Vị trí hiện tại",
			dataIndex: "location",
			key: "location",
			align: "center" as AlignType,
			width: "25%",
			render: (_item, record) => {
				return (['PICKING', 'PARTIALLY_PICKED', 'PICKED'].includes(generalData?.status) && <Text className="cursor-pointer color-base" onClick={() => {
					setShowDetailLocation({
						show: true,
						id: record?.processingListId,
						warehouseBillId: record?.warehouseBillId
					})
				}}>Xem vị trí</Text>)
			},
		},
	];
	// const rowSelection = useMemo(() => {
	// 	return {
	// 		selectedRowKeys: ids?.map((item) => item?.id),
	// 		onSelect: (record, selected) => {
	// 			if (!ids?.map((item) => item?.id)?.includes(record?.id)) {
	// 				setIds((prev) => [...prev, record]);
	// 			} else {
	// 				setIds((prev) => prev?.filter((st) => st?.id != record?.id));
	// 			}
	// 		},
	// 		onSelectAll: (selected, selectedRows, changeRows) => {
	// 			const changedRowIds = changeRows?.map((row) => row?.id) || [];
	// 			const prevSelectedIds = ids?.map((item) => item?.id) || [];
	// 			if (changedRowIds?.every((id) => prevSelectedIds?.includes(id))) {
	// 				const updated = ids.filter((store) => !dataTable?.map((item: any) => item?.id).includes(store?.id));
	// 				setIds(updated);
	// 			} else {
	// 				const updated = [...ids, ...changeRows];
	// 				setIds(updated);
	// 			}
	// 		},
	// 	};
	// }, [ids, dataTable]);
	return (
		<>
			{showDetailLocation?.show && <ModalDetailLocationWhBill
				show={showDetailLocation?.show}
				onHide={() => {
					setShowDetailLocation({
						show: false,
						id: 0,
						warehouseBillId: ''
					})
				}}
				dataInfo={{
					id: showDetailLocation?.id,
					warehouseBillId: showDetailLocation?.warehouseBillId
				}}
			/>}
			<Table
				className="upbase-table"
				style={{ marginTop: 10 }}
				dataSource={dataTable || []}
				loading={loading}
				columns={columns as any}
				// rowSelection={{
				// 	type: "checkbox",
				// 	...rowSelection,
				// }}
				bordered
				tableLayout="auto"
				rowKey={"id"}
				sticky={{ offsetHeader: 0 }}
				scroll={{ x: "max-content" }}
				pagination={false}
			/>
			{!error && (
				<Pagination
					page={page}
					totalPage={totalPage}
					limit={limit}
					totalRecord={totalRecord}
					count={dataTable?.length}
					basePath={location.pathname}
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

export default OutboundTable;
