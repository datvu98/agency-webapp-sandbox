import React, { memo, useCallback, useMemo, useState, useEffect } from "react";
import { Card, Col, DatePicker, Flex, Row, Select, TimeRangePickerProps, Typography, Tooltip } from "antd";
import { useFullfillmentContext } from "app/contexts/FullfillmentContext";
import dayjs, { Dayjs } from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";
import queryString from 'querystring';
import { omit, pickBy } from "lodash";
import { RangePickerProps } from "antd/es/date-picker";
import { SERVICE_TYPES, SERVICE_TYPES_FULFILLMENT, SOURCE_TYPES } from "../FullfillmentConstants";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
const getYearMonth = (date: Dayjs) => date.year() * 12 + date.month();

const { Text } = Typography;
const { RangePicker } = DatePicker;

type FullfillmentFilterProps = {
    baseRoute: string,
    previousDay: number,
    classNameFilter?: string,
    showHours?: boolean,
    isReport?: boolean
    filterStore?: boolean
}

const FullfillmentFilter = ({ baseRoute, previousDay, classNameFilter, isReport, filterStore }: FullfillmentFilterProps) => {
    const { user } = useSelector(selectGlobalSlice);
    const { optionsStore, optionsChannel, variablesQuery, optionSmes } = useFullfillmentContext();
    const _optionsStore = optionsStore?.filter(s => s?.channel?.code == 'shopee' || s?.channel?.code == 'tiktok');
    const _optionsChannel = optionsChannel?.filter(c => c?.code === 'shopee' || c?.code === 'tiktok');
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
    const rangePresets: TimeRangePickerProps['presets'] = [
        ...((!isReport ? [{
            label: 'Hôm nay', value: [dayjs()?.startOf('day'), dayjs()]
        }] : []) as any),
        { label: '7 ngày trước', value: [dayjs().add(!isReport ? -6 : -7, 'd')?.startOf('day'), (dayjs().add(!isReport ? 0 : -1, 'd'))?.endOf('day')] },
        ...(
            !!isReport ? [{ label: '14 ngày trước', value: [dayjs().add(-14, 'd')?.startOf('day'), dayjs().add(-1, 'd')?.endOf('day')] },
            { label: '30 ngày trước', value: [dayjs().add(-30, 'd')?.startOf('day'), dayjs().add(-1, 'd')?.endOf('day')] },
            { label: '90 ngày trước', value: [dayjs().add(-90, 'd')?.startOf('day'), dayjs().add(-1, 'd')?.endOf('day')] },]
                : []
        )
    ];

    const disabledDate: RangePickerProps['disabledDate'] = (current, { from, type }) => {
        const today = dayjs().startOf('day');
        const ninetyDaysAgo = today.subtract(89, 'days');
        if (from && isReport) {
            const minDate = from.subtract(13, 'days');
            const maxDate = from.add(13, 'days');
            switch (type) {
                case 'year':
                    return current.year() < minDate.year() || current.year() > maxDate.year();

                case 'month':
                    return (
                        getYearMonth(current) < getYearMonth(minDate) ||
                        getYearMonth(current) > getYearMonth(maxDate)
                    );

                default:
                    const isOutsideRange = !isReport && Math.abs(current?.startOf('day').diff(from?.startOf('days'), 'days')) >= 14;
                    const isInFuture = isReport ? current && (current >= dayjs().startOf('day') || current < ninetyDaysAgo) : current && current > dayjs().endOf('day');
                    return isOutsideRange || isInFuture;
            }
        }
        if (isReport) {
            return current && (current >= dayjs().startOf('day') || current < ninetyDaysAgo);
        }
        return current && (current >= dayjs().endOf('day') || current < ninetyDaysAgo)
    };

    const [valuesChannel, valuesStore, valuesRangeTime, valueSourceType, valueService, valueSme] = useMemo(() => {
        const dateFormat = 'YYYY/MM/DD HH:mm';
        let rangeTime = params?.from && params?.to
            ? [
                dayjs(dayjs.unix(params?.from).format(dateFormat), dateFormat),
                dayjs(dayjs.unix(params?.to).format(dateFormat), dateFormat),
            ]
            : [
                dayjs(dayjs().subtract(!isReport ? previousDay : previousDay + 1, 'day').format(dateFormat), dateFormat)?.startOf('day'),
                dayjs(dayjs().subtract(!isReport ? 0 : 1, 'day').format(dateFormat), dateFormat)?.endOf('day'),
            ]
        if (params?.tab == 'SLA' && (!params?.from || !params?.to)) {
            rangeTime = [
                dayjs(dayjs().subtract(29, 'day').format(dateFormat), dateFormat)?.startOf('day'),
                dayjs(dayjs().format(dateFormat), dateFormat)?.endOf('day'),
            ]
        }
        const defaultService = (user?.category_code == 'fulfillment' && !isReport) ? [4] : [2]
        return [
            params?.channel_codes ? params?.channel_codes?.split(',') : [],
            params?.store_ids ? params?.store_ids?.split(',')?.map(item => +item) : [],
            rangeTime, params?.sources ? params?.sources?.split(',') : [],
            params?.services == 3 ? [] : (params?.services ? params?.services?.split(',')?.map(item => +item) : defaultService),
            params?.smes ? params?.smes?.split(',')?.map(item => +item) : []
        ]
    }, [variablesQuery, params, user, isReport]);

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

    const onChangeRangeTime_v2 = useCallback((dates: null | (Dayjs | null)[]) => {
        const omitValues = dates ? [] : ['from', 'to'];
        const rangeTimeParams = dates ? {
            from: dayjs(dates[0]).startOf('day').unix(),
            to: dayjs(dates[1]).endOf('day').unix()
        } : {};
        const requestUrl = omit({
            ...params,
            ...rangeTimeParams,
        }, omitValues);

        navigate(`${baseRoute}?${queryString.stringify(requestUrl).replaceAll('%2C', '\,')}`);
    }, [params])

    const onChangeOptions = useCallback((values, type) => {
        const omitValues = values?.length > 0 ? [] : [type];
        console.log(omitValues)
        const requestUrl = omit({
            ...params,
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
        const omitValues = values?.length > 0 ? ['store_ids'] : ['smes', 'store_ids'];
        const requestUrl = omit({
            ...params,
            smes: values.toString(),
        }, omitValues);

        navigate(`${baseRoute}?${queryString.stringify(requestUrl).replaceAll('%2C', '\,')}`);
    }, [params, optionSmes]);

    const mappedOptionsStore = useMemo(() => {
        if (filterStore && valuesChannel?.length === 0) {
            return _optionsStore;
        }
        if (valuesChannel?.length == 0) return optionsStore;
        return optionsStore?.filter(store => valuesChannel.includes(store?.channel?.code));
    }, [optionsStore, _optionsStore, valuesChannel, filterStore]);

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
                        <Text className="text-fit">Thời gian</Text>
                    </Col>
                    {!isReport && <Col span={20}>
                        <RangePicker
                            className="w-100"
                            presets={rangePresets}
                            disabledDate={disabledDate}
                            format={'DD/MM/YYYY HH:mm'}
                            value={valuesRangeTime as any}
                            onChange={onChangeRangeTime}
                            showTime={{ format: 'HH:mm' }}
                        />
                    </Col>}
                    {!!isReport && <Col span={20}>
                        <RangePicker
                            className="w-100"
                            presets={rangePresets}
                            disabledDate={(current) => {
                                return current && current >= dayjs().startOf('day');
                            }}
                            format={'DD/MM/YYYY'}
                            value={valuesRangeTime as any}
                            onChange={onChangeRangeTime_v2}
                        />
                    </Col>}
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
                            options={filterStore ? _optionsChannel : optionsChannel}
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
                            options={(user?.category_code == 'fulfillment' && !isReport) ? SERVICE_TYPES_FULFILLMENT : SERVICE_TYPES}
                            onChange={(values) => onChangeService(values)}
                            allowClear={true}
                        />
                    </Col>
                </Row>
            </Col>

        </Row>
    </div>
    )
};

export default memo(FullfillmentFilter);