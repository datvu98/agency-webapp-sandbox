import React, { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import dayjs from "dayjs";
import _ from "lodash";
import { omitBy } from "lodash";
import { showAlert } from "utils/helper";
import { useNavigate } from "react-router-dom";
import { Button, Col, DatePicker, Flex, Modal, Row, Select, Space, Spin, Tooltip, Typography } from "antd";
import { useSettlementContext } from "app/contexts/SettlementContext";
import query_cfExportSettlementAggregate from "graphql/queries/query_cfExportSettlementAggregate";
import mutate_cfExportOrderSettlement from "graphql/mutations/mutate_cfExportOrderSettlement";
import { SERVICE_TYPES, SOURCE_TYPES } from "../SettlementConstant";
import query_smeStore from "graphql/queries/query_smeStore";
import query_scListConnectorStoreAgency from "graphql/queries/query_scListConnectorStoreAgency";

const DIFFERENCE_STATUS = [
    {
        value: 0,
        label: 'Tất cả',
    },
    {
        value: 2,
        label: 'Có',
    },
    {
        value: 1,
        label: "Không",
    },
]

const { RangePicker } = DatePicker;
const { Text } = Typography;

function ExportFileDialog({ status, show, onHide, params }) {

    const PENDING = 1
    const PROCESSED = 2
    const optionsSearchByTimes = [
        {
            value: 1,
            label: "Thời gian đơn hàng hoàn thành",
        },
        {
            value: 2,
            label: "Thời gian phát sinh đơn hàng",
        },
        {
            value: 3,
            label: "Thời gian quyết toán"
        }
    ];

    const [channel, setChannel] = useState<any>()
    const [store, setStore] = useState<any>()
    const [differenceStatus, setDifferenceStatus] = useState<any>(0)
    const [valueRangeTime, setValueRangeTime] = useState<any>(null);
    const [valueService, setValueService] = useState<any>(null);
    const [valueSourceType, setValueSourceType] = useState<any>(null);
    const [typeSearchTime, setTypeSearchTime] = useState(params?.tab == 'PROCESSED' ? 3 : 1)

    const { optionsChannel, optionsStore } = useSettlementContext()
    const navigate = useNavigate()
    const { data: dataStore, loading: loadingStore } = useQuery(query_smeStore, {
        fetchPolicy: 'cache-and-network',

    });

    const { data: dataScListConnectorStoreAgency } = useQuery(query_scListConnectorStoreAgency, {
        variables: {
            status: [0, 1]
        },
        fetchPolicy: 'cache-and-network'
    })
    useMemo(() => {
        if (!!params?.is_old_order) {
            setValueRangeTime([
                dayjs().subtract(96, "day").startOf("day"),
                dayjs().subtract(90, "day").startOf("day"),
            ]);
        } else {
            setValueRangeTime(null);
        }
    }, [params?.is_old_order]);

    const range_time = useMemo(() => {
        if (valueRangeTime) {
            let [time_from, time_to] = [
                dayjs(valueRangeTime[0])
                    .startOf("day")
                    .unix(),
                dayjs(valueRangeTime[1])
                    .endOf("day")
                    .unix(),
            ];
            return {
                time_from,
                time_to
            }
        }
    }, [valueRangeTime])

    const list_store = useMemo(() => {
        if (!channel?.length && !store?.length) {
            return optionsStore?.map(st => {
                return {
                    connector_channel_code: st?.connector_channel_code,
                    name_store: st?.name,
                    store_id: st?.id
                }
            })
        } else if (channel?.length && !store?.length) {
            const channel_code = channel?.map(cn => cn.code)
            return optionsStore?.map(st => {
                if (channel_code?.includes(st?.connector_channel_code)) {
                    return {
                        connector_channel_code: st?.connector_channel_code,
                        name_store: st?.name,
                        store_id: st?.id
                    }
                }
            }).filter(e => e)
        } else {
            return store?.map(st => {
                return !!st ? {
                    connector_channel_code: st?.connector_channel_code,
                    name_store: st?.name,
                    store_id: st?.id
                } : {}
            })
        }
    }, [store, channel])

    const time_type = useMemo(() => {
        if (!typeSearchTime) return
        return typeSearchTime
    }, [typeSearchTime])
    console.log(differenceStatus)
    const whereCondition = useMemo(() => {
        return {
            list_store: list_store,
            type: status == 'PENDING' ? PENDING : PROCESSED,
            payment_system: 'upbase',
            settlement_abnormal: status == 'PROCESSED' ? differenceStatus : null,
            time_from: range_time?.time_from,
            time_to: range_time?.time_to,
            time_type,
            fulfillment_by: valueService ? valueService : null,
            source: valueSourceType ? [valueSourceType] : ['manual', 'pos'],
            ...params?.is_old_order ? { is_old_order: 1 } : {}
        }
    }, [differenceStatus, list_store, range_time, params?.is_old_order, time_type, valueService, valueSourceType])

    const { data, loading } = useQuery(
        query_cfExportSettlementAggregate,
        {
            variables: {
                ...omitBy(whereCondition, (v) => v == 0 ? v : !v)
            },
            fetchPolicy: "cache-and-network",
            skip: !valueRangeTime || !list_store?.length
        },
    );

    const [cfExportOrderSettlement, { loading: loadingExport }] = useMutation(
        mutate_cfExportOrderSettlement,
        {
            variables: {
                ...omitBy(whereCondition, (v) => v == 0 ? v : !v)
            },
            onCompleted: (data) => {
                if (!!data?.cfExportOrderSettlement?.job_tracking_export) {
                    showAlert.success(data?.cfExportOrderSettlement.message || '');
                    onHide()
                    if (status == 'PENDING') {
                        navigate("/settlement-manage/exportfile-settlement-pending");
                        return;
                    }
                    navigate("/settlement-manage/exportfile-settlement-processed");
                    return
                }
                showAlert.error('Có lỗi xảy ra')
            },
        }
    );

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
    console.log(valueService)
    const renderLabelChannel = useCallback((item) => {
        const channel = optionsChannel?.find(op => op?.value == item?.value);
        return <Flex gap={4} align="center">
            <img src={channel?.logo_asset_url} style={{ width: 16, height: 16, borderRadius: 4 }} />
            <Text>{item?.label}</Text>
        </Flex>
    }, [optionsChannel]);

    const renderOptionsChannel = useCallback((option) => {
        return <Flex gap={4} align="center">
            <img src={option?.data?.logo_asset_url} style={{ width: 16, height: 16, borderRadius: 4 }} />
            <Text>{option?.label}</Text>
        </Flex>
    }, []);

    const renderLabelStore = useCallback((item) => {
        const store = optionsStore?.find(op => op?.value == item?.value);
        return <Flex gap={4} align="center">
            <img src={store?.channel?.logo_asset_url} style={{ width: 16, height: 16, borderRadius: 4 }} />
            <Text>{item?.label}</Text>
        </Flex>
    }, [optionsStore]);

    const renderOptionsStore = useCallback((option) => {
        return <Flex gap={4} align="center">
            <img src={option?.data?.channel?.logo_asset_url} style={{ width: 16, height: 16, borderRadius: 4 }} />
            <Text>{option?.label}</Text>
        </Flex>
    }, []);
    console.log(channel)
    return (
        <>
            <Spin spinning={loadingExport} />
            <Modal
                open={show}
                aria-labelledby="example-modal-sizes-title-lg"
                centered
                onCancel={onHide}
                title={status == 'PENDING' ? 'Xuất file phiếu chờ quyết toán' : 'Xuất file phiếu đã quyết toán'}
                footer={[<Flex gap={20} justify='center'>
                    <Button
                        type="primary"
                        onClick={onHide}
                        style={{ height: 40, width: 100, background: '#f3f6f9', color: "black" }}
                    >
                        Đóng
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => cfExportOrderSettlement()}
                        color="#ff5629"
                        style={{ height: 40, fontSize: 14, width: 100, color: 'white', opacity: loading || !+data?.cfExportSettlementAggregate?.count ? '0.6' : '1', backgroundColor: "#ff5629" }}
                        disabled={loading || !+data?.cfExportSettlementAggregate?.count}
                    >
                        Xác nhận
                    </Button>
                </Flex>]}
            >
                <p style={{ fontStyle: 'italic' }} >* Thông tin được tải về dưới dạng file excel</p>
                <Space className="w-100" direction="vertical" size={15}>
                    <Row>
                        <Col span={8}>Loại hình</Col>
                        <Col span={16} >
                            <Select options={SERVICE_TYPES}
                                className='w-100'
                                placeholder={'Tất cả'}
                                value={valueService}
                                allowClear={true}
                                onChange={value => {
                                    if (!value) {
                                        setValueService(null)
                                    } else {
                                        setValueService(value)
                                    }
                                }}

                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={8}>Nguồn phát sinh</Col>
                        <Col span={16} >
                            <Select options={SOURCE_TYPES}
                                className='w-100'
                                placeholder={'Tất cả'}
                                value={valueSourceType}
                                allowClear={true}
                                onChange={value => {
                                    if (!value) {
                                        setValueSourceType(null)
                                    } else {
                                        setValueSourceType(value)
                                    }
                                }}

                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={8}>Sàn</Col>
                        <Col span={16} >
                            <Select options={dataStore?.op_connector_channels?.map(_chanel => ({ ..._chanel, label: _chanel.name, value: _chanel.code }))}
                                className='w-100'
                                placeholder={'Tất cả'}
                                value={channel?.value}
                                allowClear={true}
                                mode="multiple"
                                onChange={value => {
                                    const selectedChannels = dataStore?.op_connector_channels?.filter(item => value?.includes(item?.code))
                                    setChannel(selectedChannels)
                                    // setChannel(value)
                                    setStore(null)
                                }}
                                labelRender={item => renderLabelChannel(item)}
                                optionRender={option => renderOptionsChannel(option)}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col span={8} >Gian hàng</Col>
                        <Col span={16}>
                            <Select
                                options={dataStore?.scAgencySaleStores?.data?.filter(store => {
                                    return dataScListConnectorStoreAgency?.scListConnectorStoreAgency?.map(item => item?.store_id)?.includes(store?.id)
                                })?.filter(_store => !channel || channel.length == 0 || channel.some(__ch => __ch.code == _store.connector_channel_code)).map(_store => ({ ..._store, channel: dataStore?.op_connector_channels?.find(__ch => __ch.code == _store.connector_channel_code), label: _store.name, value: _store.id }))}
                                className='w-100'
                                placeholder={'Tất cả'}
                                allowClear={true}
                                mode="multiple"
                                value={store}
                                onChange={value => {
                                    const selectedStores = optionsStore?.filter(item => value?.includes(item?.id))
                                    setStore(selectedStores)
                                }}
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
                                filterOption={(input, option: any) =>
                                    option?.label?.toLowerCase().includes(input.toLowerCase())
                                }
                            />
                        </Col>
                    </Row>

                    {status == 'PROCESSED' && (
                        <Row style={{ marginTop: 6 }}>
                            <Col span={8}>Chênh lệch</Col>
                            <Col span={16} >
                                <Select
                                    options={DIFFERENCE_STATUS}
                                    className="w-100 custom-select-order"
                                    style={{ padding: 0 }}
                                    value={DIFFERENCE_STATUS.find(
                                        (_op) => _op.value === differenceStatus
                                    )}
                                    onChange={(value) => {
                                        setDifferenceStatus(value)
                                    }}

                                />
                            </Col>
                        </Row>
                    )}

                    <Row>
                        <Col span={8}>
                            <Select
                                options={params?.tab == 'PROCESSED' ? optionsSearchByTimes : optionsSearchByTimes?.slice(0, 2)}
                                className="w-100 custom-select-order"
                                style={{ padding: 0 }}
                                value={optionsSearchByTimes.find(
                                    (_op) => _op.value == typeSearchTime
                                )}
                                onChange={(value) => {
                                    setTypeSearchTime(value?.value);
                                }}
                            />
                        </Col>
                        <Col span={16}>
                            <RangePicker
                                className="w-100"
                                // presets={rangePresets}
                                disabledDate={disabledFutureDate}
                                format={'DD/MM/YYYY'}
                                value={valueRangeTime as any}
                                onChange={values => {
                                    setValueRangeTime(values)
                                }}
                            />


                        </Col>
                    </Row>
                    {(valueRangeTime && list_store?.length) ? (
                        <Row>
                            <Col span={8}>Tổng phiếu cần xuất</Col>
                            <Col span={16}>
                                <strong>
                                    {loading ? (<Spin spinning={true}></Spin>) : (+data?.cfExportSettlementAggregate?.count || 0)}
                                </strong> phiếu
                            </Col>
                        </Row>
                    ) : null}
                </Space>
            </Modal >
        </>
    );
}

export default ExportFileDialog;
