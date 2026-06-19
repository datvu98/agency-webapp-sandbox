import { Button, Flex, Typography, Tabs, Dropdown, Table, Spin, Tooltip } from "antd";
import React, { useMemo, useState } from "react";
import { formatNumberToCurrency, showAlert } from "utils/helper";
import { useLocation, useNavigate } from "react-router-dom";
import { MenuProps } from "antd/lib/menu";
import { DownOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import Pagination from "app/components/Pagination";
import { useMutation } from "@apollo/client";
import mutate_processingListCancel from "graphql/mutations/mutate_processingListCancel";
import mutate_processingListCreatePickStep from "graphql/mutations/mutate_processingListCreatePickStep";
import _ from "lodash";
import queryString from 'querystring'
import { OPTION_STATUS } from "../constants";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";

const { Text } = Typography;

const RestockTable = ({ dataTable, refetch, error, dataPagination, listStorage }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const queryParams = Object.fromEntries(params.entries());
    const { user } = useSelector(selectGlobalSlice);

    const columns = [
        {
            title: "Mã xuất kho",
            dataIndex: "code",
            key: "code",
            width: 150,
            render: (_item, record) => {
                return <Text className="cursor-pointer"
                    onClick={() => {
                        navigate(`/${user?.category_code == 'fulfillment' ? 'outbound-manage' : "warehouse-manage"}/warehouse-bill-out/${record?.id}`)
                    }}
                >{record?.code || '--'}</Text>;
            },
        },
        {
            title: "Mã kiện hàng",
            dataIndex: "systemPackageNumber",
            key: "systemPackageNumber",
            width: 200,
            align: "center",
            render: (_item, record) => {
                return <Text>{record?.systemPackageNumber || '--'}</Text>;
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 150,
            align: "center",
            render: (_item, record) => {
                return <Text>{OPTION_STATUS.find(opt => opt?.value ==record?.fulfillmentStatus)?.label}</Text>;
            },
        },
        {
            title: <Tooltip title='Số ngày kho chưa nhập hàng về lại kho kể từ ngày phiếu xuất hàng bị huỷ'><Text>Số ngày hoãn</Text></Tooltip>,
            dataIndex: "delayDay",
            key: "delayDay",
            width: 150,
            align: "center",
            render: (_item, record) => {
                const delayDay = dayjs().startOf('day').diff(dayjs(record?.cancelAt).startOf('day'), "day");
                return <Text>{record?.cancelAt ? delayDay : '--'}</Text>;
            },
        },
        {
            title: "Số hàng hoá",
            dataIndex: "totalVariants",
            key: "totalVariants",
            width: 150,
            align: "center",
            render: (_item, record) => {
                return <Text>{record?.totalVariants || '--'}</Text>;
            },
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            width: 200,
            align: "center",
            render: (_item, record) => {
                return <Text>{record?.totalQuantity || '--'}</Text>;
            },
        },
        {
            title: "Vị trí chứa",
            dataIndex: "quantity",
            key: "quantity",
            width: 200,
            align: "center",
            render: (_item, record) => {
                // const listStrId = record?.warehouseBillItems?.map(item => item?.inventoryLocations?.storageEquipmentId)

                const listStrId = [
                    ...new Set(
                        record?.warehouseBillItems?.flatMap(item =>
                            item?.inventoryLocations?.map(loc => loc?.storageEquipmentId)
                        ).filter(Boolean)
                    )
                ];
                const storage = listStorage?.filter(str => listStrId?.includes(str?.id))?.map(location => location?.name)
                return <Text>{storage?.join(', ') || '--'}</Text>;
            },
        },
        {
            title: "Người thao tác",
            dataIndex: "pic",
            key: "pic",
            width: 200,
            align: "center",
            render: (_item, record) => {
                return <Text>{record?.fulfillmentActorName || '--'}</Text>;
            },
        },
        
    ];
    console.log(dataPagination)
    return (
        <Spin spinning={false}>
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
            {!error && (
                <Pagination
                    page={dataPagination?.pageNumber}
                    totalPage={dataPagination?.totalPages}
                    limit={dataPagination?.pageSize}
                    totalRecord={dataPagination?.totalItems}
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

export default RestockTable;
