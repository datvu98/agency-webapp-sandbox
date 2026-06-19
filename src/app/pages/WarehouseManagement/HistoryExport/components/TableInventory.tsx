import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import queryString from "querystring";
import Pagination from "../../../../components/Pagination";
import dayjs from "dayjs";
import query_smeWarehouse from "graphql/queries/query_smeWarehouse";
import query_agency_inventory_item_export_history from "graphql/queries/query_agency_inventory_item_export_history";
import { Button, Flex, Spin, Table, Typography } from "antd";
import { formatNumberToCurrency, showAlert } from "utils/helper";
import { DownloadOutlined } from "@ant-design/icons";
import mutate_agencyRetryExportInventoryItems from "graphql/mutations/mutate_agencyRetryExportInventoryItems";
import query_agencyGetSme from "graphql/queries/query_agencyGetSme";
const { Text } = Typography;
const TableInventory = () => {
	const params = queryString.parse(useLocation().search.slice(1, 100000));
	const { data: dataWarehouse } = useQuery(query_smeWarehouse, {
		fetchPolicy: "cache-and-network",
	});
	const { data: dataSme, loading: loadingDataSme } = useQuery(query_agencyGetSme, {
		fetchPolicy: "cache-and-network",
	});
	const [timePoll, setTimePoll] = useState(1000);
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
	const { data, error, loading, refetch } = useQuery(query_agency_inventory_item_export_history, {
		variables: {
			limit,
			offset: (page - 1) * limit,
			where: {
				created_at: { _gt: dayjs().subtract(7, "day").format("YYYY/MM/DD") },
			},
			order_by: {
				created_at: "desc",
			},
		},
		fetchPolicy: "cache-and-network",
		pollInterval: timePoll,
	});

	const [agencyRetryExportInventoryItems, { loading: loadingRetry }] = useMutation(mutate_agencyRetryExportInventoryItems);
	useMemo(() => {
		const WAITING_STATUS = ["processing", "pending"];
		const status = data?.agency_inventory_item_export_history?.map((item) => item.status) || [];
		!!status?.find((stt) => WAITING_STATUS?.includes(stt)) ? setTimePoll(1000) : setTimePoll(0);
	}, [data]);

	let totalRecord = data?.agency_inventory_item_export_history_aggregate?.aggregate?.count || 0;
	let totalPage = Math.ceil(totalRecord / limit);
	const getUpS = (id) => {
		const inventory_export_item = data?.agency_inventory_item_export_history?.find((_item) => _item?.id == id);
		const sme_export_inventory = inventory_export_item?.filter?.smeIds;
		if (!sme_export_inventory?.length) {
			return ["Tất cả"];
		}
		return dataSme?.agencyGetSme?.flatMap((sme) => {
			if (sme_export_inventory.includes(sme?.sme_id)) {
				return `${sme?.sme_id} - ${sme?.full_name}`;
			}
			return [];
		});
	};

	const getWarehouse = (id) => {
		const inventory_export_item = data?.agency_inventory_item_export_history?.find((_item) => _item?.id == id);
		const warehouse_export_inventory = inventory_export_item?.filter?.warehouseIds;
		if (!warehouse_export_inventory?.length) {
			return ["Tất cả"];
		}
		return dataWarehouse?.sme_warehouses?.flatMap((wh) => {
			if (warehouse_export_inventory.includes(wh?.id)) {
				return wh.name;
			}
			return [];
		});
	};
	const productStatus = (status) => {
		if (status == "stocking") {
			return "Còn hàng";
		}
		if (status == "out_stock") {
			return "Hết hàng";
		}
		if (status == "near_out_stock") {
			return "Sắp hết hàng";
		}
	};
	const returnStatus = (status) => {
		if (status == "processing") {
			return "Đang xử lý";
		}
		if (status == "completed") {
			return "Hoàn thành";
		}
		if (status == "failed") {
			return "Lỗi";
		}
		return "";
	};

	const columns = [
		{
			title: "UpS",
			dataIndex: "ups",
			key: "ups",
			width: 150,
			render: (_item, record) => {
				return (
					<Flex vertical>
						{getUpS(record?.id)?.map((sme) => (
							<Text>{sme}</Text>
						))}
					</Flex>
				);
			},
		},
		{
			title: "Kho hàng",
			dataIndex: "warehouse",
			key: "warehouse",
			width: 150,
			render: (_item, record) => {
				return (
					<Flex vertical>
						{getWarehouse(record?.id)?.map((wh) => (
							<Text>{wh}</Text>
						))}
					</Flex>
				);
			},
		},
		{
			title: "Trạng thái",
			dataIndex: "product_status",
			key: "product_status",
			width: 200,
			align: "center",
			render: (_item, record) => {
				return record?.filter?.status ? <Flex vertical>{productStatus(record?.filter?.status)}</Flex> : "Tất cả";
			},
		},
		{
			title: "Số lượng hàng hoá",
			dataIndex: "quantity",
			key: "quantity",
			width: 200,
			align: "center",
			render: (_item, record) => {
				return <Text>{formatNumberToCurrency(record?.total_records)}</Text>;
			},
		},
		{
			title: "Thời gian yêu cầu",
			dataIndex: "time",
			key: "time",
			width: 200,
			align: "center",
			render: (_item, record) => {
				return <Text>{record?.created_at ? dayjs(record?.created_at).add(7, "hour").format("DD/MM/YYYY HH:mm") : "--"}</Text>;
			},
		},
		{
			title: "Tình trạng xử lý",
			dataIndex: "status",
			key: "status",
			width: 200,
			align: "center",
			render: (_item, record) => {
				return <Text>{returnStatus(record?.status)}</Text>;
			},
		},
		{
			title: "Thao tác",
			dataIndex: "action",
			key: "action",
			width: 150,
			align: "center",
			render: (_item, record) => {
				return record.status == "failed" ? (
					<Text
						className="color-base cursor-pointer"
						onClick={(e) => {
							e.preventDefault();
							agencyRetryExportInventoryItems({
								variables: {
									id: +record.id,
								},
								onCompleted: (data) => {
									if (data?.agencyRetryExportInventoryItems?.success) {
										refetch();
										showAlert.success(data?.agencyRetryExportInventoryItems?.message);
										return;
									}
									showAlert.error(data?.agencyRetryExportInventoryItems?.message);
								},
							});
						}}
					>
						Thử lại
					</Text>
				) : record?.status == "completed" ? (
					<Button
						type="primary"
						className="btn-base"
						onClick={() => {
							window.open(record?.file_path);
						}}
					>
						<DownloadOutlined /> Tải file
					</Button>
				) : (
					""
				);
			},
		},
	];
	return (
		<>
			<Spin spinning={false}>
				<Table
					className="setting-table ant-upbase"
					dataSource={data?.agency_inventory_item_export_history || []}
					columns={columns as any}
					bordered
					tableLayout="auto"
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
						count={data?.agency_inventory_item_export_history?.length}
						basePath={"/warehouse-manage/history-export-product-stock"}
						options={[
							{ label: 25, value: 25 },
							{ label: 50, value: 50 },
							{ label: 100, value: 100 },
						]}
					/>
				)}
			</Spin>
		</>
	);
};

export default TableInventory;
