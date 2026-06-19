import React, { memo, useCallback, useLayoutEffect, useMemo, useState } from "react";
import { useLayoutContext } from "app/contexts/LayoutContext";
import { Helmet } from "react-helmet-async";
import { Button, Card, Col, DatePicker, Flex, Row, Select, Spin, Tabs, Tooltip, Typography } from "antd";
import { SettlementWrapper } from "../Settlement.style";
import SettlementManualTable from "../components/SettlementManualTable";
import SettlementFilter from "../components/SettlementFilter";
import SettlementOverview from "../components/SettlementOverview";
import { DEFAULT_TABS, SEARCH_TYPES, SOURCE_TYPES, TABS, TIME_TYPES } from "../SettlementConstant";
import { useNavigate } from "react-router-dom";
import queryString from 'querystring'
import dayjs from "dayjs";
import { find, omit } from "lodash";
import Search from "antd/es/input/Search";
import { HistoryOutlined, InfoCircleOutlined } from "@ant-design/icons";
import FinalizationDialog from "../dialogs/FinalizationDialog";
import { showAlert } from "utils/helper";
import { useMutation, useQuery } from "@apollo/client";
import mutate_cfConfirmSettlementProcessed from "graphql/mutations/mutate_cfConfirmSettlementProcessed";
import ResultFinalizationDialog from "../dialogs/ResultFinalizationDialog";
import ImportFileDialog from "../dialogs/ImportFileDialog";
import ExportFileDialog from "../dialogs/ExportFileDialog";
import { ResultImportFileDialog } from "../dialogs/ResultImportFileDialog";
import query_getListSettlementOrder from "graphql/queries/query_getListSettlementOrder";
import { useSettlementContext } from "app/contexts/SettlementContext";
import query_summarySettlementOrder from "graphql/queries/query_summarySettlementOrder";

const { Text } = Typography;
const { RangePicker } = DatePicker;
const optionsOverdue = [
    {
        value: '',
        label: 'Tất cả',
    },
    {
        value: 1,
        label: "Đã quá hạn",
    },
    {
        value: 2,
        label: "Chưa quá hạn",
    },
];

const subTab = [
    {
        label: "Tất cả",
        key: ''
    },
    {
        label: "Cân bằng",
        key: '1'
    },
    {
        label: "Bất thường",
        key: '2',
        sub: [
            { name: 'Chưa xử lý', key: '1', default: true },
            { name: 'Đã xử lý bất thường', key: '2' },
        ]
    },
]

