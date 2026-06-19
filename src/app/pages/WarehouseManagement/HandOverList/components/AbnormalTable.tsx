import { Button, Dropdown, Flex, Space, Spin, Table, Tooltip, Typography } from "antd";
import Pagination from "app/components/Pagination";
import { selectGlobalSlice } from "app/slice/selectors";
import dayjs from "dayjs";
import _ from "lodash";
import queryString from "querystring";
import React, { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import { OPTION_SHIPPING_CARRIERS } from "../constant";
import query_warehouseBillListWithPagination from "graphql/queries/query_warehouseBillListWithPagination";
import ModalConfirm from "../dialogs/ModalConfirm";
import { buildBatches, aggregate } from "../helpers";
import mutate_createAbnormalHandover from "graphql/mutations/mutate_createAbnormalHandover";
import ModalProgress from "../dialogs/ModalProgress";
import ModalResult from "../dialogs/ModalResult";
import ModalSessionInfo from "../dialogs/ModalSessionInfo";
const { Text } = Typography;

const AbnormalTable = ({optionsWarehouse}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = queryString.parse(location.search.slice(1, 100000)) as any;
    const { user } = useSelector(selectGlobalSlice);
    const [selected, setSelected] = useState<any>([])
    const [showConfirm, setShowConfirm] = useState<boolean>(false)
    const [showProgress, setShowProgress] = useState<boolean>(false)
    const [processed, setProcessed] = useState<any>([]);
    const [showResult, setShowResult] = useState<boolean>(false);
    const [showSessionInfo, setShowSessionInfo] = useState<boolean>(false);
    const [aggregatedResult, setAggregatedResult] = useState<any>(null);

    const [createAbnormalHandover] = useMutation(mutate_createAbnormalHandover);
    

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
        return {
            [`${params?.date_search_type || 'shippedAt'}`]: {
                _gt: params?.gt ? dayjs.unix(+params?.gt).toISOString() : dayjs().startOf('day').toISOString(),
                _lt: params?.lt ? dayjs.unix(+params?.lt).toISOString() : dayjs().endOf('day').toISOString()
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
    const {data, loading: loadingWarehouseBillList, refetch} = useQuery(query_warehouseBillListWithPagination, {
        variables: {
            limit,
            offset: (page-1)*limit,
            where: {
                ...shippingCarrier,
                ...warehouseId,
                ...search,
                ...timeFilter,
                packStatus: {
                    _in: ["shipping", "shipped", "completed"]
                },
                status: {
                    _eq: 'new'
                }
            }
        },
        fetchPolicy: 'cache-and-network'
    })

    const handleCreateHandover = useCallback(async () => {
        setShowConfirm(false);
        setShowProgress(true);
        setProcessed([]);

        const allResults: any[] = [];
        const batches = buildBatches(selected);

        for (const batch of batches) {
            try {
                const { data: mutationData } = await createAbnormalHandover({
                    variables: {
                        input: {
                            warehouseBillIds: batch?.map((b: any) => b?.id)
                        }
                    }
                });
                if (mutationData?.createAbnormalHandover?.data) {
                    allResults?.push(mutationData?.createAbnormalHandover?.data);
                }
            } catch (err) {
                allResults?.push({
                    totalItems: batch?.length ?? 0,
                    successCount: 0,
                    failedItems: batch?.map((b: any) => ({
                        warehouseBillId: b?.id,
                        code: b?.systemPackageNumber ?? '',
                        error: 'Lỗi kết nối'
                    })),
                    createdHandoverLists: []
                });
            } finally {
                setProcessed(prev => [...(prev ?? []), ...(batch ?? [])]);
            }
        }

        setShowProgress(false);
        setAggregatedResult(aggregate(allResults));
        setShowResult(true);
        refetch();
    }, [selected, createAbnormalHandover, refetch]);
    const columns = [
        {
            title: "Mã kiện hàng",
            dataIndex: "systemPackageNumber",
            key: "systemPackageNumber",
            width: 150,
            render: (_item, record) => {
                return <Text className="color-base" strong>{record?.systemPackageNumber}</Text>;
            },
        },
        {
            title: "Mã vận đơn",
            dataIndex: "trackingNumber",
            key: "trackingNumber",
            width: 150,
            render: (_item, record) => {
                return <Text >{record?.trackingNumber}</Text>;
            },
        },
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
            title: "Thời gian giao hàng",
            dataIndex: "shippedAt",
            key: "shippedAt",
            width: 200,
            align: "center",
            render: (_item, record) => {
                return (
                    <Text>{record?.shippedAt ? dayjs(record?.shippedAt).format("DD/MM/YYYY HH:mm") : '--'}</Text>
                );
            },
        },
    ];

    const rowSelection = useMemo(() => {
            return {
                selectedRowKeys: selected?.map(opt => opt?.id),
                onChange: (selectedRowKeys: React.Key[], selectedRows) => {
                    setSelected(selectedRows)
                    // setSelectedVariants(prev => {
                    //     const newVariants = [...new Set(prev.concat(selectedRows))]
                    //     return newVariants
                    // });
                },
            }
        }, [selected]);

    return (
        <>
            {showProgress && <ModalProgress 
                show={showProgress}
                processedItems={processed}
                selected={selected}
            />}
            {!!showResult && <ModalResult
                open={showResult}
                total={aggregatedResult?.totalItems}
                success={aggregatedResult?.successCount}
                failed={aggregatedResult?.failedItems?.length ?? 0}
                errors={aggregatedResult?.failedItems ?? []}
                onClose={() => {
                    setShowResult(false);
                    if (aggregatedResult?.createdHandoverLists?.length) {
                        setShowSessionInfo(true);
                    }
                }}
            />}
            {showSessionInfo && <ModalSessionInfo
                open={showSessionInfo}
                handoverLists={aggregatedResult?.createdHandoverLists ?? []}
                onClose={() => setShowSessionInfo(false)}
            />}
            {showConfirm && <ModalConfirm
                show={showConfirm}
                text="Hệ thống sẽ tự động tạo và hoàn thành phiên bàn giao với những kiện hàng trên. Bạn có đồng ý tạo?"
                onHide={() => {setShowConfirm(false)}}
                onConfirm={handleCreateHandover}
            />}
            <Flex justify="end" style={{marginBottom: 10}}>
                <Button type="primary" className="btn-base" disabled={!selected?.length} onClick={() => {
                    setShowConfirm(true)
                }}>Tạo phiên bàn giao</Button>
            </Flex>
            <Table
                rowKey="id"
                className="setting-table ant-upbase"
                dataSource={data?.warehouseBillListWithPagination?.data || []}
                columns={columns as any}
                bordered
                tableLayout="auto"
                sticky={{ offsetHeader: 0 }}
                rowSelection={{
                    type: 'checkbox',
                    ...rowSelection,
                }}
                scroll={{ x: "max-content" }}
                pagination={false}
                loading={loadingWarehouseBillList}
            />
                <Pagination
                    page={data?.warehouseBillListWithPagination?.meta?.pageNumber}
                    totalPage={data?.warehouseBillListWithPagination?.meta?.totalPages}
                    limit={data?.warehouseBillListWithPagination?.meta?.pageSize}
                    totalRecord={data?.warehouseBillListWithPagination?.meta?.totalItems}
                    count={data?.warehouseBillListWithPagination?.data?.length}
                    basePath={location.pathname}
                    loading={loadingWarehouseBillList}
                    emptyTitle={"Chưa có phiếu bất thường"}
                    options={[
                        { label: 25, value: 25 },
                        { label: 50, value: 50 },
                        { label: 100, value: 100 },
                    ]}
                />
        </>
    );
};

export default AbnormalTable;
