import { WarningFilled } from "@ant-design/icons";
import { Button, Checkbox, Flex, Modal, Radio, Spin, Typography, Table, TableProps, Tooltip, Input, Pagination, Select, RadioChangeEvent } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import query_scGetPackages from "graphql/queries/query_scGetPackages";
import query_smeStore from "graphql/queries/query_smeStore";
import dayjs from "dayjs";
import { STATUS_ORDER_PACK } from "../FullfillmentConstants";
import { useLocation } from "react-router-dom";
import query_coGetShippingCarrierFromListPackage from "graphql/queries/query_coGetShippingCarrierFromListPackage";
import mutate_scExportOrderDirect from "graphql/mutations/mutate_scExportOrderDirect";
import query_scGetExportOrderDirectStatus from "graphql/queries/query_scGetExportOrderDirectStatus";
import { showAlert } from "utils/helper";
import query_scListConnectorStoreAgency from "graphql/queries/query_scListConnectorStoreAgency";
interface ModalConfirmProps {
    open: boolean,
    title: string,
    dataModal?: any,
    onHide: () => void,
    type?: string,
    exportable?: boolean
}

const { Text } = Typography
const { Search } = Input
const PackStatusName = (packStatus, statusOrder, isWaitShippingCarrier = false) => {
    let pack_status = 'other'

    if (statusOrder == 'PENDING') {
        pack_status = 'pending'
    }

    if (packStatus == 'pending') {
        pack_status = 'waiting_for_packing'
    }

    if (packStatus == 'packing') {
        pack_status = 'packing'
    }

    if (packStatus == 'packed') {
        pack_status = 'packed'
    }

    if (packStatus == 'shipping') {
        pack_status = 'shipping'
    }

    if (packStatus == 'shipped') {
        pack_status = 'shipped'
    }

    if (packStatus == 'completed') {
        pack_status = 'completed'
    }

    if (packStatus == 'cancelled') {
        pack_status = 'cancelled'
    }

    if (packStatus == 'in_cancel') {
        pack_status = 'in_cancel'
    }

    if (isWaitShippingCarrier) {
        pack_status = 'wait_shipping_carrier'
    }

    let status = STATUS_ORDER_PACK[pack_status];

    return { status: status, pack_status: pack_status };
};
type TabType = 'order' | 'shipping_carrier';
const ModalOrderList = ({
    open,
    onHide,
    title,
    dataModal,
    type,
    exportable = false
}: ModalConfirmProps) => {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(5)
    const [search, setSearch] = useState('')
    const [shippingCarrier, setShippingCarrier] = useState([])
    const [mode, setMode] = useState<TabType>('order');
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
    const { data, loading } = useQuery(query_scGetPackages, {
        variables: {
            page: page,
            per_page: pageSize,
            search: {
                is_connected: 1,
                search_type: 'ref_order_id',
                ...(!!shippingCarrier?.length ? { shipping_unit: shippingCarrier } : {}),
                ...(type == 'SLA' ? { list_status: ['packing', 'packed', 'ready_to_ship'] } : {}),
                ...dataModal,
                q: search || null
            }
        },
        fetchPolicy: 'cache-and-network'
    })

    const agency_cancel_by_sla = useMemo(() => {
        if (dataModal?.agency_cancel_by_sla) {
            return {
                agency_cancel_by_sla: dataModal?.agency_cancel_by_sla,
                sla_status: null
            }
        }
        return {}
    }, [dataModal?.agency_cancel_by_sla])

    const [exportOrder, { loading: loadingExportOrder }] = useMutation(mutate_scExportOrderDirect, {
        variables: {
            sla_status: 1,
            time_from: dataModal?.range_time?.[0],
            time_to: dataModal?.range_time?.[1],
            fulfillment_by: dataModal?.fulfillment_by,
            ...agency_cancel_by_sla,
            list_store: dataModal?.list_store?.length ? dataStores?.scAgencySaleStores?.data?.filter(item => dataModal?.list_store?.includes(item?.id))?.map(st => ({
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
            list_source: dataModal?.list_source || []
        }
    });

    const [getExportOrderStatus] = useLazyQuery(query_scGetExportOrderDirectStatus, {
        fetchPolicy: 'no-cache'
    });

    const statusExportOrder = useMemo(() => ({
        PENDING: "pending",
        DONE: "done",
        ERROR: "error",
    }), []);

    const resetExportState = useCallback(() => {
        setIsExportProcessing(false);
        setExportDownloadLink(null);
    }, []);

    const pollExportStatus = useCallback(
        async (jobId: string) => {
            try {
                const { data: statusData } = await getExportOrderStatus({
                    variables: { job_id: jobId },
                });
                const resultStatus = statusData?.scGetExportOrderDirectStatus;

                if (!resultStatus) {
                    throw new Error("Không có dữ liệu trạng thái xuất file");
                }

                if (resultStatus.status === statusExportOrder.PENDING) {
                    setTimeout(() => pollExportStatus(jobId), 5000);
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
                showAlert.error("Xuất file báo cáo fulfillment thất bại");
                resetExportState();
            }
        },
        [getExportOrderStatus, resetExportState, statusExportOrder]
    );

    const handleExportOrder = useCallback(async () => {
        try {
            setIsExportProcessing(true);
            setExportDownloadLink(null);

            const { data } = await exportOrder();
            const result = data?.scExportOrderDirect;

            if (!result?.success) {
                showAlert.error(result?.message || "Xuất file báo cáo fulfillment thất bại");
                resetExportState();
                return;
            }

            if (result?.job_id) {
                pollExportStatus(result.job_id);
                return;
            }

            showAlert.error("Có lỗi xảy ra. Vui lòng thử lại");
            resetExportState();
        } catch (error) {
            showAlert.error("Xuất file báo cáo fulfillment thất bại");
            resetExportState();
        }
    }, [exportOrder, pollExportStatus, resetExportState]);

    useEffect(() => {
        if (!open) resetExportState();
    }, [open, resetExportState]);

    const { data: dataShippingCarrier, loading: loadingDataShippingCarrier } = useQuery(query_coGetShippingCarrierFromListPackage, {
        variables: {
            search: {
                is_connected: 1,
                ...(type == 'SLA' ? { list_status: ['packing', 'packed', 'ready_to_ship'] } : {}),
                ...dataModal,
            }
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


    const columns: TableProps['columns'] = useMemo(() => {
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
                title: 'Ngày giao hàng cho ĐVVC',
                dataIndex: 'nmvAmount',
                width: 200,
                key: 'id',
                render: (item, record) => {
                    return <Text >{record?.order?.shipped_at ? dayjs(record?.order?.shipped_at * 1000).format('DD/MM/YYYY') : '--'}</Text>
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
                title: 'Hạn giao',
                dataIndex: 'nmvAmount',
                width: 200,
                key: 'id',
                render: (item, record) => {
                    return <Text >{record?.order?.tts_expired ? dayjs(record?.order?.tts_expired * 1000).format('DD/MM/YYYY') : '--'}</Text>
                },
                align: 'center',
            },
            {
                title: 'Trạng thái đơn ',
                dataIndex: 'order',
                width: 150,
                key: 'id',
                render: (item, record) => {
                    const { status, pack_status } = PackStatusName(
                        record?.order?.logisticsPackages[0]?.pack_status,
                        record?.order?.status,
                        record?.order?.logisticsPackages[0]?.pack_status == 'pending' && !!record?.order?.shipment_param_need_load
                    )
                    return <Text style={{ color: "#ff5629" }} >{status}</Text>
                },
                align: 'center',
            },
        ]
    }, [storeList]);
    useMemo(() => {
        if (['Thông tin đơn lỗi kho', 'Thông tin đơn lỗi sàn']?.includes(title)) {
            columns?.push({
                title: 'Mã lỗi ',
                dataIndex: 'order',
                width: 200,
                key: 'id',
                render: (item, record) => {

                    return <Text>{record?.connector_channel_error || record?.warehouse_error_message}</Text>
                },
                align: 'center',
            })
        }
    }, [title])

    const optionShippingCarrier = useMemo(() => {
        return dataShippingCarrier?.coGetShippingCarrierFromListPackage?.success ? dataShippingCarrier?.coGetShippingCarrierFromListPackage?.data?.map(item => {
            return {
                label: item?.shipping_carrier,
                value: item?.shipping_carrier
            }
        }) : []
    }, [dataShippingCarrier])
    const handleModeChange = (e: RadioChangeEvent) => {
        setMode(e.target.value);
        resetExportState();
    };
    return (
        <Modal
            open={open}
            closable={false}
            width={1000}
            centered
            footer={[
                <Flex className="w-100" align="center" gap={20} justify="right">
                    {/* {type == 'report' && <Button
                        // type="primary"
                        className="btn-base btn primary color-base"
                        onClick={onHide}
                        color="#ff5629"
                    >
                        Xuất file
                    </Button>} */}
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
            <Text strong>{title}</Text>
            {type == 'SLA' && <Flex>
                <Radio.Group onChange={handleModeChange} value={mode} style={{ marginBottom: 8, marginTop: 8 }}>
                    <Radio.Button value="order">Theo đơn hàng</Radio.Button>
                    <Radio.Button value="shipping_carrier">Theo ĐVVC</Radio.Button>
                </Radio.Group>
            </Flex>}
            {exportable && (
                <Flex justify="end">
                    {exportDownloadLink ? (
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
                            disabled={loadingExportOrder || isExportProcessing}
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
                    )}
                </Flex>
            )}
            {mode != 'shipping_carrier' && <Flex style={{ marginTop: 10 }} justify="space-between">
                <Search
                    style={{ width: '30%' }}
                    className="input-wrapper"
                    placeholder="Tìm kiếm mã đơn hàng"
                    allowClear
                    width="60%"
                    onSearch={(value) => {
                        setSearch(value);
                        setPage(1);
                    }}
                />
                <Select
                    mode="multiple"
                    style={{ width: '30%' }}
                    placeholder="Đơn vị vận chuyển"
                    value={shippingCarrier}
                    options={optionShippingCarrier}
                    onChange={(values) => {
                        setShippingCarrier(values)
                        setPage(1);
                    }}
                    allowClear={true}
                    maxTagCount='responsive'
                    maxTagPlaceholder={(omittedValues) => {
                        const hiddenStores = optionShippingCarrier?.filter(store => omittedValues.map((option) => option?.key).includes(store?.value))
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
                    filterOption={(input, option: any) =>
                        option?.label?.toLowerCase().includes(input.toLowerCase())
                    }
                />
            </Flex>}
            <Spin spinning={loading}>
                {mode != 'shipping_carrier' && <><Table
                    dataSource={data?.scGetPackages}
                    columns={columns}
                    bordered
                    pagination={false}
                    style={{ marginTop: 20, marginBottom: 20 }}
                    scroll={{ x: 'max-content' }}
                />
                    {!!data?.scPackageAggregate?.count && <Pagination
                        pageSizeOptions={[5, 10, 15]}
                        defaultPageSize={5}
                        total={data?.scPackageAggregate?.count}
                        current={page}
                        onChange={(page, pageSize) => {
                            setPage(page)
                            setPageSize(pageSize)
                        }}
                        showSizeChanger
                        showTotal={(total) => {
                            return `Hiển thị ${(page - 1) * 5 + 1} - ${(page - 1) * 5 + data?.scGetPackages?.length} của ${total}`
                        }}
                    />}</>}
                {mode == 'shipping_carrier' && <Table
                    dataSource={dataShippingCarrier?.coGetShippingCarrierFromListPackage?.data}
                    columns={[
                        {
                            title: 'Tên Đơn vị vận chuyển',
                            dataIndex: 'sme',
                            width: 180,
                            key: 'id',
                            render: (item, record) => {
                                return <Text>{record?.shipping_carrier}</Text>
                            },
                            align: 'left',
                            fixed: true
                        },
                        {
                            title: 'Số lượng đơn hàng',
                            dataIndex: 'sme',
                            width: 180,
                            key: 'id',
                            render: (item, record) => {
                                return <Text>{record?.number_package}</Text>
                            },
                            align: 'right',
                            fixed: true
                        }
                    ]}
                    bordered
                    pagination={false}
                    style={{ marginTop: 20, marginBottom: 20 }}
                    scroll={{ x: 'max-content' }}
                />}
            </Spin>
        </Modal>
    )
};

export default ModalOrderList;