const SettlementManual = () => {
    const { appendBreadcrumb } = useLayoutContext();
    const navigate = useNavigate()
    const params = queryString.parse(location.search.slice(1, 100000)) as any;
    const [valuesRangeTime, setValueRangeTime] = useState<any>([])
    const [valueSearchText, setValueSearchText] = useState<any>('')
    const [currentStatus, setCurrentStatus] = useState<any>(subTab[0]?.label || "");
    const [ids, setIds] = useState([])
    const [dialogFinaliztion, setDialogFinaliztion] = useState(false)
    const [countPending, setCountPending] = useState(0)
    const [countProcessed, setCountProcessed] = useState(0)
    const { optionsStore } = useSettlementContext();

    const [reslutDialogFinaliztion, setReslutDialogFinaliztion] = useState<any>()

    const [exportFileDialog, setExportFileDialog] = useState(false)
    const [importFileDialog, setImportFileDialog] = useState(false)
    const [dataImportMenual, setDataImportMenual] = useState(null)

    const [mutate, { loading: reloadOrderLoading }] = useMutation(mutate_cfConfirmSettlementProcessed, {
        awaitRefetchQueries: true,
        refetchQueries: ['getListSettlementOrder'],
    })

    useLayoutEffect(() => {
        appendBreadcrumb([
            {
                title: 'Đối soát',
                pathname: '/settlement-manage',
            },
            {
                title: 'Đối soát thủ công',
                pathname: '/settlement-manage/manual',
            },
        ]);
    }, []);

    useMemo(() => {
        if (!params.settlement_abnormal) {
            setCurrentStatus(subTab[0]?.label);
        }

        let findedStatus: any = find(subTab, { key: params?.settlement_abnormal }) ||
            find(subTab, (_status) =>
                _status?.sub?.some((_sub) => _sub?.key === params?.settlement_abnormal)
            );

        setCurrentStatus(findedStatus?.label);
    }, [params?.settlement_abnormal]);

    const settlement_abnormal = useMemo(() => {
        if (params?.settlement_abnormal == 3) return ''
        return +params?.settlement_abnormal || ''
    }, [params?.settlement_abnormal])

    const settlement_abnormal_status = useMemo(() => {
        if (!params?.settlement_abnormal_status) {
            return (params?.tab == 'PROCESSED' && settlement_abnormal) == 2 ? 1 : ''
        }
        return +params?.settlement_abnormal_status
    }, [params?.settlement_abnormal_status, params?.tab, settlement_abnormal])
    const onChange = (key: string) => {
        const queryParams = omit({ ...params, page: 1, tab: key }, ["gt", "lt", 'q', 'search_type_time', 'settlement_abnormal', 'settlement_abnormal_status']);
        navigate(`/settlement-manage/manual?${queryString.stringify(queryParams).replaceAll('%2C', '\,')}`);
    };
    const onChangeTab = (key: string) => {
        if (key == '2') {
            const queryParams = omit({
                ...params,
                page: 1,
                is_old_order: 1,
            }, ["gt", "lt", 'q', 'search_type_time', 'tab', 'settlement_abnormal', 'settlement_abnormal_status']);

            navigate(`/settlement-manage/manual?${queryString.stringify(queryParams)}`);
        } else {
            const queryParams = omit({
                ...params,
                page: 1,
            }, ["gt", "lt", 'q', 'search_type_time', 'tab', 'is_old_order', 'settlement_abnormal', 'settlement_abnormal_status']);

            navigate(`/settlement-manage/manual?${queryString.stringify(queryParams)}`);
        }
    };

    const disabledFutureDate = useCallback((date) => {
        const unixDate = dayjs(date).unix();
        const fromDate = dayjs().startOf('day').add(-89, 'day').unix();
        const toDate = !!params?.is_old_order
            ? dayjs().endOf('day').add(-90, 'day').unix()
            : dayjs().endOf("day").unix();

        return !!params?.is_old_order
            ? unixDate > toDate
            : (unixDate < fromDate || unixDate > toDate);
    }, [params?.is_old_order]);

    const onChangeTimeType = useCallback((values) => {
        const requestUrl = {
            ...params,
            search_type_time: values
        };

        navigate(`/settlement-manage/manual?${queryString.stringify(requestUrl).replaceAll('%2C', '\,')}`);
    }, [params, SOURCE_TYPES]);

    const onChangeSearchType = useCallback((values) => {
        const requestUrl = {
            ...params,
            search_type: values
        };

        navigate(`/settlement-manage/manual?${queryString.stringify(requestUrl).replaceAll('%2C', '\,')}`);
    }, [params, SEARCH_TYPES]);

    const [valueTimeType, valueSearchType] = useMemo(() => {
        return [
            params?.search_type_time ? params?.search_type_time : params?.tab != 'PENDING' ? 1 : 2,
            params?.seach_type ? params?.seach_type : 1,
        ]
    }, [params]);

    useMemo(() => {
        if (params?.tab == "PROCESSED") {
            if (!!params?.is_old_order) {
                setValueRangeTime([
                    dayjs().subtract(96, "day").startOf("day"),
                    dayjs().subtract(90, "day").startOf("day"),
                ]);
            } else {
                setValueRangeTime([
                    dayjs().subtract(6, "day").startOf("day"),
                    dayjs().startOf("day"),
                ]);
            }
        } else {
            if (!!params?.is_old_order) {
                setValueRangeTime([
                    dayjs().subtract(96, "day").startOf("day"),
                    dayjs().subtract(90, "day").startOf("day"),
                ]);
            } else {
                setValueRangeTime(null);
            }
        }
    }, [params?.tab, params?.is_old_order]);

    useMemo(() => {
        if (!params?.gt || !params?.lt) return;

        let rangeTimeConvert = [dayjs(params?.gt * 1000), dayjs(params?.lt * 1000)]
        setValueRangeTime(rangeTimeConvert);
    }, [params?.gt, params?.lt]);

    useMemo(() => {
        if (!params?.q) {
            setValueSearchText('')
            return
        }
        setValueSearchText(params?.q)
    }, [params?.q])

    const onChangeRangeTime = useCallback((dates) => {
        let queryParams = {};
        setValueRangeTime(dates);
        console.log(dates)
        if (!!dates) {
            let [gtCreateTime, ltCreateTime] = [
                dayjs(dates[0]).startOf("day").unix(),
                dayjs(dates[1]).endOf("day").unix(),
            ];
            queryParams = {
                ...params,
                page: 1,
                gt: gtCreateTime,
                lt: ltCreateTime,
            }
        } else {
            queryParams = omit({ ...params, page: 1 }, ["gt", "lt"]);
        }

        navigate(`/settlement-manage/manual?${queryString.stringify(queryParams).replaceAll('%2C', '\,')}`);
    }, [params])

    const handleFinalization = async (time) => {
        let variables = {
            list_id: ids?.map((item: any) => +item?.id),
            payout_time: dayjs(time).unix()
        }

        let { data } = await mutate({
            variables: variables
        })

        if (data?.cfConfirmSettlementProcessed?.success) {
            showAlert.success('Thành công')
            setReslutDialogFinaliztion({
                total: ids?.length,
                total_success: data?.cfConfirmSettlementProcessed?.total_success,
                total_fail: (ids?.length - data?.cfConfirmSettlementProcessed?.total_success) || 0
            })
            setDialogFinaliztion(false)
            setIds([])
        } else {
            showAlert.error('Thất bại')
            setDialogFinaliztion(false)
            setIds([])
        }
    }

    const settlement_timeout = useMemo(() => {
        return +params?.settlement_timeout || ''
    }, [params?.settlement_timeout])

    const tab_type = useMemo(() => {
        return params?.tab || 'PENDING'
    }, [params?.tab])
    const channel = useMemo(() => {
        if (!params?.channel_codes) return null
        return params?.channel_codes?.split(',')
    }, [params?.channel_codes])

    const search_type_time = useMemo(() => {
        return +params?.search_type_time || (tab_type == "PROCESSED" ? 1 : 2)
    }, [params?.search_type_time, tab_type])

    const keyword_type = useMemo(() => {
        return params?.search_type || 'order_ref_id'
    }, [params?.search_type])

    const settlement_payout_time_changed = useMemo(() => {
        if (params?.settlement_abnormal == 3) return 1
        return null
    }, [params?.settlement_abnormal])

    const is_old_order = useMemo(() => {
        if (!params.is_old_order) return {};

        return { is_old_order: Number(params?.is_old_order) }
    }, [params.is_old_order]);

    const list_store_id = useMemo(() => {
        if (params?.store_ids) {
            return params?.store_ids?.split(',')?.map(item => +item)
        }
        if (params?.smes) {
            return optionsStore?.map(item => item?.id)
        }
        return null
    }, [optionsStore, params?.smes, params?.store_ids])

    const fulfillment_by = useMemo(() => {
        if (params?.services && params?.services != 3) {
            return +params?.services
        }
        if (params?.services == 3) {
            return null
        }
        return 2
    }, [params?.services])

    const q = useMemo(() => {
        return params?.q || ''
    }, [params?.q])

    const page = useMemo(() => {
        return +params?.page || 1
    }, [params?.page])

    const perPage = useMemo(() => {
        return +params?.limit || 25
    }, [params?.limit])

    const sources = useMemo(() => {
        if (params?.sources) {
            return params?.sources?.split(',')
        }
        return ['manual', 'pos']
    }, [params?.sources])


    const range_time = useMemo(() => {
        try {
            if (!params?.gt || !params?.lt) {
                if (valuesRangeTime?.length > 0) {
                    if (params?.tab == 'PROCESSED') {
                        return [
                            dayjs().subtract(!!params?.is_old_order ? 96 : 6, "day").startOf("day").unix(),
                            dayjs().subtract(!!params?.is_old_order ? 90 : 0, "day").endOf("day").unix()
                        ]
                    }

                    if (!!params?.is_old_order && params?.tab != 'PROCESSED') {
                        return [
                            dayjs().subtract(96, "day").startOf("day").unix(),
                            dayjs().subtract(90, "day").endOf("day").unix()
                        ]
                    }
                } else {
                    return {}
                }
            }
            return [+params?.gt, +params?.lt]
        } catch (error) {
            return {};
        }
    }, [params?.gt, params?.lt, valuesRangeTime, params?.is_old_order, params?.tab]);

    const whereCondition = useMemo(() => {
        return {
            connector_channel_code: channel ? channel : null,
            page,
            per_page: perPage,
            fulfillment_by,
            sources,
            payment_system: 'upbase',
            keyword: q,
            keyword_type,
            range_time,
            settlement_abnormal,
            settlement_payout_time_changed,
            settlement_abnormal_status,
            settlement_timeout,
            status: tab_type == 'PENDING' ? ['PENDING', 'SHIPPED'] : 'PROCESSED',
            list_store_id,
            type_time: search_type_time,
            ...is_old_order
        }
    }, [range_time, list_store_id, channel, page, perPage, q, tab_type, settlement_abnormal, fulfillment_by, sources,
        settlement_abnormal_status, settlement_timeout, search_type_time, is_old_order, keyword_type, settlement_payout_time_changed])
    const filterPropertyNull = useMemo(() => Object.entries(whereCondition).filter((elm) => {
        if (elm.at(1)) {
            return elm
        }
    }), [whereCondition])


    const { data, loading, refetch, error } = useQuery(
        query_getListSettlementOrder,
        {
            variables: Object.fromEntries(filterPropertyNull),
            fetchPolicy: "cache-and-network",
        }
    );
    const countOrder = useCallback(
        (status, sub = false) => {
            const { count_abnormal_pending, count_abnormal_processed,
                count_abnormal,
                total_for_status, count_balance, total_for_paging, count_payout_time_changed } = data?.getListSettlementOrder.summary_data ?? {};

            const STATUS_COUNT_ABNORMAL = 2;
            const STATUS_COUNT_PAYOUT_TIME_CHANGED = 3;
            const STATUS_COUNT_BALANCE = 1;
            const STATUS_COUNT_ABNORMAL_PENDING = 1;
            const STATUS_COUNT_ABNORMAL_PROCESSED = 2;

            const countOrdeAbnormal = {
                [STATUS_COUNT_ABNORMAL_PENDING]: count_abnormal_pending,
                [STATUS_COUNT_ABNORMAL_PROCESSED]: count_abnormal_processed,
            }
            const countStatusOrder = {
                [STATUS_COUNT_ABNORMAL]: count_abnormal,
                [STATUS_COUNT_BALANCE]: count_balance,
                [STATUS_COUNT_PAYOUT_TIME_CHANGED]: count_payout_time_changed
            }
            const totalOrder = sub ? countOrdeAbnormal[status] : countStatusOrder[status] ?? total_for_status
            let totalRecord = totalOrder || 0;
            let totalPage = Math.ceil(total_for_paging / perPage);
            return {
                count: totalOrder,
                dataPagination: {
                    totalRecord,
                    totalPage
                }
            }
        }, [data]);

    const { data: dataSummary, loading: loadingSummary } = useQuery(query_summarySettlementOrder, {
        variables: {
            payment_system: 'upbase',
            list_store_id,
            fulfillment_by,
            sources,
            connector_channel_code: channel ? channel : null,
            ...(!!params?.is_old_order ? {
                is_old_order: 1
            } : {})
        },
        onCompleted: (data) => {
            setCountPending(data?.summarySettlementOrder?.count_pending)
            setCountProcessed(data?.summarySettlementOrder?.count_processed)
        },
        fetchPolicy: "cache-and-network",
    })

    return <SettlementWrapper>
        <Helmet
            titleTemplate="Đối soát thủ công - UpS"
            defaultTitle="Đối soát thủ công - UpS"
        >
            <meta name="description" content="Đối soát thủ công - UpS" />
        </Helmet>
        {dialogFinaliztion && <FinalizationDialog handleFinalization={async (time) => await handleFinalization(time)} show={dialogFinaliztion} onHide={() => {
            setDialogFinaliztion(false)
            setIds([])
        }} />}
        <ResultFinalizationDialog show={!!reslutDialogFinaliztion} onHide={() => setReslutDialogFinaliztion(null)} result={reslutDialogFinaliztion} />
        {importFileDialog && <ImportFileDialog show={importFileDialog} setDataImportMenual={setDataImportMenual} onHide={() => setImportFileDialog(false)} />}
        {exportFileDialog && <ExportFileDialog params={params} status={params?.tab || "PENDING"} show={exportFileDialog} onHide={() => setExportFileDialog(false)} />}
        {dataImportMenual && <ResultImportFileDialog dataProcessed={dataImportMenual} onHide={() => setDataImportMenual(null)} />}
        <Spin spinning={reloadOrderLoading}>
            <Card>
                <Tabs
                    activeKey={!!params?.is_old_order ? '2' : '1'}
                    type="card"
                    size={'large'}
                    items={DEFAULT_TABS}
                    onChange={onChangeTab}
                />
                <SettlementFilter baseRoute={`/settlement-manage/manual`} />
            </Card>
            {!params?.is_old_order && <Card style={{ marginTop: 20 }}>
                <SettlementOverview data={null} dataSummary={dataSummary} loadingSummary={loadingSummary} />
            </Card>}
            <Card style={{ marginTop: 20 }} title='Chi tiết'>
                <Tabs
                    activeKey={params?.tab || 'PENDING'}
                    type="card"
                    size={'large'}
                    items={TABS?.map(item => {
                        if (item?.key == "PENDING") {
                            return {
                                ...item,
                                label: `Chờ quyết toán (${countPending})`
                            }
                        }
                        return {
                            ...item,
                            label: `Đã quyết toán (${countProcessed})`
                        }
                    })}
                    onChange={onChange}
                />
                <Row gutter={40} style={{ marginBottom: 20 }}>
                    <Col span={8}>
                        <Flex>
                            <Select
                                value={TIME_TYPES?.find(item => item?.value == valueTimeType)}
                                options={params?.tab == 'PROCESSED' ? TIME_TYPES : TIME_TYPES?.slice(1, 3)}
                                allowClear={false}
                                onChange={(values) => onChangeTimeType(values)}
                                style={{ borderRadius: 0 }}
                                className="custom-select"
                            />
                            <RangePicker
                                className="w-100"
                                format={'DD/MM/YYYY'}
                                value={valuesRangeTime as any}
                                disabledDate={disabledFutureDate}
                                onChange={onChangeRangeTime}
                                style={{ borderRadius: 0 }}
                            />
                        </Flex>
                    </Col>
                    <Col span={8}>
                        <Flex>
                            <Select
                                value={SEARCH_TYPES?.find(item => item?.value == valueSearchType)}
                                options={SEARCH_TYPES}
                                allowClear={false}
                                onChange={(values) => onChangeSearchType(values)}
                                style={{ borderRadius: 0 }}
                                className="custom-select"
                            />
                            <Search
                                className="custom-search"
                                placeholder="Tìm đơn hàng"
                                allowClear
                                width="60%"
                                value={valueSearchText}
                                style={{ borderRadius: 0 }}
                                onChange={(e) => {
                                    setValueSearchText(e?.target?.value)
                                }}
                                onSearch={(value) => {
                                    const requestUrl = {
                                        ...params,
                                        q: value
                                    };
                                    navigate(`/settlement-manage/manual?${queryString.stringify(requestUrl).replaceAll('%2C', '\,')}`);
                                }}
                            />
                        </Flex>
                    </Col>
                    <Col span={8}>
                        {params?.tab == 'PENDING' && (
                            <Flex align="center">
                                <span style={{ minWidth: '60px' }}>Quá hạn</span>
                                <Tooltip title='Quyết toán không được giải quyết trong vòng 24 giờ sau khi đơn hàng được hoàn thành.' >
                                    <InfoCircleOutlined />
                                </Tooltip>
                                <Select
                                    options={optionsOverdue}
                                    className="w-100 custom-select-warehouse"
                                    style={{ padding: 0, marginLeft: 8 }}
                                    value={optionsOverdue.find((_op) => _op.value == params?.settlement_timeout) || {
                                        value: '',
                                        label: 'Tất cả',
                                    }}
                                    onChange={(value) => {
                                        if (!!value) {
                                            navigate(`/settlement-manage/manual?${queryString.stringify({
                                                ...params,
                                                page: 1,
                                                settlement_timeout: value,
                                            })}`
                                            );
                                        } else {
                                            navigate(`/settlement-manage/manual?${queryString.stringify({
                                                ...params,
                                                page: 1,
                                                settlement_timeout: undefined,
                                            })}`
                                            );

                                        }
                                    }}

                                />
                            </Flex>
                        )
                        }
                    </Col>
                </Row>
                <Row style={{ marginBottom: 20 }}>
                    <Col span={18}>
                        {!params?.is_old_order && params?.tab != 'PROCESSED' && (
                            <Flex align="center">
                                <div style={{ fontSize: 14, color: '#ff5629', marginRight: 8 }}>Đã chọn: {ids.length}</div>
                                <Button
                                    onClick={() => setDialogFinaliztion(true)}
                                    color="#ff5629"
                                    type="primary"
                                    disabled={ids?.length == 0}
                                    style={{ height: 40, fontSize: 14, width: 120, background: ids?.length == 0 ? '#6c757d80' : '', border: ids?.length == 0 ? '#6c757d80' : '', color: 'white' }}
                                >
                                    Quyết toán
                                </Button>
                            </Flex>
                        )}
                    </Col>
                    <Col span={6}>
                        <Flex gap={8}>
                            {params?.tab != 'PROCESSED' && <Button
                                color="#ff5629"
                                style={{ height: 40 }}
                                type="primary"
                                onClick={() => setImportFileDialog(true)}
                                className="mr-1 w-100 btn btn-primary btn-elevate">
                                Nhập file
                            </Button>}
                            <Button
                                style={{ height: 40 }}
                                color="#ff5629"
                                type="primary"
                                onClick={() => setExportFileDialog(true)}
                                className="w-100 btn btn-primary btn-elevate"
                            >
                                Xuất file
                            </Button>
                            <Button
                                style={{ height: 40 }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (params?.tab != 'PROCESSED') {
                                        navigate("/settlement-manage/exportfile-settlement-pending");
                                    } else {
                                        navigate("/settlement-manage/exportfile-settlement-processed");
                                    }
                                }}
                            >
                                <HistoryOutlined />
                            </Button>
                        </Flex>
                    </Col>
                </Row>

                {params?.tab == 'PROCESSED' && <>

                    <Tabs
                        className="custom-tab"
                        activeKey={params?.settlement_abnormal || ""}
                        type="card"
                        size={'small'}
                        items={subTab?.map(tab => {
                            return {
                                ...tab,
                                label: `${tab.label} (${countOrder(+tab?.key).count ?? '--'})`
                            }
                        })}
                        onChange={(item) => {
                            setIds([])
                            const queryParam = omit(params, ['settlement_abnormal_status'])
                            navigate(
                                `/settlement-manage/manual?${queryString.stringify({
                                    ...queryParam,
                                    page: 1,
                                    settlement_abnormal: item,
                                }
                                )}`
                            )
                        }}
                    />

                    {(find(subTab, { label: currentStatus })?.sub || []).length > 0 && (
                        <Flex gap={10} style={{ marginTop: 4, marginBottom: 4 }}>
                            {find(subTab, { label: currentStatus })?.sub?.map(
                                (sub_status, index) => (
                                    <span
                                        key={`sub-status-order-${index}`}
                                        className="mr-4 py-2 px-6 d-flex justify-content-between align-items-center"
                                        style={{
                                            borderRadius: 20,
                                            padding: '6px 10px',
                                            background:
                                                sub_status?.key == settlement_abnormal_status
                                                    ? "#ff6d49"
                                                    : "#828282",
                                            color: "#fff",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => {
                                            setIds([])
                                            navigate(
                                                `/settlement-manage/manual?${queryString.stringify({
                                                    ...params,
                                                    page: 1,
                                                    settlement_abnormal_status: sub_status?.key,
                                                })}`
                                            );
                                        }}
                                    >
                                        {`${sub_status?.name} (${countOrder(+sub_status?.key, true).count ?? '--'})`}
                                    </span>
                                )
                            )}
                        </Flex>
                    )}
                </>}

                <SettlementManualTable valuesRangeTime={valuesRangeTime} setValueRangeTime={valuesRangeTime} setIds={setIds}
                    ids={ids} data={data} loading={loading || loadingSummary} />

            </Card>
        </Spin>
    </SettlementWrapper>
};

export default memo(SettlementManual);