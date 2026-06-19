import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Dropdown, Flex, Input, Row, Space, Spin, Table, Tooltip, Typography } from "antd";
import { MenuProps } from "antd/lib/menu";
import Pagination from "app/components/Pagination";
import dayjs from "dayjs";
import _ from "lodash";
import queryString from "querystring";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { formatNumberToCurrency, showAlert } from "utils/helper";
import { CONDITION_OPTIONS } from "../constants";
const { Text } = Typography;

const DetailTable = ({ dataTable, onPrint, dataDetail, onComplete }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const params = queryString.parse(location.search.slice(1, 100000));
	const [searchText, setSearchText] = useState(params?.q || '')
	const columns = [
		{
			title: "Mã phiếu xuất",
			dataIndex: "warehouseBillCode",
			key: "warehouseBillCode",
			width: 150,
			render: (_item, record) => {
				return (
					<Text className="cursor-pointer" onClick={() => {}}>
						{record?.warehouseBill?.code || '--'}
					</Text>
				);
			},
		},
		{
			title: "Mã kiện hàng",
			dataIndex: "packageNum",
			key: "packageNum",
			width: 200,
			render: (_item, record) => {
				return <Text>{record?.warehouseBill?.systemPackageNumber || '--'}</Text>;
			},
		},
		{
			title: "Mã vận đơn",
			dataIndex: "trackingNumber",
			key: "trackingNumber",
			width: 200,
			render: (_item, record) => {
				return <Text>{record?.warehouseBill?.trackingNumber || '--'}</Text>;
			},
		},
		{
			title: "Số lượng hàng hoá",
			dataIndex: "totalVariant",
			key: "totalVariant",
			width: 200,
			render: (_item, record) => {
				return <Text>{formatNumberToCurrency(record?.warehouseBill?.totalVariants)}</Text>;
			},
		},
		{
			title: "Số lượng",
			dataIndex: "quantity",
			key: "quantity",
			width: 200,
			render: (_item, record) => {
				return <Text>{formatNumberToCurrency(record?.warehouseBill?.totalQuantity)}</Text>;
			},
		},
		{
			title: "Tình trạng kiện",
			dataIndex: "condition",
			key: "condition",
			width: 200,
			render: (_item, record) => {
				const status = CONDITION_OPTIONS?.find(opt => opt?.key == record?.condition)
				return <Text>{status?.label}</Text>;
			},
		},
	];

	return (
		<Spin spinning={false}>
			<Flex gap={10} style={{marginBottom: 10}} justify="end">
				{/* <Input
					placeholder="Tìm kiếm mã kiện hàng/mã vận đơn"
					value={searchText}
					prefix={<SearchOutlined />}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						setSearchText(e.target.value);
					}}
					onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
						navigate(
							`${location.pathname}?${queryString.stringify({
								...params,
								page: 1,
								q: e.target.value,
							})}`
						);
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							const target = e.target as HTMLInputElement;
							navigate(
								`${location.pathname}?${queryString.stringify({
									...params,
									page: 1,
									q: target.value,
								})}`
							);
						}
					}}
					suffix={<i className="flaticon2-search-1 icon-md ml-6" />}
				/> */}
                <div>
                    <Button className="btn-base color-base" style={{width: '100%'}} onClick={onPrint}>
                        In biên bản BG
                    </Button>
                </div>
				{dataDetail?.status != 'COMPLETED' && <Button type="primary" className="btn btn-base" onClick={onComplete}>
					Hoàn thành
				</Button>}
			</Flex>
			<Table
				className="setting-table ant-upbase"
				dataSource={dataTable || []}
				columns={columns as any}
				bordered
				tableLayout="auto"
				sticky={{ offsetHeader: 0 }}
				scroll={{ x: "max-content" }}
				pagination={false}
			/>
		</Spin>
	);
};

export default DetailTable;
