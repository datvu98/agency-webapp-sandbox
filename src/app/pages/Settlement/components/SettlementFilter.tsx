import React, { memo, useCallback, useMemo, useState, useEffect } from "react";
import { Card, Col, DatePicker, Flex, Row, Select, TimeRangePickerProps, Typography, Tooltip } from "antd";
import { useSettlementContext } from "app/contexts/SettlementContext";
import dayjs, { Dayjs } from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";
import queryString from 'querystring';
import { omit, pickBy } from "lodash";
import { RangePickerProps } from "antd/es/date-picker";
import { SERVICE_TYPES, SOURCE_TYPES } from "../SettlementConstant";
const getYearMonth = (date: Dayjs) => date.year() * 12 + date.month();

const { Text } = Typography;

type SettlementFilterProps = {
    baseRoute: string,
}

const SettlementFilter = ({ baseRoute }: SettlementFilterProps) => {
    const { optionsStore, optionsChannel, optionSmes } = useSettlementContext();
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

    const [valuesChannel, valuesStore, valueSourceType, valueService, valueSme] = useMemo(() => {

        return [
            params?.channel_codes ? params?.channel_codes?.split(',') : [],
            params?.store_ids ? params?.store_ids?.split(',')?.map(item => +item) : [],
            params?.sources ? params?.sources?.split(',') : [],
            params?.services == 3 ? [] : (params?.services ? params?.services?.split(',')?.map(item => +item) : [2]),
            params?.smes ? params?.smes?.split(',')?.map(item => +item) : []
        ]
    }, [params]);

    const onChangeOptions = useCallback((values, type) => {
        const omitValues = values?.length > 0 ? [] : [type];
        const requestUrl = omit({
            ...params,
            page: 1,
            ...(type == 'channel_codes' ? {
                store_ids: undefined
            } : {}),
            [type]: values.toString(),
        }, omitValues);

        const requestUrlPassed = pickBy(requestUrl, item => Boolean(item)) as any;

        navigate(`${baseRoute}?${queryString.stringify(requestUrlPassed).replaceAll('%2C', '\,')}`);
    }, [params, valuesStore, optionsStore]);

    const onChangeSourceType = useCallback((values) => {
        const requestUrl = {
            ...params,
            page: 1,
            sources: values ? values.toString() : undefined
        };

        navigate(`${baseRoute}?${queryString.stringify(requestUrl).replaceAll('%2C', '\,')}`);
    }, [params, SOURCE_TYPES]);

    const onChangeService = useCallback((values) => {
        const requestUrl = {
            ...params,
            page: 1,
            services: values ? values.toString() : 3
        };

        navigate(`${baseRoute}?${queryString.stringify(requestUrl).replaceAll('%2C', '\,')}`);
    }, [params, SERVICE_TYPES]);

    const onChangeSme = useCallback((values) => {
        const requestUrl = {
            ...params,
            page: 1,
            smes: values.toString(),
            store_ids: undefined
        };

        navigate(`${baseRoute}?${queryString.stringify(requestUrl).replaceAll('%2C', '\,')}`);
    }, [params, optionSmes]);

    const mappedOptionsStore = useMemo(() => {
        if (valuesChannel?.length == 0) return optionsStore;

        return optionsStore?.filter(store => valuesChannel.includes(store?.channel?.code))
    }, [optionsStore, valuesChannel]);

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

    return (<div className={`${isCollapseSideBar && 'collapse'}`}>
        <Row gutter={20} align="middle" >
            <Col span={8}>
                <Row gutter={5} style={{ alignItems: 'center' }}>
                    <Col span={4} style={{ display: 'flex', justifyContent: 'center' }}>
                        <Text className="text-fit">Loại hình</Text>
                    </Col>
                    <Col span={20}>

                        <Select
                            className="w-100"
                            placeholder="Tất cả"
                            value={valueService}
                            options={SERVICE_TYPES}
                            onChange={(values) => onChangeService(values)}
                            allowClear={true}
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
            <Col span={8}>
                <Row gutter={5} style={{ alignItems: 'center' }}>
                    <Col span={6} style={{ display: 'flex', justifyContent: 'center' }}>
                        <Text className="text-fit">Nguồn phát sinh</Text>
                    </Col>
                    <Col span={18}>
                        <Select
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
            </Col>

        </Row>
        <Row style={{ marginTop: 10 }} gutter={20} align="middle" >
            <Col span={8}>
                <Row gutter={5} style={{ alignItems: 'center' }}>
                    <Col span={4} style={{ display: 'flex', justifyContent: 'center' }}>
                        <Text className="text-fit">Sàn</Text>
                    </Col>
                    <Col span={20}>
                        <Select
                            mode="multiple"
                            className="w-100"
                            placeholder="Tất cả"
                            value={valuesChannel}
                            allowClear={true}
                            options={optionsChannel}
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
                            placeholder="Tất cả"
                            value={valuesStore}
                            options={mappedOptionsStore}
                            onChange={(values) => onChangeOptions(values, 'store_ids')}
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
            </Col>

        </Row>
    </div>
    )
};

export default memo(SettlementFilter);