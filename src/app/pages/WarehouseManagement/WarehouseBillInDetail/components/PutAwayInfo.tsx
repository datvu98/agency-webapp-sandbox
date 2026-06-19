import React, { useMemo, useState } from "react";
import { Col, Collapse, Flex, Row, Table, Tabs, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import query_workSessionWithPagination from "graphql/queries/query_workSessionWithPagination";
import { useQuery } from "@apollo/client";
import { formatNumberToCurrency } from "utils/helper";
import client from "apollo";
import query_storageEquipmentList from "graphql/queries/query_storageEquipmentList";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";

const { Text, Paragraph } = Typography;

const queryStorageEquipmentList = async (ids) => {
	if (ids?.length == 0) return [];

	const { data } = await client.query({
		query: query_storageEquipmentList,
		variables: {
			ids: ids,
		},
		fetchPolicy: "network-only",
	});

	return data?.storageEquipmentList?.data || [];
};

const PutAwayInfo = ({ dataDetail, optionSubUsers }) => {
	const { id } = useParams();
	const { user } = useSelector(selectGlobalSlice);
	const [dataList, setDataList] = useState<any>([]);

	const { data: dataPutAway, loading: loadingDataReceive } = useQuery(query_workSessionWithPagination, {
		variables: {
			where: {
				work: {
					target: {
						_eq: "WAREHOUSE_BILL",
					},
					targetId: {
						_eq: Number(id),
					},
					type: {
						_eq: "PUTAWAY",
					},
				},
			},
		},
		fetchPolicy: "cache-and-network",
		onCompleted: async (data) => {
			const storageEquipmentIds = data?.workSessionWithPagination?.data?.flatMap((workSession) => workSession?.devices?.map((device, index) => device?.storageEquipmentId));
			let storageEquipmentList = await queryStorageEquipmentList(storageEquipmentIds);
			const mergedData = data?.workSessionWithPagination?.data?.map((workSession) => {
				return {
					...workSession,
					devices: workSession?.devices?.map((device) => ({
						...device,
						storageEquipment: storageEquipmentList?.find((item) => item?.id == device?.storageEquipmentId),
					})),
				};
			});
			setDataList(mergedData);
		},
	});

	const flattenedData = dataList?.flatMap((workSession) =>
		workSession?.devices?.map((device, index) => ({
			...device,
			workSessionId: workSession?.id,
			deviceId: device?.id,
			_rowIndex: index,
			deviceLength: workSession?.devices?.length,
			createdAtWorkSS: workSession?.createdAt,
			endedAtWorkSS: workSession?.createdAt,
			picType: workSession?.picType,
			picId: workSession?.picId,
			totalVariants: workSession?.totalVariants,
			totalQuantity: workSession?.totalQuantity,
		}))
	);
	const columns = [
		{
			title: "Thời gian bắt đầu",
			dataIndex: "beginAt",
			key: "beginAt",
			width: 200,
			render: (_item, record, index) => {
				console.log(record)
				if (record?._rowIndex === 0) {
					return {
						children: <Text>{record?.createdAtWorkSS ? dayjs(record?.createdAtWorkSS).format("DD/MM/YYYY HH:mm") : "--"}</Text>,
						props: { rowSpan: record?.deviceLength },
					};
				} else {
					return { children: record?.createdAtWorkSS, props: { rowSpan: 0 } };
				}
			},
		},
		{
			title: "Thời gian kết thúc",
			dataIndex: "endAt",
			key: "endAt",
			width: 200,
			align: "center",
			render: (_item, record, index) => {
				if (record?._rowIndex === 0) {
					return {
						children: <Text>{record?.endedAtWorkSS ? dayjs(record?.endedAtWorkSS).format("DD/MM/YYYY HH:mm") : "--"}</Text>,
						props: { rowSpan: record?.deviceLength },
					};
				} else {
					return { children: record?.endedAtWorkSS, props: { rowSpan: 0 } };
				}
			},
		},
		{
			title: "Nhân viên nhận hàng",
			dataIndex: "staff",
			key: "staff",
			width: 200,
			align: "center",
			render: (_item, record, index) => {
				const isMainUser = !!record?.picType;
				let picName = "";
				if (!isMainUser) {
					picName = optionSubUsers?.find((item) => item?.value == record?.picId);
				} else {
					picName = user?.email;
				}
				if (record?._rowIndex === 0) {
					return {
						children: <Text>{picName}</Text>,
						props: { rowSpan: record?.deviceLength },
					};
				} else {
					return { children: picName, props: { rowSpan: 0 } };
				}
			},
		},
		{
			title: "Thiết bị chứa",
			dataIndex: "storeageEquipment",
			key: "storeageEquipment",
			width: 200,
			align: "center",
			render: (_item, record) => {
				return <Text>{record?.storageEquipment?.code || "--"}</Text>;
			},
		},
		{
			title: "Số lượng SKU hàng hoá",
			dataIndex: "variantQuantity",
			key: "variantQuantity",
			width: 200,
			align: "center",
			render: (_item, record) => {
				return <Text>{formatNumberToCurrency(record?.totalVariants || 0)}</Text>;
			},
		},
		{
			title: "Số lượng thực tế lưu kho",
			dataIndex: "quantity",
			key: "quantity",
			width: 200,
			align: "center",
			render: (_item, record) => {
				return <Text>{formatNumberToCurrency(record?.totalQuantity || 0)}</Text>;
			},
		},
	];
	return (
		<>
			<Table
				className="setting-table ant-upbase"
				dataSource={flattenedData}
				columns={columns as any}
				bordered
				tableLayout="auto"
				sticky={{ offsetHeader: 0 }}
				scroll={{ x: "max-content" }}
				pagination={false}
			/>
		</>
	);
};

export default PutAwayInfo;
