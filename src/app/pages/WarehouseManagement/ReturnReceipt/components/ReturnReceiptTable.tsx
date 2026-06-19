import { Button, Flex, Typography, Tabs, Dropdown, Table, Spin, Tooltip } from "antd";
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MenuProps } from "antd/lib/menu";
import dayjs from "dayjs";
import Pagination from "app/components/Pagination";
import _, { orderBy } from "lodash";
import queryString from 'querystring'
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import { OPTIONS_STATUS } from "../constants";
import { useQuery } from "@apollo/client";
import query_listReturnReceipts from "graphql/queries/query_listReturnReceipts";

const { Text } = Typography;

const ReturnReceiptTable = ({ listShippingCarrier }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = queryString.parse(location.search.slice(1, 100000)) as any;
    const { user } = useSelector(selectGlobalSlice);

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

    const shippingCarrierCode = useMemo(() => {
        if (!params?.shippingCarriers?.length) return {}
        return {
            shippingCarrierCode: {
                _in: params?.shippingCarriers?.split(',')
            }
        }
    }, [params?.shippingCarriers])

    const status = useMemo(() => {
        if (!params?.status?.length) return {}
        return {
            status: {
                _in: params?.status?.split(',')
            }
        }
    }, [params?.status])
    const code = useMemo(() => {
        if (!params?.q?.length) return {}
        return {
            code: {
                _ilike: `%${params?.q}%`
            }
        }
    }, [params?.q])

    const {data: listReturnReceipts, loading: loadingListReturnReceipts, error} = useQuery(query_listReturnReceipts, {
        variables: {
            limit: limit,
            offset: (page - 1)*limit,
            orderBy: {
                updatedAt: 'desc'
            },
            where: {
                ...shippingCarrierCode,
                ...status,
                ...code
            }
        },
        fetchPolicy: 'cache-and-network'
    })
    const columns = [
        {
            title: "Đơn vị vận chuyển",
            dataIndex: "shippingCarrier",
            key: "shippingCarrier",
            width: 150,
            render: (_item, record) => {
                const shipCarrier = listShippingCarrier?.find(opt => opt?.value == record?.shippingCarrierCode)
                return <Text>{shipCarrier?.label || '--'}</Text>;
            },
        },
        {
            title: "Mã phiếu nhận trả",
            dataIndex: "returnCode",
            key: "returnCode",
            width: 200,
            align: "center",
            render: (_item, record) => {
                return <Text className="color-base cursor-pointer" onClick={() => {
                    navigate(`${location.pathname}/${record?.id}`)
                }}>{record?.code || '--'}</Text>;
            },
        },
        {
            title: "Số lượng kiện bàn giao",
            dataIndex: "quantity",
            key: "quantity",
            width: 200,
            align: "center",
            render: (_item, record) => {
                return <Text>{record?.totalItems ?? '--'}</Text>;
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 150,
            align: "center",
            render: (_item, record) => {
                return <Text>{OPTIONS_STATUS.find(opt => opt?.value == record?.status)?.label}</Text>;
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
        {
            title: "Thời gian tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 200,
            align: "center",
            render: (_item, record) => {
                return <Text>{dayjs(record?.createdAt).format('DD/MM/YYYY HH:mm') || '--'}</Text>;
            },
        },
        {
            title: "Thời gian nhận trả",
            dataIndex: "completedAt",
            key: "completedAt",
            width: 200,
            align: "center",
            render: (_item, record) => {
                return <Text>{record?.completedAt || '--'}</Text>;
            },
        },
        
    ];
    return (
        <Spin spinning={false}>
            <Table
                className="setting-table ant-upbase"
                dataSource={listReturnReceipts?.listReturnReceipts?.data || []}
                columns={columns as any}
                bordered
                tableLayout="auto"
                sticky={{ offsetHeader: 0 }}
                scroll={{ x: "max-content" }}
                pagination={false}
                loading={loadingListReturnReceipts}
            />
            {!error && (
                <Pagination
                    page={listReturnReceipts?.listReturnReceipts?.meta?.pageNumber}
                    totalPage={listReturnReceipts?.listReturnReceipts?.meta?.totalPages}
                    limit={listReturnReceipts?.listReturnReceipts?.meta?.pageSize}
                    totalRecord={listReturnReceipts?.listReturnReceipts?.meta?.totalItems}
                    count={listReturnReceipts?.listReturnReceipts?.data?.length}
                    basePath={`${location.pathname}`}
                    emptyTitle={"Không có dữ liệu"}
                    loading={loadingListReturnReceipts}
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

export default ReturnReceiptTable;
