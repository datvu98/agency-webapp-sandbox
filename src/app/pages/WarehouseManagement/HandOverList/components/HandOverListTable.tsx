import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Flex, Space, Spin, Table, Tooltip, Typography } from "antd";
import { MenuProps } from "antd/lib/menu";
import Pagination from "app/components/Pagination";
import { selectGlobalSlice } from "app/slice/selectors";
import dayjs from "dayjs";
import _ from "lodash";
import queryString from "querystring";
import React from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { formatNumberToCurrency, showAlert } from "utils/helper";
import { OPTION_STATUS } from "../constant";
import { useQuery } from "@apollo/client";
import query_handoverListListWithPagination from "graphql/queries/query_handoverListListWithPagination";
const { Text } = Typography;

const HandOverListTable = ({variables, optionSubUsers, optionsWarehouse}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = queryString.parse(location.search.slice(1, 100000));
    const { user } = useSelector(selectGlobalSlice);
    const {data: dataHandoverList, loading: loadingDataHandoverList} = useQuery(query_handoverListListWithPagination, {
		variables: variables,
		fetchPolicy: 'cache-and-network'
	})
    const columns = [
        {
            title: "Đơn vị vận chuyển",
            dataIndex: "shippingCarrier",
            key: "shippingCarrier",
            width: 150,
            render: (_item, record) => {
                return <Text >{record?.shippingCarrier}</Text>;
            },
        },
        {
            title: "Mã phiếu bàn giao",
            dataIndex: "code",
            key: "code",
            width: 200,
            render: (_item, record) => {
                return <>
                    <Text className="cursor-pointer" onClick={() => {
                        navigate(`${location.pathname}/${record?.id}`)
                    }}>{record?.code}</Text>
                    {record?.isAbnormal && <Text type="danger" style={{ display: 'block', fontSize: 12 }}>Phiên được tạo tự động để xử lý các đơn bất thường</Text>}
                </>;
            },
        },
        {
            title: "Số lượng kiện bàn giao",
            dataIndex: "quantity",
            key: "quantity",
            width: 200,
            render: (_item, record) => {
                return <Text>{formatNumberToCurrency(record?.totalItems)}</Text>;
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 200,
            align: "center",
            render: (_item, record) => {
                const currentStatus = OPTION_STATUS?.find(opt => opt?.value == record?.status)
                return <Text>{currentStatus?.label || '--'}</Text>;
            },
        },
        {
            title: "Nhân viên phụ trách",
            dataIndex: "pic",
            key: "pic",
            width: 200,
            align: "center",
            render: (_item, record) => {
                const currentUser = record?.picType == 1 ? user?.email : optionSubUsers?.find(opt => opt?.value == record?.picId)?.label
                return <Text>{currentUser}</Text>;
            },
        },
        {
            title: "Kho",
            dataIndex: "warehouse",
            key: "warehouse",
            width: 200,
            align: "center",
            render: (_item, record) => {
                const currentWarehouse = record?.warehouseId ? optionsWarehouse?.find(opt => opt?.value == record?.warehouseId)?.label : '--'
                return <Text>{currentWarehouse}</Text>;
            },
        },
        {
            title: "Thời gian tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 200,
            align: "center",
            render: (_item, record) => {
                return (
                        <Text>{dayjs(record?.createdAt).format("DD/MM/YYYY HH:mm")}</Text>
                );
            },
        },
        {
            title: "Thời gian bàn giao",
            dataIndex: "handOverAt",
            key: "handOverAt",
            width: 200,
            align: "center",
            render: (_item, record) => {
                return (
                    
                        <Text>{record?.handoverAt ? dayjs(record?.handoverAt).format("DD/MM/YYYY HH:mm") : '--'}</Text>
                );
            },
        },
    ];

    return (
        <>
            <Table
                className="setting-table ant-upbase"
                dataSource={dataHandoverList?.handoverListListWithPagination?.data || []}
                columns={columns as any}
                bordered
                tableLayout="auto"
                sticky={{ offsetHeader: 0 }}
                scroll={{ x: "max-content" }}
                pagination={false}
                loading={loadingDataHandoverList}
            />
                <Pagination
                    page={dataHandoverList?.handoverListListWithPagination?.meta?.pageNumber}
                    totalPage={dataHandoverList?.handoverListListWithPagination?.meta?.totalPages}
                    limit={dataHandoverList?.handoverListListWithPagination?.meta?.pageSize}
                    totalRecord={dataHandoverList?.handoverListListWithPagination?.meta?.totalItems}
                    count={dataHandoverList?.handoverListListWithPagination?.data?.length}
                    basePath={location.pathname}
                    loading={loadingDataHandoverList}
                    emptyTitle={"Chưa có phiên bàn giao"}
                    options={[
                        { label: 25, value: 25 },
                        { label: 50, value: 50 },
                        { label: 100, value: 100 },
                    ]}
                />
        </>
    );
};

export default HandOverListTable;
