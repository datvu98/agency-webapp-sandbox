import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, Col, Collapse, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image, Tag, Tabs, Dropdown, Select, Table } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useMemo, useState } from "react";
import { showAlert } from "utils/helper";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import queryString from "querystring";
import dayjs from "dayjs";
import { SUB_TABS } from "../constants";
import { omit } from "lodash";
import { DownOutlined } from "@ant-design/icons";
import Pagination from "app/components/Pagination";
import query_processingListItemListWithPagination from "graphql/queries/query_processingListItemListWithPagination";
import client from "apollo";
import query_warehouseBillListWithPagination from "graphql/queries/query_warehouseBillListWithPagination";
import { AlignType } from "rc-table/lib/interface";
import query_store_channel from "graphql/queries/query_store_channel";
import query_pickingListItemListWithPagination from "graphql/queries/query_pickingListItemListWithPagination";
import query_sme_catalog_product_variant from "graphql/queries/query_sme_catalog_product_variant";
import ModalDetailLocation from "../dialogs/ModalDetailLocation";

const { Text, Paragraph } = Typography;

const queryGetSmeProductVariants = async (ids) => {
	if (!ids?.length) return [];

	const { data } = await client.query({
		query: query_sme_catalog_product_variant,
		variables: { where: { id: { _in: ids } } },
		fetchPolicy: "network-only",
	});

	return data?.sme_catalog_product_variant || [];
};

const VariantTable = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const params = queryString.parse(location.search.slice(1, 100000)) as any;
	const [dataTable, setDataTable] = useState([]);
	const [showDetailLocation, setShowDetailLocation] = useState({
		show: false,
		id: 0,
		variantId: "",
		sku: '',
		variantFullName: ''
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
	}, [params?.limit]);

	let {
		data: pickingListItemListWithPagination,
		loading,
		error,
	} = useQuery(query_pickingListItemListWithPagination, {
		variables: {
			limit,
			offset: (page - 1) * limit,
			where: {
				pickingList: {
					processingListId: {
						_eq: Number(id),
					},
				},
			},
		},
		fetchPolicy: "cache-and-network",
		onCompleted: async (data) => {
			console.log(data);
			let variantList = await queryGetSmeProductVariants(data?.pickingListItemListWithPagination?.data?.map((item) => item?.variantId));
			let mergeData = data?.pickingListItemListWithPagination?.data?.map((item) => {
				let variant = variantList?.find((bill) => bill?.id == item?.variantId);
				return {
					...item,
					variant,
				};
			});
			setDataTable(mergeData);
		},
	});

	const totalRecord = pickingListItemListWithPagination?.pickingListItemListWithPagination?.meta?.totalItems || 0;
	const totalPage = Math.ceil(totalRecord / limit);
	const columns = [
		{
			title: "Tên hàng hoá kho",
			dataIndex: "name",
			key: "name",
			width: "20%",
			render: (_item, record) => {
				return (
					<Flex gap={4} align="center">
						<Image height={30} width={30} preview={false} src={record?.variant?.sme_catalog_product_variant_assets?.[0]?.asset_url || ""} style={{ borderRadius: 8 }} />
						<Tooltip title={record?.variant?.variant_full_name}>
							<Paragraph ellipsis={{ rows: 1 }} style={{ marginBottom: 0 }}>
								{record?.variant?.variant_full_name}
							</Paragraph>
						</Tooltip>
					</Flex>
				);
			},
		},
		{
			title: "SKU",
			dataIndex: "sku",
			key: "sku",
			width: "20%",
			render: (_item, record) => {
				return (
					<Tooltip title={record?.variant?.sku || "--"}>
						<Paragraph ellipsis={{ rows: 1 }} style={{ marginBottom: 0 }}>
							{record?.variant?.sku || "--"}
						</Paragraph>
					</Tooltip>
				);
			},
		},
		{
			title: "Số lượng",
			dataIndex: "quantity",
			key: "quantity",
			align: "center" as AlignType,
			width: "20%",
			render: (_item, record) => {
				return (
					<Flex justify="center">
						<Text style={{ color: record?.quantityPicked < record?.quantityNeeded ? "red" : "green" }}>{record?.quantityPicked || "--"} </Text>
						<Text>| {record?.quantityNeeded || "--"}</Text>
					</Flex>
				);
			},
		},
		{
			title: "Đơn vị tính",
			dataIndex: "unit",
			key: "unit",
			align: "center" as AlignType,
			width: "20%",
			render: (_item, record) => {
				return <>{record?.variant?.unit}</>;
			},
		},
		{
			title: "Vị trí",
			dataIndex: "location",
			key: "location",
			align: "center" as AlignType,
			width: "25%",
			render: (_item, record) => {
				return <Text className="cursor-pointer color-base" onClick={() => {
					setShowDetailLocation({
						show: true,
						id: record?.pickingListId,
						variantId: record?.variantId,
						sku: record?.variant?.sku,
						variantFullName: record?.variant?.variant_full_name
					})
				}}>Xem vị trí</Text>;
			},
		},
	];
	return (
		<>
			{showDetailLocation?.show && <ModalDetailLocation 
				show={showDetailLocation?.show}
				onHide={() => {
					setShowDetailLocation({
						show: false,
						id: 0,
						variantId: '',
						sku: '',
						variantFullName: ''
					})
				}}
				dataInfo={{
					id: showDetailLocation?.id,
					variantId: showDetailLocation?.variantId,
					sku: showDetailLocation?.sku,
					variantFullName: showDetailLocation?.variantFullName
				}}
			/>}
			<Table
				className="upbase-table"
				style={{ marginTop: 10 }}
				dataSource={dataTable || []}
				loading={loading}
				columns={columns as any}
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

export default VariantTable;
