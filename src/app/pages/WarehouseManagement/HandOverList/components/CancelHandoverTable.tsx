import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Flex, Space, Spin, Table, Tooltip, Typography } from "antd";
import { MenuProps } from "antd/lib/menu";
import Pagination from "app/components/Pagination";
import { selectGlobalSlice } from "app/slice/selectors";
import dayjs from "dayjs";
import _ from "lodash";
import queryString from "querystring";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import query_handoverListItemListWithPagination from "graphql/queries/query_handoverListItemListWithPagination";
import { queryHandoverListByIds, queryWarehouseBillByIds } from "../helpers";
import { OPTION_SHIPPING_CARRIERS } from "../constant";
const { Text } = Typography;

const CancelHanoverTable = ({optionsWarehouse}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = queryString.parse(location.search.slice(1, 100000)) as any;
    const { user } = useSelector(selectGlobalSlice);
    const [dataTable, setDataTable] = useState([])
    const [loading, setLoading] = useState(false)
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
    const shippingCarrier = useMemo(() => {
        if (!params?.shippingCarrier) return {}
        const carrier = OPTION_SHIPPING_CARRIERS?.filter(opt => params?.shippingCarrier?.split(',')?.includes(opt?.value))
        return {
            shippingCarrier: {
                _in: carrier?.map(opt => opt?.label)
            }
        }
    }, [params?.shippingCarrier]);

    const warehouseId = useMemo(() => {
        if (!params?.warehouse && optionsWarehouse?.length) return {
            warehouseId: {
                _eq: Number(optionsWarehouse?.[0]?.value)
            }
        }
        return {
            warehouseId: {
                _eq: Number(params?.warehouse)
            }
        }
    }, [params?.warehouse, optionsWarehouse]);

    const timeFilter = useMemo(() => {
        if (!params?.date_search_type || params?.date_search_type == 'createdAt') {
            return {
                handoverList: {
                    createdAt: {
                        _gt: params?.gt ? dayjs.unix(+params?.gt).toISOString() : dayjs().startOf('day').toISOString(),
                        _lt: params?.lt ? dayjs.unix(+params?.lt).toISOString() : dayjs().endOf('day').toISOString()
                    }
                }
            }
        }
        return {
            warehouseBill: {
                cancelAt: {
                    _gt: params?.gt ? dayjs.unix(+params?.gt).toISOString() : dayjs().startOf('day').toISOString(),
                    _lt: params?.lt ? dayjs.unix(+params?.lt).toISOString() : dayjs().endOf('day').toISOString()
                }
            }
        }
    }, [params?.date_search_type, params?.gt, params?.lt]);

    const search = useMemo(() => {
        if (!params?.q) return {}
        return {
            _or: [
                {
                    trackingNumber: {
                        _ilike: `%${params?.q}%`
                    }
                },
                {
                    systemPackageNumber: {
                        _ilike: `%${params?.q}%`
                    }
                }
            ]
        }
    }, [params?.q]);
    const {data, loading: loadingHandoverListItemListWithPagination} = useQuery(query_handoverListItemListWithPagination, {
        variables: {
            limit,
			offset: (page-1)*limit,
			// where: {
			// 	...shippingCarrier,
			// 	...timeFilter,
			// 	...search,
			// 	...warehouseId
			// }
            where: {
                _and: [
                    {
                        warehouseBill: {
                            status: { _eq: 'cancel' },
                            ...shippingCarrier,
                            ...warehouseId,
                            ...search,
                        },
                    },
                    timeFilter
                ]
            }
        },
        onCompleted: async (res) => {
            setLoading(true)
            if (res?.handoverListItemListWithPagination?.data?.length) {
                const warehouseBillIds = res?.handoverListItemListWithPagination?.data?.map(item => item?.warehouseBillId)
                const handoverListIds = res?.handoverListItemListWithPagination?.data?.map(item => item?.handoverListId)
                const warehouseBillList = await queryWarehouseBillByIds(warehouseBillIds)
                const handoverListList = await queryHandoverListByIds(handoverListIds)
                const newData = res?.handoverListItemListWithPagination?.data?.map(item => {
                    const warehouseBill = warehouseBillList?.find(bill => bill?.id == item?.warehouseBillId)
                    const handoverList = handoverListList?.find(list => list?.id == item?.handoverListId)
                    return {
                        ...item,
                        warehouseBill,
                        handoverList
                    }
                })
                setDataTable(newData)
            } else {
                setDataTable([])
            }
            setLoading(false)
            
        },
        fetchPolicy: 'cache-and-network'
    })
    const columns = [
        {
            title: "Mã kiện hàng",
            dataIndex: "systemPackageNumber",
            key: "systemPackageNumber",
            width: 150,
            render: (_item, record) => {
                return <Text className="color-base" strong>{record?.warehouseBill?.systemPackageNumber}</Text>;
            },
        },
        {
            title: "Mã vận đơn",
            dataIndex: "trackingNumber",
            key: "trackingNumber",
            width: 150,
            render: (_item, record) => {
                return <Text >{record?.warehouseBill?.trackingNumber}</Text>;
            },
        },
        {
            title: "Đơn vị vận chuyển",
            dataIndex: "shippingCarrier",
            key: "shippingCarrier",
            width: 150,
            render: (_item, record) => {
                return <Text >{record?.warehouseBill?.shippingCarrier}</Text>;
            },
        },
        {
            title: "Phiếu bàn giao",
            dataIndex: "code",
            key: "code",
            width: 200,
            render: (_item, record) => {
                return <Text className="cursor-pointer color-base" onClick={() => {
                    navigate(`${location.pathname}/${record?.handoverList?.id}`)
                }} strong>{record?.handoverList?.code}</Text>;
            },
        },
        {
            title: "Thời gian huỷ",
            dataIndex: "cancelAt",
            key: "cancelAt",
            width: 200,
            align: "center",
            render: (_item, record) => {
                return (
                    
                        <Text>{record?.warehouseBill?.cancelAt ? dayjs(record?.warehouseBill?.cancelAt).format("DD/MM/YYYY HH:mm") : '--'}</Text>
                );
            },
        },
    ];

    return (
        <>
            <Table
                className="setting-table ant-upbase"
                dataSource={dataTable || []}
                columns={columns as any}
                bordered
                tableLayout="auto"
                sticky={{ offsetHeader: 0 }}
                scroll={{ x: "max-content" }}
                pagination={false}
                loading={loadingHandoverListItemListWithPagination || loading}
            />
                <Pagination
                    page={data?.handoverListItemListWithPagination?.meta?.pageNumber}
                    totalPage={data?.handoverListItemListWithPagination?.meta?.totalPages}
                    limit={data?.handoverListItemListWithPagination?.meta?.pageSize}
                    totalRecord={data?.handoverListItemListWithPagination?.meta?.totalItems}
                    count={dataTable?.length}
                    basePath={location.pathname}
                    loading={loadingHandoverListItemListWithPagination || loading}
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

export default CancelHanoverTable;
