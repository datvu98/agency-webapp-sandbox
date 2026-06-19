import { Button, Col, DatePicker, Flex, Row, Select, Tooltip, Typography } from "antd";
import { useFullfillmentContext } from "app/contexts/FullfillmentContext";
import dayjs, { Dayjs } from "dayjs";
import { omit, pickBy } from "lodash";
import queryString from 'querystring';
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SERVICE_TYPES, SERVICE_TYPES_FULFILLMENT, SOURCE_TYPES } from "../FullfillmentConstants";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";

const { Text } = Typography;

type FullfillmentFilterProps = {
    baseRoute: string,
    onSearch: Function
}

const GHNFullfillmentFilter = ({ baseRoute, onSearch }: FullfillmentFilterProps) => {
    const { user } = useSelector(selectGlobalSlice);
    const { optionsStore, optionsChannel, variablesQuery, optionSmes } = useFullfillmentContext();
    const _optionsStore = optionsStore?.filter(s => s?.channel?.code == 'shopee' || s?.channel?.code == 'tiktok')
    const navigate = useNavigate();
    const location = useLocation();
    const params = queryString.parse(location.search.slice(1, 100000)) as any;

    const [isCollapseSideBar, setIsCollapseSideBar] = useState(!!document.querySelector('.layout-sider-mobile.ant-layout-sider-collapsed'));

    useEffect(() => {
        const sidebar = document.querySelector('.layout-sider-mobile');
        if (!sidebar) return;
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    // Check if the sidebar has collapsed class
                    setIsCollapseSideBar(sidebar.classList.contains('ant-layout-sider-collapsed'));
                }
            }
        });

        observer.observe(sidebar, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => {
            observer.disconnect();
        };
    }, []);

    const [valuesChannel, valuesStore, valuesRangeTime, valueSourceType, valueService, valueSme] = useMemo(() => {
        const dateFormat = 'YYYY/MM/DD HH:mm';
        const rangeTime = params?.from && params?.to
            ? [
                dayjs(dayjs.unix(params?.from).format(dateFormat), dateFormat),
                dayjs(dayjs.unix(params?.to).format(dateFormat), dateFormat),
            ]
            : [
                dayjs().startOf('day'),
                dayjs().endOf('day'),
            ]

        const defaultService = user?.category_code == 'fulfillment' ? [4] : [2]
        return [
            params?.channel_codes,
            params?.store_ids ? params?.store_ids?.split(',')?.map(item => +item) : [],
            rangeTime,
            params?.sources ? params?.sources?.split(',') : [],
            params?.services == 3 ? [] : (params?.services ? params?.services?.split(',')?.map(item => +item) : defaultService),
            params?.smes ? params?.smes?.split(',')?.map(item => +item) : []
        ]
    }, [variablesQuery, params, user]);

    const onChangeOptions = useCallback((values, type) => {
        const omitValues = values?.length > 0 ? [] : [type];
        const requestUrl = omit({
            ...params,
            ...(type == 'channel_codes' ? {
                store_ids: undefined
            } : {}),
            [type]: values.toString(),
        }, omitValues);

        const requestUrlPassed = pickBy(requestUrl, item => Boolean(item)) as any;

        navigate(`${baseRoute}?${queryString.stringify(requestUrlPassed).replaceAll('%2C', '\,')}`);
    }, [params, valuesStore, _optionsStore]);

    const onChangeSourceType = useCallback((values) => {
        const requestUrl = {
            ...params,
            sources: values.toString()
        };

        navigate(`${baseRoute}?${queryString.stringify(requestUrl).replaceAll('%2C', '\,')}`);
    }, [params, SOURCE_TYPES]);

    const onChangeService = useCallback((values) => {
        const requestUrl = {
            ...params,
            services: values ? values.toString() : 3
        };

        navigate(`${baseRoute}?${queryString.stringify(requestUrl).replaceAll('%2C', '\,')}`);
    }, [params, SERVICE_TYPES]);

    const onChangeSme = useCallback((values) => {
        const requestUrl = {
            ...params,
            smes: values.toString(),
            store_ids: undefined
        };

        navigate(`${baseRoute}?${queryString.stringify(requestUrl).replaceAll('%2C', '\,')}`);
    }, [params, optionSmes]);

    const mappedOptionsStore = useMemo(() => {
        if (!valuesChannel) return _optionsStore;
        return _optionsStore?.filter(store => valuesChannel == store?.channel?.code)
    }, [_optionsStore, valuesChannel]);

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
        const store = _optionsStore?.find(op => op?.value == item?.value);
        return <Flex gap={4} align="center">
            <img src={store?.channel?.logo_asset_url} style={{ width: 16, height: 16, borderRadius: 4 }} />
            <Text>{item?.label}</Text>
        </Flex>
    }, [_optionsStore]);

    const renderOptionsStore = useCallback((option) => {
        return <Flex gap={4} align="center">
            <img src={option?.data?.channel?.logo_asset_url} style={{ width: 16, height: 16, borderRadius: 4 }} />
            <Text>{option?.label}</Text>
        </Flex>
    }, []);

    const onChangeRangeTime = useCallback((dates: null | (Dayjs | null)[]) => {
        const omitValues = dates ? [] : ['from', 'to'];
        const rangeTimeParams = dates ? {
            from: dayjs(dates[0]).unix(),
            to: dayjs(dates[1]).unix()
        } : {};
        const requestUrl = omit({
            ...params,
            ...rangeTimeParams,
        }, omitValues);

        navigate(`${baseRoute}?${queryString.stringify(requestUrl).replaceAll('%2C', '\,')}`);
    }, [params])

    return (<div className={`${isCollapseSideBar && 'collapse'}`}>
        <Row gutter={20} align="middle" >
            <Col span={8}>
                <Row gutter={5} style={{ alignItems: 'center' }}>
                    <Col span={4} style={{ display: 'flex', justifyContent: 'center' }}>
                        <Text className="text-fit">Thời gian</Text>
                    </Col>
                    <Col span={20}>
                        <DatePicker
                            className="w-100"
                            disabledDate={(current) => {
                                return current && (current >= dayjs().add(1, 'day').startOf('day') || current < dayjs().subtract(89, 'day').startOf('day'));
                            }}
                            format={'DD/MM/YYYY'}
                            value={valuesRangeTime?.[0]}
                            onChange={(d) => {
                                let range_time: Dayjs[] = []
                                if (d) {
                                    range_time = [d.startOf('day'), d.endOf('day')]
                                }
                                else {
                                    range_time = [dayjs().startOf('day'), dayjs().endOf('day')]
                                }
                                onChangeRangeTime(range_time)
                            }}
                        />
                    </Col>
                </Row>
            </Col>

            <Col span={8}>
                <Row gutter={5} style={{ alignItems: 'center' }}>
                    <Col span={4} style={{ display: 'flex', justifyContent: 'center' }}>
                        <Text className="text-fit">UpS</Text>
                    </Col>
                    <Col span={20}>
                        <Select
                            mode="multiple"
                            className="w-100"
                            placeholder="Tất cả"
                            value={valueSme}
                            options={optionSmes}
                            allowClear={true}
                            onChange={(values) => onChangeSme(values)}
                            maxTagCount='responsive'
                            maxTagPlaceholder={(omittedValues) => {
                                const hiddenStores = optionSmes?.filter(sme => omittedValues.map((option) => option?.key).includes(sme?.value))
                                return (
                                    <Tooltip
                                        overlayStyle={{
                                            pointerEvents: 'none',
                                        }}
                                        title={hiddenStores?.map(item => item?.label).join(', ')}
                                    >
                                        <span>+ {omittedValues?.length} UpS</span>
                                    </Tooltip>
                                )
                            }}
                            showSearch
                            filterOption={(input, option) =>
                                option?.label?.toLowerCase().includes(input.toLowerCase())
                            }
                        />
                    </Col>
                </Row>
            </Col>
            {/* <Col span={8}>
                <Row gutter={5} style={{ alignItems: 'center' }}>
                    <Col span={6} style={{ display: 'flex', justifyContent: 'center' }}>
                        <Text className="text-fit">Nguồn phát sinh</Text>
                    </Col>
                    <Col span={18}>
                        <Select
                            mode="multiple"
                            className="w-100"
                            placeholder="Tất cả"
                            value={valueSourceType}
                            options={SOURCE_TYPES}
                            allowClear={true}
                            onChange={(values) => onChangeSourceType(values)}
                            maxTagCount='responsive'
                            maxTagPlaceholder={(omittedValues) => {
                                const hiddenSource = SOURCE_TYPES?.filter(source => omittedValues.map((option) => option?.key).includes(source?.value))
                                return (
                                    <Tooltip
                                        overlayStyle={{
                                            pointerEvents: 'none',
                                        }}
                                        title={hiddenSource?.map(item => item?.label).join(', ')}
                                    >
                                        <span>+ {omittedValues?.length} nguồn</span>
                                    </Tooltip>
                                )
                            }}
                        />
                    </Col>
                </Row>
            </Col> */}
        </Row>
        <Row style={{ marginTop: 10 }} gutter={20} align="middle" >
            <Col span={8}>
                <Row gutter={5} style={{ alignItems: 'center' }}>
                    <Col span={4} style={{ display: 'flex', justifyContent: 'center' }}>
                        <Text className="text-fit">Sàn <Text type="danger">*</Text></Text>
                    </Col>
                    <Col span={20}>
                        <Select
                            className="w-100"
                            placeholder="Chọn sàn"
                            value={valuesChannel}
                            allowClear={true}
                            options={optionsChannel?.filter(c => {
                                return c?.value == "shopee" || c?.value == 'tiktok';
                            })}
                            onChange={(values) => onChangeOptions(values, 'channel_codes')}
                            labelRender={item => renderLabelChannel(item)}
                            optionRender={option => renderOptionsChannel(option)}
                        />
                    </Col>
                </Row>
            </Col>
            <Col span={8}>
                <Row gutter={5} style={{ alignItems: 'center' }}>
                    <Col span={4} style={{ display: 'flex', justifyContent: 'center' }}>
                        <Text className="text-fit">Gian hàng</Text>
                    </Col>
                    <Col span={20}>
                        <Select
                            mode="multiple"
                            className="w-100"
                            placeholder={valuesChannel ? "Tất cả" : "Chọn gian hàng"}
                            value={valuesStore}
                            options={mappedOptionsStore}
                            onChange={(values) => onChangeOptions(values, 'store_ids')}
                            allowClear={true}
                            labelRender={item => renderLabelStore(item)}
                            optionRender={option => renderOptionsStore(option)}
                            maxTagCount='responsive'
                            maxTagPlaceholder={(omittedValues) => {
                                const hiddenStores = _optionsStore?.filter(store => omittedValues.map((option) => option?.key).includes(store?.value))
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
            </Col>
            <Col span={8}>
                <Row gutter={5} style={{ alignItems: 'center' }}>
                    <Col span={6} style={{ display: 'flex', justifyContent: 'center' }}>
                        <Text className="text-fit">Loại hình</Text>
                    </Col>
                    <Col span={18}>
                        <Select
                            className="w-100"
                            placeholder="Tất cả"
                            value={valueService}
                            options={user?.category_code == 'fulfillment' ? SERVICE_TYPES_FULFILLMENT : SERVICE_TYPES}
                            onChange={(values) => onChangeService(values)}
                            allowClear={true}
                        />
                    </Col>
                </Row>
            </Col>
        </Row>
        <Row style={{ marginTop: 10, marginRight: 0 }} gutter={20} justify='end'>
            <Button
                type="primary"
                className="btn-base"
                onClick={() => {
                    onSearch()
                }}
            >
                Tìm kiếm
            </Button>
        </Row>
    </div>
    )
};

export default memo(GHNFullfillmentFilter);