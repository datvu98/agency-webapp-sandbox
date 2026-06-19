import React, { useMemo, useState, useCallback } from "react";
import { Button, Flex, Modal, Radio, Spin, Typography, Table, TableProps, Tooltip, Input, Pagination, Row, Col, Select, RadioChangeEvent } from "antd";

import dayjs from "dayjs";
import queryString from "querystring";

import { useLazyQuery, useMutation, useQuery } from "@apollo/client";

import { useFullfillmentContext } from "app/contexts/FullfillmentContext";

import mutate_scExportOrderDirect from "graphql/mutations/mutate_scExportOrderDirect";
import query_scGetOperationFulfillmentTrackingRtsSlaTime from "graphql/queries/query_scGetOperationFulfillmentTrackingRtsSlaTime";
import query_scGetOperationFulfillmentTracking from "graphql/queries/query_scGetOperationFulfillmentTracking";
import query_scGetPackages from "graphql/queries/query_scGetPackages";
import query_scListConnectorStoreAgency from "graphql/queries/query_scListConnectorStoreAgency";
import query_smeStore from "graphql/queries/query_smeStore";
import query_scGetExportOrderDirectStatus from "graphql/queries/query_scGetExportOrderDirectStatus";

import { showAlert } from "utils/helper";
import mutate_scExportOrderDirectRtsSlaTime from "graphql/mutations/mutate_scExportOrderDirectRtsSlaTime";
interface ModalConfirmProps {
    open: boolean,
    title: string,
    dataModal?: any,
    onHide: () => void,
    status?: string,
    pivot?: string,
    filterStore?: boolean
}

const { Text } = Typography
const { Search } = Input

const MAP_STATUS = [{
    code: 'pending',
    label: 'Chờ đóng gói'
},
{
    code: 'packing',
    label: 'Đang đóng gói'
},
{
    code: 'packed',
    label: 'Chờ lấy hàng'
}
]

type TabType = 'order' | 'store';


