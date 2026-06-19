import { CheckCircleTwoTone } from "@ant-design/icons";
import { useLazyQuery, useQuery } from "@apollo/client";
import { Button, Card, Flex, Typography, Table, TableProps, Popover, Space, Checkbox, Empty, Tooltip } from "antd";
import React, { memo, useCallback, useMemo, useState } from "react";
import { sumBy } from "lodash";
import query_smeStore from "graphql/queries/query_smeStore";
import { useFullfillmentContext } from "app/contexts/FullfillmentContext";
import ModalOrderList from "./ModalOrderList";
import query_scListConnectorStoreAgency from "graphql/queries/query_scListConnectorStoreAgency";
const { Text } = Typography;

const FullfillmentDetailTable = (props: { data: any, range_time: any, list_source: any, fulfillment_provider_type: any, }) => {
    const { variablesQuery, optionsStore, optionSmes } = useFullfillmentContext();
    const [dataModal, setDataModal] = useState<any>(null)
    const [title, setTitle] = useState<string>('')

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

    const columns: TableProps['columns'] = useMemo(() => {
        return [
            {
                title: 'Thông tin gian hàng',
                dataIndex: 'id',
                width: 200,
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
                align: 'left',
                fixed: true
            },
            {
                title: 'UpS',
                dataIndex: 'return_order',
                width: 200,
                key: 'id',
                render: (item, record) => {
                    const sme = optionSmes?.find(item => item?.value == record?.sme_id)
                    console.log(sme)
                    return <Tooltip title={sme?.label}>
                        <Text ellipsis style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sme?.label}</Text>

                    </Tooltip>
                },
                align: 'left',
                sorter: (a, b) => {
                    const smeA = optionSmes?.find(item => item?.value == a?.sme_id)?.label || '';
                    const smeB = optionSmes?.find(item => item?.value == b?.sme_id)?.label || '';
                    return smeA.localeCompare(smeB);
                },
            },
            {
                title: 'Đơn đẩy sang kho',
                dataIndex: 'sme',
                width: 200,
                key: 'id',
                render: (item, record) => {
                    let total_to_wms = record?.total_to_provider_wms + record?.total_to_self_wms + record?.total_to_smart_wms
                    return <Flex align="center" justify="end">
                        <p style={{ color: total_to_wms != record?.total_package ? '#ff5629' : 'black', marginBottom: 0 }}>{total_to_wms}</p><p style={{ marginBottom: 0, color: 'black' }}>/{record?.total_package}</p>
                        {total_to_wms == record?.total_package && <p style={{ marginBottom: -2, marginLeft: 4 }}>
                            <CheckCircleTwoTone twoToneColor="#52c41a" />
                        </p>}
                    </Flex>
                },
                align: 'right',
                sorter: {
                    compare: (a, b) => (a?.total_package - a?.total_to_provider_wms - a?.total_to_self_wms - a?.total_to_smart_wms) - (b?.total_package - b?.total_to_provider_wms - b?.total_to_self_wms - b?.total_to_smart_wms),
                    mutiple: 9
                },
            },
            {
                title: 'Đơn quá hạn',
                dataIndex: 'gmvAmount',
                width: 200,
                key: 'id',
                render: (item, record) => {
                    return <Text style={{ cursor: 'pointer', color: !!record?.total_tts_expired ? '#ff5629' : 'black' }} onClick={() => {
                        if (!record?.total_tts_expired) return
                        setDataModal({
                            processing_deadline: 'expired',
                            range_time: props?.range_time,
                            list_source: props?.list_source,
                            list_store: [record?.store_id],
                            fulfillment_by: props?.fulfillment_provider_type,
                        })
                        setTitle('Thông tin đơn quá hạn')
                    }}>{record?.total_tts_expired}</Text>
                },
                align: 'right',
                sorter: {
                    compare: (a, b) => a?.total_tts_expired - b?.total_tts_expired,
                    mutiple: 9
                },
            },
            {
                title: 'Đơn sắp hết hạn',
                dataIndex: 'nmvAmount',
                width: 200,
                key: 'id',
                render: (item, record) => {
                    return <Text style={{ cursor: 'pointer', color: !!record?.total_tts_expire_soon ? '#ff5629' : 'black' }} onClick={() => {
                        if (!record?.total_tts_expire_soon) return
                        setDataModal({
                            processing_deadline: 'expiring_soon',
                            range_time: props?.range_time,
                            list_source: props?.list_source,
                            list_store: [record?.store_id],
                            fulfillment_by: props?.fulfillment_provider_type,
                        })
                        setTitle('Thông tin đơn sắp hết hạn')

                    }}>{record?.total_tts_expire_soon}</Text>
                },
                align: 'right',
                sorter: {
                    compare: (a, b) => a?.total_tts_expire_soon - b?.total_tts_expire_soon,
                    mutiple: 8
                },
            },
            {
                title: 'Đơn lỗi kho',
                dataIndex: 'order',
                width: 200,
                key: 'id',
                render: (item, record) => {
                    return <Text style={{ cursor: 'pointer', color: !!record?.total_warehouse_error ? '#ff5629' : 'black' }} onClick={() => {
                        if (!record?.total_warehouse_error) return
                        setDataModal({
                            list_status: ['warehouse_error'],
                            pack_status: ['pending', 'packing', 'packed'],
                            range_time: props?.range_time,
                            list_source: props?.list_source,
                            list_store: [record?.store_id],
                            fulfillment_by: props?.fulfillment_provider_type,
                        })
                        setTitle('Thông tin đơn lỗi kho')
                    }}>{record?.total_warehouse_error}</Text>
                },
                align: 'right',
                sorter: {
                    compare: (a, b) => a?.total_warehouse_error - b?.total_warehouse_error,
                    mutiple: 7
                },
            },
            {
                title: 'Đơn lỗi sàn',
                dataIndex: 'effective_order',
                width: 200,
                key: 'id',
                render: (item, record) => {
                    return <Text style={{ cursor: 'pointer', color: !!record?.total_platform_error ? '#ff5629' : 'black' }} onClick={() => {
                        if (!record?.total_platform_error) return
                        setDataModal({
                            list_status: ['connector_channel_error'],
                            pack_status: ['pending', 'packing', 'packed'],
                            range_time: props?.range_time,
                            list_source: props?.list_source,
                            list_store: [record?.store_id],
                            fulfillment_by: props?.fulfillment_provider_type,
                        })
                        setTitle('Thông tin đơn lỗi sàn')
                    }}>{record?.total_platform_error}</Text>
                },
                align: 'right',
                sorter: {
                    compare: (a, b) => a?.total_platform_error - b?.total_platform_error,
                    mutiple: 6
                },
            },
            {
                title: 'Đơn chờ đóng gói',
                dataIndex: 'aov',
                width: 200,
                key: 'id',
                render: (item, record) => {
                    return <Text style={{ cursor: 'pointer', color: !!record?.total_pending ? '#ff5629' : 'black' }} onClick={() => {
                        if (!record?.total_pending) return
                        setDataModal({
                            list_status: ['ready_to_ship'],
                            pack_status: ['pending', 'packing', 'packed'],
                            range_time: props?.range_time,
                            list_source: props?.list_source,
                            list_store: [record?.store_id],
                            fulfillment_by: props?.fulfillment_provider_type,
                            wait_shipping_carrier: 2
                        })
                        setTitle('Thông tin đơn chờ đóng gói')
                    }}>{record?.total_pending}</Text>
                },
                align: 'right',
                sorter: {
                    compare: (a, b) => a?.total_pending - b?.total_pending,
                    mutiple: 5
                },
            },
            {
                title: 'Đơn chờ lấy hàng',
                dataIndex: 'aov',
                width: 200,
                key: 'id',
                render: (item, record) => {
                    return <Text style={{ cursor: 'pointer', color: !!record?.total_packed ? '#ff5629' : 'black' }} onClick={() => {
                        if (!record?.total_packed) return
                        setDataModal({
                            list_status: ['packed'],
                            pack_status: ['pending', 'packing', 'packed'],
                            range_time: props?.range_time,
                            list_source: props?.list_source,
                            list_store: [record?.store_id],
                            fulfillment_by: props?.fulfillment_provider_type,
                        })
                        setTitle('Thông tin đơn chờ lấy hàng')
                    }}>{record?.total_packed}</Text>
                },
                align: 'right',
                sorter: {
                    compare: (a, b) => a?.total_packed - b?.total_packed,
                    mutiple: 5
                },
            },
            {
                title: 'Đơn hoả tốc',
                dataIndex: 'express',
                width: 200,
                key: 'id',
                render: (item, record) => {
                    return <Text style={{ color: !!record?.total_express ? '#ff5629' : 'black' }}>{record?.total_express}</Text>
                },
                align: 'right',
                sorter: {
                    compare: (a, b) => a?.total_express - b?.total_express,
                    mutiple: 5
                },
            },
        ]
    }, [optionsStore]);



    return (
        <Flex vertical gap={20}>
            {!!dataModal && <ModalOrderList type={'SLA'} dataModal={dataModal} open={!!dataModal} onHide={() => setDataModal(null)} title={title} />}
            <Flex justify="space-between" align="center">
                <Text className="title-card" strong>Số liệu chi tiết</Text>
            </Flex>
            <Table
                className='setting-table ant-upbase'
                dataSource={props?.data}
                columns={columns}
                bordered
                pagination={false}
                summary={() => {
                    const totalOrderToProvider = props?.data
                        ? sumBy(props?.data, 'total_to_provider_wms')
                        : 0;

                    const totalOrderToSmart = props?.data
                        ? sumBy(props?.data, 'total_to_smart_wms')
                        : 0;

                    const totalOrderToWms = props?.data
                        ? sumBy(props?.data, 'total_to_self_wms')
                        : 0;

                    const totalPackages = props?.data
                        ? sumBy(props?.data, 'total_package')
                        : 0;
                    const totalTtsExpired = props?.data
                        ? sumBy(props?.data, 'total_tts_expired')
                        : 0;

                    const totalTtsExpireSoon = props?.data
                        ? sumBy(props?.data, 'total_tts_expire_soon')
                        : 0;
                    const totalWarehouseError = props?.data
                        ? sumBy(props?.data, 'total_warehouse_error')
                        : 0;
                    const totalPlatformError = props?.data
                        ? sumBy(props?.data, 'total_platform_error')
                        : 0;
                    const totalPending = props?.data
                        ? sumBy(props?.data, 'total_pending')
                        : 0;

                    const totalSmes = props?.data
                        ? new Set(props?.data?.map(item => item.sme_id)).size
                        : 0;

                    const totalPacked = props?.data
                        ? sumBy(props?.data, 'total_packed')
                        : 0;

                    const totalExpress = props?.data
                        ? sumBy(props?.data, 'total_express')
                        : 0;

                    return (
                        <Table.Summary fixed="bottom">
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0} align="left">{`Tổng (${props?.data?.length} gian hàng)`}</Table.Summary.Cell>
                                <Table.Summary.Cell index={2} align="left">
                                    <span style={{ color: 'black' }}>{totalSmes} UpS</span>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} align="right">
                                    <Flex align="center" justify="end" >
                                        <span style={{ color: (totalOrderToProvider + totalOrderToWms + totalOrderToSmart) == totalPackages ? 'black' : '' }}>{totalOrderToProvider + totalOrderToWms + totalOrderToSmart}</span><span style={{ color: 'black' }}>/{totalPackages}</span>
                                        {(totalOrderToProvider + totalOrderToWms + totalOrderToSmart) == totalPackages && <p style={{ marginBottom: -2, marginLeft: 4 }}>
                                            <CheckCircleTwoTone twoToneColor='#52c41a' />
                                        </p>}
                                    </Flex>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} align="right">
                                    <span style={{ cursor: 'pointer', color: !!totalTtsExpired ? '#ff5629' : 'black' }} onClick={() => {
                                        if (!totalTtsExpired) return
                                        setDataModal({
                                            processing_deadline: 'expired',
                                            range_time: props?.range_time,
                                            list_source: props?.list_source,
                                            list_store: props?.data?.map(item => item?.store_id),
                                            fulfillment_by: props?.fulfillment_provider_type,
                                        })
                                        setTitle('Thông tin đơn quá hạn')
                                    }}>{totalTtsExpired}</span>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} align="right">
                                    <span style={{ cursor: 'pointer', color: !!totalTtsExpireSoon ? '#ff5629' : 'black' }} onClick={() => {
                                        if (!totalTtsExpireSoon) return
                                        setDataModal({
                                            processing_deadline: 'expiring_soon',
                                            range_time: props?.range_time,
                                            list_source: props?.list_source,
                                            list_store: props?.data?.map(item => item?.store_id),
                                            fulfillment_by: props?.fulfillment_provider_type,
                                        })
                                        setTitle('Thông tin đơn sắp hết hạn')
                                    }}>{totalTtsExpireSoon}</span>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} align="right">
                                    <span style={{ cursor: 'pointer', color: !!totalWarehouseError ? '#ff5629' : 'black' }} onClick={() => {
                                        if (!totalWarehouseError) return
                                        setDataModal({
                                            list_status: ['warehouse_error'],
                                            pack_status: ['pending', 'packing', 'packed'],
                                            range_time: props?.range_time,
                                            list_source: props?.list_source,
                                            list_store: props?.data?.map(item => item?.store_id),
                                            fulfillment_by: props?.fulfillment_provider_type,
                                        })
                                        setTitle('Thông tin đơn lỗi kho')
                                    }}>{totalWarehouseError}</span>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} align="right">
                                    <span style={{ cursor: 'pointer', color: !!totalPlatformError ? '#ff5629' : 'black' }} onClick={() => {
                                        if (!totalPlatformError) return
                                        setDataModal({
                                            list_status: 'connector_channel_error',
                                            pack_status: ['pending', 'packing', 'packed'],
                                            range_time: props?.range_time,
                                            list_source: props?.list_source,
                                            list_store: props?.data?.map(item => item?.store_id),
                                            fulfillment_by: props?.fulfillment_provider_type,
                                        })
                                        setTitle('Thông tin đơn lỗi sàn')
                                    }}>{totalPlatformError}</span>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} align="right">
                                    <span style={{ cursor: 'pointer', color: !!totalPending ? '#ff5629' : 'black' }} onClick={() => {
                                        if (!totalPending) return
                                        setDataModal({
                                            list_status: ['ready_to_ship'],
                                            pack_status: ['pending', 'packing', 'packed'],
                                            range_time: props?.range_time,
                                            list_source: props?.list_source,
                                            list_store: props?.data?.map(item => item?.store_id),
                                            fulfillment_by: props?.fulfillment_provider_type,
                                            wait_shipping_carrier: 2
                                        })
                                        setTitle('Thông tin đơn chờ đóng gói')
                                    }}>{totalPending}</span>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} align="right">
                                    <span style={{ cursor: 'pointer', color: !!totalPacked ? '#ff5629' : 'black' }} onClick={() => {
                                        if (!totalPacked) return
                                        setDataModal({
                                            list_status: ['packed'],
                                            pack_status: ['pending', 'packing', 'packed'],
                                            range_time: props?.range_time,
                                            list_source: props?.list_source,
                                            list_store: props?.data?.map(item => item?.store_id),
                                            fulfillment_by: props?.fulfillment_provider_type,
                                        })
                                        setTitle('Thông tin đơn chờ lấy hàng')
                                    }}>{totalPacked}</span>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} align="right">
                                    <span style={{ color: !!totalExpress ? '#ff5629' : 'black' }}>{totalExpress}</span>
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        </Table.Summary>
                    );
                }}
                scroll={{ x: 'max-content' }}
                sticky={{ offsetHeader: 114 }}
            />
        </Flex>
    )
};

export default FullfillmentDetailTable;
