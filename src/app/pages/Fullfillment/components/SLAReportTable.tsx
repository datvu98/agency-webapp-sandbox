import { FileExcelOutlined, RightOutlined, CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";
import { useLazyQuery, useQuery } from "@apollo/client";
import { Button, Card, Flex, Typography, Table, TableProps, Popover, Space, Checkbox, Empty, Tooltip } from "antd";
import { useReportContext } from "app/contexts/ReportContext";
import React, { memo, useCallback, useMemo, useState } from "react";
import { generateAvgTimestamp, generateDateDefault, generateDateRange } from '../../Report/ReportHelper';
import query_report_fulfillmentDetails from "graphql/queries/query_report_fulfillmentDetails";
import { formatNumberToCurrency, showAlert } from "utils/helper";
import { sumBy } from "lodash";
import query_smeStore from "graphql/queries/query_smeStore";
const { Text } = Typography;
import queryString from 'querystring';
import Pagination from "app/components/Pagination";
import ModalOrderList from "./ModalOrderList";
import { useFullfillmentContext } from "app/contexts/FullfillmentContext";

enum SLA_STATUS {
    SLA_PASS = 10,
    SLA_FAIL = 1
}

const ReportTable = (props: { variables: any }) => {
    const params = queryString.parse(location.search.slice(1, 100000)) as any;
    const { optionsStore, optionSmes } = useFullfillmentContext();
    const [dataModal, setDataModal] = useState<any>(null)
    const [title, setTitle] = useState('')
    const [exportable, setExportable] = useState(false)
    const page = useMemo(() => {
        try {
            let _page = Number(params.page);
            if (!Number.isNaN(_page)) {
                return Math.max(1, _page)
            } else {
                return 1
            }
        } catch (error) {
            return 1;
        }
    }, [params?.page]);

    const pageSize = useMemo(() => {
        return 500
    }, [params?.limit]);

    const { loading, data } = useQuery(query_report_fulfillmentDetails, {
        variables: {
            ...props?.variables,
            pageSize,
            page
        },
        fetchPolicy: 'no-cache',
    });

    const columns: TableProps['columns'] = useMemo(() => {
        return [
            {
                title: 'Thông tin gian hàng',
                dataIndex: 'id',
                width: 200,
                key: 'id',
                render: (item, record) => {
                    const store = optionsStore?.find(op => op?.value == record?.storeId);
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
                    const sme = optionSmes?.find(item => item?.value == record?.smeId)
                    return <Tooltip title={sme?.label}>
                        <Text ellipsis style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sme?.label}</Text>

                    </Tooltip>
                },
                align: 'right',
                sorter: (a, b) => {
                    const smeA = optionSmes?.find(item => item?.value == a?.smeId)?.label || '';
                    const smeB = optionSmes?.find(item => item?.value == b?.smeId)?.label || '';
                    return smeA.localeCompare(smeB);
                },
            },
            {
                title: 'Tổng đơn hàng đẩy sang kho',
                dataIndex: 'order',
                width: 220,
                key: 'id',
                render: (item, record) => {
                    return <Text>{record?.totalProcessed}</Text>
                },
                align: 'right',
                sorter: {
                    compare: (a, b) => a?.totalProcessed - b?.totalProcessed,
                    mutiple: 7
                },
            },
            {
                title: 'Tổng đơn hàng đã giao cho ĐVVC',
                dataIndex: 'order',
                width: 250,
                key: 'id',
                render: (item, record) => {
                    return <Text>{record?.totalProcessedShipped}</Text>
                },
                align: 'right',
                sorter: {
                    compare: (a, b) => a?.totalProcessedShipped - b?.totalProcessedShipped,
                    mutiple: 7
                },
            },
            {
                title: 'Đơn hàng đạt SLA',
                dataIndex: 'effective_order',
                width: 200,
                key: 'id',
                render: (item, record) => {
                    return <Text style={{ cursor: 'pointer', color: '#ff5629' }} onClick={() => {
                        if (record?.totalProcessedSuccess == 0) {
                            return
                        }
                        setDataModal({
                            sla_status: SLA_STATUS.SLA_PASS,
                            range_time: [props?.variables?.from, props?.variables?.to],
                            list_source: props?.variables?.sources?.split(','),
                            list_store: [+record?.storeId],
                            fulfillment_by: props?.variables?.fulfillment_provider_type,

                        })
                        setTitle('Đơn hàng đạt SLA')
                        setExportable(false)
                    }}>{record?.totalProcessedSuccess}</Text>

                },
                align: 'right',
                sorter: {
                    compare: (a, b) => a?.totalProcessedSuccess - b?.totalProcessedSuccess,
                    mutiple: 6
                },
            },
            {
                title: '% đạt SLA',
                dataIndex: 'aov',
                width: 200,
                key: 'id',
                render: (item, record) => {
                    return <Text>{Math.round(record?.totalProcessedSuccess / record?.totalProcessedShipped * 100) || 0} %</Text>

                },
                align: 'right',
                sorter: {
                    compare: (a, b) => a?.totalProcessedSuccess / a?.totalProcessedShipped - b?.totalProcessedSuccess / b?.totalProcessedShipped,
                    mutiple: 5
                },
            },
            {
                title: 'Đơn hàng không đạt SLA',
                dataIndex: 'return_sale',
                width: 200,
                key: 'id',
                render: (item, record) => {
                    return <Text style={{ cursor: 'pointer', color: '#ff5629' }} onClick={() => {
                        if (record?.totalProcessedFail == 0) {
                            return
                        }
                        setDataModal({
                            sla_status: SLA_STATUS.SLA_FAIL,
                            range_time: [props?.variables?.from, props?.variables?.to],
                            list_source: props?.variables?.sources?.split(','),
                            list_store: [+record?.storeId],
                            fulfillment_by: props?.variables?.fulfillment_provider_type
                        })
                        setTitle('Đơn hàng không đạt SLA')
                        setExportable(false)
                    }}>{record?.totalProcessedFail}</Text>

                },
                align: 'right',
                sorter: {
                    compare: (a, b) => a?.totalProcessedFail - b?.totalProcessedFail,
                    mutiple: 4
                },
            },
            {
                title: '% không đạt SLA',
                dataIndex: 'return_order',
                width: 200,
                key: 'id',
                render: (item, record) => {
                    return <Text>{Math.round(record?.totalProcessedFail / record?.totalProcessedShipped * 100) || 0} %</Text>
                },
                align: 'right',
                sorter: {
                    compare: (a, b) => a?.record?.totalProcessedFail / a?.totalProcessedShipped - b?.record?.totalProcessedFail / b?.totalProcessedShipped,
                    mutiple: 3
                },
            },
            {
                title: 'Đơn hàng hủy do quá hạn SLA',
                dataIndex: 'return_order',
                width: 200,
                key: 'id',
                render: (item, record) => {
                    return <Text style={{ cursor: 'pointer', color: '#ff5629' }} onClick={() => {
                        if (record?.totalCancelBySla == 0) {
                            return
                        }
                        setDataModal({
                            agency_cancel_by_sla: 1,
                            range_time: [props?.variables?.from, props?.variables?.to],
                            list_source: props?.variables?.sources?.split(','),
                            list_store: [+record?.storeId],
                            fulfillment_by: props?.variables?.fulfillment_provider_type
                        })
                        setTitle('Đơn hàng hủy do quá hạn SLA')
                        setExportable(false)
                    }}>{record?.totalCancelBySla || 0}</Text>
                },
                align: 'right',
                sorter: {
                    compare: (a, b) => a?.totalCancelBySla - b?.totalCancelBySla,
                    mutiple: 3
                },
            }
        ]
    }, [data, optionsStore]);



    return (
        <Flex vertical gap={20}>
            {!!dataModal && <ModalOrderList type={'report'} exportable={exportable} dataModal={dataModal} open={!!dataModal} onHide={() => {
                setExportable(false)
                setDataModal(null)
            }} title={title} />}
            <Flex justify="space-between" align="center">
                <Text className="title-card" strong>Số liệu chi tiết</Text>
            </Flex>
            <Table
                className='setting-table ant-upbase'
                dataSource={data?.report_fulfillmentDetails?.items}
                columns={columns}
                bordered
                loading={loading}
                scroll={{ x: 'max-content' }}
                sticky={{ offsetHeader: 114 }}
                summary={() => {
                    const totalProcessed = data?.report_fulfillmentDetails
                        ? data?.report_fulfillmentDetails?.totalProcessed
                        : 0;

                    const totalSmes = data?.report_fulfillmentDetails
                        ? new Set(data?.report_fulfillmentDetails?.items?.map(item => item.smeId)).size
                        : 0;
                    const totalProcessedShipped = data?.report_fulfillmentDetails
                        ? data?.report_fulfillmentDetails?.totalProcessedShipped
                        : 0;

                    const totalProcessedSuccess = data?.report_fulfillmentDetails
                        ? data?.report_fulfillmentDetails?.totalProcessedSuccess
                        : 0;
                    const totalProcessedFail = data?.report_fulfillmentDetails
                        ? data?.report_fulfillmentDetails?.totalProcessedFail
                        : 0;
                    const totalCancelBySla = data?.report_fulfillmentDetails
                        ? data?.report_fulfillmentDetails?.totalCancelBySla
                        : 0;

                    const totalProcessedSuccessPercent = data?.report_fulfillmentDetails && data?.report_fulfillmentDetails?.totalProcessedShipped != 0
                        ? Math.round(data?.report_fulfillmentDetails?.totalProcessedSuccess / data?.report_fulfillmentDetails?.totalProcessedShipped * 100)
                        : 0;
                    const totalProcessedFailPercent = data?.report_fulfillmentDetails && data?.report_fulfillmentDetails?.totalProcessedShipped != 0
                        ? Math.round(data?.report_fulfillmentDetails?.totalProcessedFail / data?.report_fulfillmentDetails?.totalProcessedShipped * 100)
                        : 0;
                    return (
                        <Table.Summary fixed="bottom">
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0} align="left">{`Tổng (${data?.report_fulfillmentDetails?.items?.length} gian hàng)`}</Table.Summary.Cell>
                                <Table.Summary.Cell index={2} align="right">
                                    {totalSmes} UpS
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} align="right">
                                    {totalProcessed}
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} align="right">
                                    {totalProcessedShipped}
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} align="right">
                                    <span style={{ cursor: 'pointer' }} onClick={() => {
                                        if (!totalProcessedSuccess) return
                                        setDataModal({
                                            sla_status: SLA_STATUS.SLA_PASS,
                                            range_time: [props?.variables?.from, props?.variables?.to],
                                            list_source: props?.variables?.sources?.split(','),
                                            list_store: props?.variables?.store_ids?.split(',')?.map(item => +item),
                                            fulfillment_by: props?.variables?.fulfillment_provider_type,
                                        })
                                        setTitle('Đơn hàng đạt SLA')
                                        setExportable(false)
                                    }}>
                                        {totalProcessedSuccess}
                                    </span>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} align="right">
                                    {totalProcessedSuccessPercent} %
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} align="right">
                                    <span style={{ cursor: 'pointer' }} onClick={() => {
                                        if (!totalProcessedFail) return
                                        setDataModal({
                                            sla_status: SLA_STATUS.SLA_FAIL,
                                            range_time: [props?.variables?.from, props?.variables?.to],
                                            list_source: props?.variables?.sources?.split(','),
                                            list_store: props?.variables?.store_ids?.split(',')?.map(item => +item),
                                            fulfillment_by: props?.variables?.fulfillment_provider_type,
                                        })
                                        setTitle('Đơn hàng không đạt SLA')
                                        setExportable(true)
                                    }}>

                                        {totalProcessedFail}
                                    </span>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} align="right">
                                    {totalProcessedFailPercent} %
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} align="right">
                                    <span style={{ cursor: 'pointer' }} onClick={() => {
                                        if (!totalCancelBySla) return
                                        setDataModal({
                                            agency_cancel_by_sla: 1,
                                            range_time: [props?.variables?.from, props?.variables?.to],
                                            list_source: props?.variables?.sources?.split(','),
                                            list_store: props?.variables?.store_ids?.split(',')?.map(item => +item),
                                            fulfillment_by: props?.variables?.fulfillment_provider_type,
                                        })
                                        setTitle('Đơn hàng hủy do quá hạn SLA')
                                        setExportable(true)
                                    }}>
                                        {totalCancelBySla}
                                    </span>
                                </Table.Summary.Cell>


                            </Table.Summary.Row>
                        </Table.Summary>
                    );
                }}
            />
        </Flex>
    )
};

export default ReportTable;