const ModalQuantityStatus = ({
    open,
    onHide,
    title,
    dataModal,
    status,
    pivot,
    filterStore
}: ModalConfirmProps) => {
    const params = queryString.parse(location.search.slice(1, 100000)) as any;
    const [valuesStore, setValueStore] = useState([])
    const { optionsStore } = useFullfillmentContext();
    const _optionsStore = optionsStore?.filter(s => s?.channel?.code == 'shopee' || s?.channel?.code == 'tiktok');
    const [mode, setMode] = useState<TabType>('store');
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(5)
    const [search, setSearch] = useState('')
    const [isExportProcessing, setIsExportProcessing] = useState(false);
    const [exportDownloadLink, setExportDownloadLink] = useState<string | null>(null);

    const { data: dataStores } = useQuery(query_smeStore, {
        fetchPolicy: 'cache-and-network'
    });
    const { data: dataScListConnectorStoreAgency } = useQuery(query_scListConnectorStoreAgency, {
        variables: {
            status: [0, 1]
        },
        fetchPolicy: 'cache-and-network'
    })
    const storeList = useMemo(() => {
        const stores = dataStores?.scAgencySaleStores?.data?.filter(store => {
            return dataScListConnectorStoreAgency?.scListConnectorStoreAgency?.map(item => item?.store_id)?.includes(store?.id)
        })?.map(store => {
            const channel = dataStores?.op_connector_channels?.find(cn => cn?.code == store?.connector_channel_code);
            return {
                ...store,
                channel,
                value: store?.id,
                label: store?.name
            }
        })
        return stores || []
    }, [dataStores, dataScListConnectorStoreAgency]);

    const variables = useMemo(() => {
        const baseFilter = {
            ...dataModal?.filter,
            pack_status: status,
        };
        if (filterStore) {
            baseFilter.rts_sla_time = dataModal?.filter?.rts_sla_time;
        }
        if (!valuesStore?.length) {
            return {
                ...dataModal,
                filter: baseFilter
            };
        }
        return {
            ...dataModal,
            filter: {
                ...baseFilter,
                list_store: valuesStore
            }
        };
    }, [dataModal, status, valuesStore, filterStore])
    const { data, loading } = useQuery(
        filterStore ? query_scGetOperationFulfillmentTrackingRtsSlaTime : query_scGetOperationFulfillmentTracking,
        {
            variables,
            fetchPolicy: 'no-cache',
            skip: mode == 'order'
        }
    );

    const { data: dataPackages, loading: loadingDataPackages } = useQuery(query_scGetPackages, {
        variables: {
            page: page,
            per_page: pageSize,
            search: {
                search_type: 'ref_order_id',
                q: search || null,
                range_time: variables?.filter?.range_time,
                list_source: variables?.filter?.list_source,
                list_store: variables?.filter?.list_store,
                is_connected: 1,
                fulfillment_by: variables?.filter?.fulfillment_by[0],
                connector_channel_code: variables?.filter?.connector_channel_code,
                pack_status: [variables?.filter?.pack_status],
                ...(filterStore ? { rts_sla_time: variables?.filter?.rts_sla_time } : { sla_time: variables?.filter?.sla_time })
            }
        },
        fetchPolicy: 'no-cache',
        skip: mode == 'store'
    });

    const [exportOrder, { loading: loadingExportOrder }] = useMutation(mutate_scExportOrderDirect, {
        variables: {
            time_from: variables?.filter?.range_time?.[0],
            time_to: variables?.filter?.range_time?.[1],
            fulfillment_by: variables?.filter?.fulfillment_by[0],
            list_store: variables?.filter?.list_store?.length ? dataStores?.scAgencySaleStores?.data?.filter(item => variables?.filter?.list_store?.includes(item?.id))?.map(st => ({
                connector_channel_code: st?.connector_channel_code,
                name_store: st?.name,
                store_id: st?.id
            })) : dataStores?.scAgencySaleStores?.data?.filter(store => {
                return dataScListConnectorStoreAgency?.scListConnectorStoreAgency?.map(item => item?.store_id)?.includes(store?.id)
            })?.map(st => ({
                connector_channel_code: st?.connector_channel_code,
                name_store: st?.name,
                store_id: st?.id
            })),
            list_source: variables?.filter?.list_source || [],
            sla_time: variables?.filter?.sla_time,
            pack_status: [variables?.filter?.pack_status]
        }
    })

    const [exportOrderCHB, { loading: loadingExportOrderCHB }] = useMutation(mutate_scExportOrderDirectRtsSlaTime, {
        variables: {
            time_from: variables?.filter?.range_time?.[0],
            time_to: variables?.filter?.range_time?.[1],
            fulfillment_by: variables?.filter?.fulfillment_by[0],
            list_store: variables?.filter?.list_store?.length ? dataStores?.scAgencySaleStores?.data?.filter(item => variables?.filter?.list_store?.includes(item?.id))?.map(st => ({
                connector_channel_code: st?.connector_channel_code,
                name_store: st?.name,
                store_id: st?.id
            })) : dataStores?.scAgencySaleStores?.data?.filter(store => {
                return dataScListConnectorStoreAgency?.scListConnectorStoreAgency?.map(item => item?.store_id)?.includes(store?.id)
            })?.map(st => ({
                connector_channel_code: st?.connector_channel_code,
                name_store: st?.name,
                store_id: st?.id
            })),
            list_source: variables?.filter?.list_source || [],
            sla_time: variables?.filter?.rts_sla_time,
            pack_status: ['pending']
        }
    })

    const [getExportOrderStatus, { loading: loadingExportOrderStatus }] = useLazyQuery(
        query_scGetExportOrderDirectStatus,
        {
            fetchPolicy: 'no-cache'
        }
    );
    const columns: TableProps['columns'] = useMemo(() => {
        return [
            {
                title: 'Tên gian hàng',
                dataIndex: 'id',
                width: 100,
                key: 'id',
                render: (item, record) => {
                    const store = storeList?.find(op => op?.value == record?.store_id);
                    return <Flex gap={4} align="center" style={{ maxWidth: 200 }} justify="start">
                        <img src={store?.channel?.logo_asset_url} style={{ width: 16, height: 16, borderRadius: 4 }} />
                        <Tooltip title={store?.label}>
                            <Text ellipsis style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{store?.label}</Text>

                        </Tooltip>
                    </Flex>
                },
                align: 'center',
            },

            {
                title: 'Số lượng đơn',
                dataIndex: 'gmvAmount',
                width: 200,
                key: 'id',
                render: (item, record) => {
                    return <Text >{record?.total_package}</Text>
                },
                align: 'center',
            },
            {
                title: 'Đơn lỗi do kho',
                dataIndex: 'nmvAmount',
                width: 200,
                key: 'id',
                render: (item, record) => {
                    return <Text >{record?.total_warehouse_error}</Text>
                },
                align: 'center',
            },
            {
                title: 'Đơn lỗi do sàn',
                dataIndex: 'nmvAmount',
                width: 200,
                key: 'id',
                render: (item, record) => {
                    return <Text >{record?.total_platform_error}</Text>
                },
                align: 'center',
            }
        ]
    }, [storeList]);

    const columnsOrder: TableProps['columns'] = useMemo(() => {
        return [
            {
                title: 'Mã đơn hàng',
                dataIndex: 'sme',
                width: 180,
                key: 'id',
                render: (item, record) => {
                    return <Text>{record?.order?.ref_id}</Text>
                },
                align: 'left',
                fixed: true
            },
            {
                title: 'Gian hàng',
                dataIndex: 'id',
                width: 100,
                key: 'id',
                render: (item, record) => {
                    const store = storeList?.find(op => op?.value == record?.order?.store_id);
                    return <Flex gap={4} align="center" style={{ maxWidth: 200 }} justify="start">
                        <img src={store?.channel?.logo_asset_url} style={{ width: 16, height: 16, borderRadius: 4 }} />
                        <Tooltip title={store?.label}>
                            <Text ellipsis style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{store?.label}</Text>

                        </Tooltip>
                    </Flex>
                },
                align: 'center',
            },

            {
                title: 'Ngày tạo đơn',
                dataIndex: 'gmvAmount',
                width: 200,
                key: 'id',
                render: (item, record) => {
                    return <Text >{dayjs(record?.order?.order_at * 1000).format('DD/MM/YYYY HH:mm')}</Text>
                },
                align: 'center',
            },
            {
                title: 'ĐVVC',
                dataIndex: 'nmvAmount',
                width: 150,
                key: 'id',
                render: (item, record) => {
                    return <Text >{record?.shipping_carrier || '--'}</Text>
                },
                align: 'center',
            },
            {
                title: (filterStore ? 'Hạn chuẩn bị hàng' : 'Hạn giao'),
                dataIndex: 'nmvAmount',
                width: 200,
                key: 'id',
                render: (item, record) => {
                    return filterStore ? (
                        <Text>
                            {record?.order?.rts_sla_time
                                ? dayjs(record?.order?.rts_sla_time * 1000).format('DD/MM/YYYY HH:mm')
                                : '--'}
                        </Text>
                    ) : (
                        <Text>
                            {record?.order?.tts_expired
                                ? dayjs(record?.order?.tts_expired * 1000).format('DD/MM/YYYY')
                                : '--'}
                        </Text>
                    );
                },
                align: 'center',
            },
            {
                title: 'Mã lỗi ',
                dataIndex: 'order',
                width: 200,
                key: 'id', render: (item, record) => {

                    return <Text>{record?.connector_channel_error || record?.warehouse_error_message}</Text>
                },
                align: 'center',
            }
        ]
    }, [storeList]);

    const renderLabelStore = useCallback((item) => {
        const store = optionsStore?.find(op => op?.value == item?.value);
        return <Flex gap={4} align="center">
            <img src={store?.channel?.logo_asset_url} style={{ width: 16, height: 16, borderRadius: 4 }} />
            <Text>{item?.label}</Text>
        </Flex>
    }, [optionsStore]);

    const mappedOptionsStore = useMemo(() => {
        let baseOptions = optionsStore;
        const valuesChannel = params?.channel_codes ? params?.channel_codes?.split(',') : [];
        if (filterStore && valuesChannel?.length === 0) {
            // Only Shopee and Tiktok stores if filterStore is true and no channel selected
            return optionsStore?.filter(s => s?.channel?.code === 'shopee' || s?.channel?.code === 'tiktok');
        }
        if (valuesChannel?.length === 0) return baseOptions;
        return baseOptions?.filter(store => valuesChannel.includes(store?.channel?.code));
    }, [optionsStore, filterStore, params?.channel_codes]);

    const renderOptionsStore = useCallback((option) => {
        return <Flex gap={4} align="center">
            <img src={option?.data?.channel?.logo_asset_url} style={{ width: 16, height: 16, borderRadius: 4 }} />
            <Text>{option?.label}</Text>
        </Flex>
    }, []);

    const handleModeChange = (e: RadioChangeEvent) => {
        setMode(e.target.value);
        setValueStore([])
        resetExportState();
    };

    const statusExportOrder = useMemo(() => {
        return {
            PENDING: "pending",
            DONE: "done",
            ERROR: "error",
        };
    }, []);

    const resetExportState = useCallback(() => {
        setIsExportProcessing(false);
        setExportDownloadLink(null);
    }, []);

    const pollExportStatus = useCallback(
        async (jobId: string) => {
            try {
                const { data: statusData } = await getExportOrderStatus({
                    variables: {
                        job_id: jobId,
                    },
                });

                const resultStatus = statusData?.scGetExportOrderDirectStatus;

                if (!resultStatus) {
                    throw new Error("Không có dữ liệu trạng thái xuất file");
                }

                if (resultStatus.status === statusExportOrder.PENDING) {
                    setTimeout(() => {
                        pollExportStatus(jobId);
                    }, 5000);
                    return;
                }

                if (resultStatus.status === statusExportOrder.DONE) {
                    if (resultStatus.link_export) {
                        window.open(resultStatus.link_export, "_blank");
                        setExportDownloadLink(resultStatus.link_export);
                    }
                    setIsExportProcessing(false);
                    return;
                }

                if (resultStatus.status === statusExportOrder.ERROR) {
                    showAlert.error("Có lỗi xảy ra. Vui lòng thử lại");
                    resetExportState();
                    return;
                }
            } catch (error) {
                showAlert.error("Xuất file theo dõi SLA thất bại");
                resetExportState();
            }
        },
        [getExportOrderStatus, resetExportState, statusExportOrder]
    );

    const handleExportOrder = async () => {
        try {
            setIsExportProcessing(true);
            setExportDownloadLink(null);
            const { data } = await exportOrder();
            const result = data?.scExportOrderDirect;

            if (!result?.success) {
                showAlert.error(result?.message || "Xuất file theo dõi SLA thất bại");
                resetExportState();
                return;
            }
            if (result.job_id) {
                pollExportStatus(result.job_id);
            } else {
                showAlert.error("Có lỗi xảy ra. Vui lòng thử lại");
                resetExportState();
            }
        } catch (error) {
            showAlert.error("Xuất file theo dõi SLA thất bại");
            resetExportState();
        }
    };

    return (
        <Modal
            open={open}
            closable={false}
            style={{ top: '30%' }}
            width={1000}
            footer={[
                <Flex className="w-100" align="center" gap={20} justify="right">
                    <Button
                        type="primary"
                        className="btn-base btn primary"
                        onClick={onHide}
                    >
                        Đóng
                    </Button>
                </Flex>
            ]}
        >
            <Flex justify="space-between">
                <Text strong>{mode != 'order' ? title : "Thông tin chi tiết"}</Text>
                {!filterStore && (
                    exportDownloadLink ? (
                        <Button
                            type="primary"
                            className="btn-base btn primary"
                            onClick={() => {
                                if (exportDownloadLink) {
                                    window.open(exportDownloadLink, '_blank');
                                }
                            }}
                        >
                            Ấn vào đây để tải về
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            className="btn-base btn primary"
                            disabled={isExportProcessing}
                            onClick={handleExportOrder}
                        >
                            {isExportProcessing ? (
                                <Flex align="center" gap={8}>
                                    <Spin spinning={true} size="small" />
                                    <span>Đang xử lý xuất file</span>
                                </Flex>
                            ) : (
                                'Xuất file'
                            )}
                        </Button>
                    )
                )}
                {filterStore && <Button
                    type="primary"
                    className="btn-base btn primary"
                    disabled={loadingExportOrderCHB}
                    onClick={async () => {
                        let { data } = await exportOrderCHB()
                        if (data?.scExportOrderDirectRtsSlaTime?.success) {
                            window.open(data?.scExportOrderDirectRtsSlaTime?.link, '_blank');

                        } else {
                            showAlert.error(data?.scExportOrderDirectRtsSlaTime?.message || 'Xuất file theo dõi hạn chuẩn bị hàng thất bại');
                        }
                    }}
                >
                    {loadingExportOrderCHB ? <Spin spinning={true} /> : 'Xuất file'}
                </Button>}
            </Flex>
            <Row style={{ alignItems: 'center' }}>
                <Col span={10} >
                    <Radio.Group onChange={handleModeChange} value={mode} style={{ marginBottom: 8, marginTop: 8 }}>
                        <Radio.Button value="store">Theo gian hàng</Radio.Button>
                        <Radio.Button value="order">Theo đơn hàng</Radio.Button>
                    </Radio.Group>

                </Col>
                <Col span={7}>
                    <Text>Mốc: </Text>
                    <Text style={{ color: '#FF5629', marginLeft: 4 }}>{pivot}</Text>
                </Col>
                <Col span={7}>
                    <Text>Trạng thái đơn:</Text>
                    <Text style={{ color: '#FF5629', marginLeft: 4 }}>{MAP_STATUS?.find(item => item?.code == status)?.label}</Text>
                </Col>
            </Row>
            <Row style={{ marginTop: 12, justifyContent: 'space-between' }}>
                {mode == 'order' && <Col span={10}>
                    <Search
                        className="input-wrapper"
                        placeholder="Tìm kiếm mã đơn hàng"
                        allowClear
                        onSearch={(value) => {
                            setSearch(value);
                            setPage(1);
                        }}
                    />
                </Col>}
                <Col span={10}>
                    <Select
                        mode="multiple"
                        className="w-100"
                        placeholder="Chọn gian hàng"
                        value={valuesStore}
                        options={mappedOptionsStore}
                        onChange={(values) => setValueStore(values)}
                        allowClear={true}
                        labelRender={item => renderLabelStore(item)}
                        optionRender={option => renderOptionsStore(option)}
                        maxTagCount='responsive'
                        maxTagPlaceholder={(omittedValues) => {
                            const hiddenStores = optionsStore?.filter(store => omittedValues.map((option) => option?.key).includes(store?.value))
                            return (
                                <Tooltip
                                    overlayStyle={{
                                        pointerEvents: 'none',
                                    }}
                                    title={hiddenStores?.map(item => item?.label).join(', ')}
                                >
                                    <span>+ {omittedValues?.length} gian hàng</span>
                                </Tooltip>
                            )
                        }}
                        filterOption={(input, option) =>
                            option?.label?.toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </Col>
            </Row>
            {mode == 'store' && <Spin spinning={loading}>
                <Table
                    dataSource={
                        data?.scGetOperationFulfillmentTracking ||
                        data?.scGetOperationFulfillmentTrackingRtsSlaTime ||
                        []
                    }
                    columns={columns}
                    bordered
                    rowKey={(record) => record?.store_id || record?.sme_id}
                    style={{ marginTop: 20, marginBottom: 20 }}
                    scroll={{ x: 'max-content' }}
                />
            </Spin>}
            {mode == 'order' && <Spin spinning={loadingDataPackages}><Table
                dataSource={dataPackages?.scGetPackages}
                columns={columnsOrder}
                bordered
                pagination={false}
                style={{ marginTop: 20, marginBottom: 20 }}
                scroll={{ x: 'max-content' }}
            />
                {!!dataPackages?.scPackageAggregate?.count && <Pagination
                    pageSizeOptions={[5, 10, 15]}
                    defaultPageSize={5}
                    total={dataPackages?.scPackageAggregate?.count}
                    current={page}
                    onChange={(page, pageSize) => {
                        setPage(page)
                        setPageSize(pageSize)
                    }}
                    showSizeChanger
                    showTotal={(total) => {
                        return `Hiển thị ${(page - 1) * 5 + 1} - ${(page - 1) * 5 + dataPackages?.scGetPackages?.length} của ${total}`
                    }}
                />}</Spin>}
        </Modal>
    )
};

export default ModalQuantityStatus;