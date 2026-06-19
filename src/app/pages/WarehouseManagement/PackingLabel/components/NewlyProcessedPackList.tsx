import { DownOutlined } from "@ant-design/icons";
import { useLazyQuery } from "@apollo/client";
import { Button, Dropdown, Flex, Space, Spin, Table, Tooltip, Typography } from "antd";
import { MenuProps } from "antd/lib/menu";
import Pagination from "app/components/Pagination";
import { selectGlobalSlice } from "app/slice/selectors";
import dayjs from "dayjs";
import query_warehouseBillPrintLabel from "graphql/queries/query_warehouseBillPrintLabel";
import _ from "lodash";
import queryString from "querystring";
import React from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { printFromS3, showAlert } from "utils/helper";
const { Text } = Typography;

const NewlyProcessedPackList = ({ data, loading, error, dataPagination, optionBrands }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const { user } = useSelector(selectGlobalSlice);

	const [warehouseBillPrintLabel, { loading: loadingWarehouseBillPrintLabel  }] = useLazyQuery(query_warehouseBillPrintLabel, {
		fetchPolicy: "network-only",
	});
	const columns = [
		{
			title: "Mã phiếu xuất",
			dataIndex: "code",
			key: "code",
			width: 150,
			render: (_item, record) => {
				return (
					<Text className="cursor-pointer" onClick={() => {
						navigate(`/${user?.category_code == 'fulfillment' ? "outbound-manage" : 'warehouse-manage'}/warehouse-bill-out/${record?.warehouseBill?.id}`)
					}}>
						{record?.warehouseBill?.code}
					</Text>
				);
			},
		},
		{
			title: "Mã đơn hàng",
			dataIndex: "orderCode",
			key: "orderCode",
			width: 200,
			render: (_item, record) => {
				return <Text>{record?.warehouseBill?.orderCode}</Text>;
			},
		},
		{
			title: "Thời gian đóng gói",
			dataIndex: "packedAt",
			key: "packedAt",
			width: 200,
			align: "center",
			render: (_item, record) => {
				return <Text>{record?.packedAt ? dayjs(record?.packedAt).format("DD/MM/YYYY HH:mm") : '--'}</Text>;
			},
		},
		{
			title: "Nhãn hàng",
			dataIndex: "brand",
			key: "brand",
			width: 200,
			align: "center",
			render: (_item, record) => {
				const brand = optionBrands?.find(opt => opt?.value == record?.warehouseBill?.brandId)
				return <Text>{brand?.label}</Text>;
			},
		},
		{
			title: "Thao tác",
			dataIndex: "action",
			key: "action",
			width: 150,
			align: "center",
			render: (_item, record) => {
				return (
					<Text className="color-base cursor-pointer" onClick={async () => {
						// let {data} = await warehouseBillPrintLabel({
						// 	variables: {
						// 		id: Number(record?.warehouseBill?.id)
						// 	}
						// })
						// if (data?.warehouseBillPrintLabel?.success) {
						// 	window.open(data?.warehouseBillPrintLabel?.data)
						// } else {
						// 	showAlert.error(data?.warehouseBillPrintLabel?.message || 'In vận đơn thất bại')
						// }
						if (!record?.warehouseBill?.labelUrl) {
							showAlert.error('Đơn chưa có vận đơn sàn, Thử lại sau.')
						} else {
							printFromS3(record?.warehouseBill?.labelUrl)

						}
					}}>
						In vận đơn
					</Text>
				);
			},
		},
	];

	return (
		<Spin spinning={loadingWarehouseBillPrintLabel}>
			<Text strong>Đơn hàng cần in lại vận đơn</Text>
			<Table
				style={{ marginTop: 20 }}
				className="setting-table ant-upbase"
				dataSource={data || []}
				columns={columns as any}
				bordered
				tableLayout="auto"
				sticky={{ offsetHeader: 0 }}
				scroll={{ x: "max-content" }}
				pagination={false}
			/>
			{!error && !loading && (
				<Pagination
					page={dataPagination?.pageNumber}
					totalPage={dataPagination?.totalPages}
					loading={loading}
					limit={dataPagination?.pageSize}
					totalRecord={dataPagination?.totalItems}
					count={data?.length}
					basePath={location.pathname}
					emptyTitle={"Chưa có thông tin"}
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

export default NewlyProcessedPackList;
