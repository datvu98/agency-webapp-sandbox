import React, { memo, useCallback, useMemo, useState, useEffect } from "react";
import { Col, DatePicker, Flex, Row, Select, TimeRangePickerProps, Tooltip, Typography } from "antd";
import { useReportContext } from "app/contexts/ReportContext";
import dayjs, { Dayjs } from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";
import queryString from "querystring";
import { omit, pickBy } from "lodash";
import { RangePickerProps } from "antd/es/date-picker";
import { CONTRACT_TYPES, SOURCE_TYPES } from "../ReportConstants";
import FilterField from "components/FilterField/FilterField";

const { Text } = Typography;
const { RangePicker } = DatePicker;

type ReportFilterV3Props = {
    baseRoute: string;
    previousDay: number;
    classNameFilter?: string;
    showHours?: boolean;
};

const ReportFilterV3 = ({ baseRoute, previousDay, showHours = false }: ReportFilterV3Props) => {
    const { optionsStore, optionsChannel, variablesQuery, optionSmes } = useReportContext();
    const navigate = useNavigate();
    const location = useLocation();
    const params = queryString.parse(location.search.slice(1, 100000)) as any;
    const [isCollapseSideBar, setIsCollapseSideBar] = useState(!!document.querySelector(".layout-sider-mobile.ant-layout-sider-collapsed"));

    useEffect(() => {
        const sidebar = document.querySelector(".layout-sider-mobile");
        if (!sidebar) return;
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    setIsCollapseSideBar(sidebar.classList.contains("ant-layout-sider-collapsed"));
                }
            }
        });
        observer.observe(sidebar, { attributes: true, attributeFilter: ["class"] });
        return () => { observer.disconnect(); };
    }, []);

    const rangePresets: TimeRangePickerProps["presets"] = [
        ...((showHours ? [{ label: "Hôm nay", value: [dayjs().startOf("day"), dayjs().endOf("hour")] }] : []) as any),
        { label: "7 ngày trước", value: [dayjs().add(showHours ? -6 : -7, "d"), dayjs().add(showHours ? 0 : -1, "d")] },
        { label: "14 ngày trước", value: [dayjs().add(showHours ? -13 : -14, "d"), dayjs().add(showHours ? 0 : -1, "d")] },
        { label: "30 ngày trước", value: [dayjs().add(showHours ? -29 : -30, "d"), dayjs().add(showHours ? 0 : -1, "d")] },
        { label: "90 ngày trước", value: [dayjs().add(showHours ? -89 : -90, "d"), dayjs().add(showHours ? 0 : -1, "d")] },
    ];

    const disabledDate: RangePickerProps["disabledDate"] = (current) => {
        if (showHours) return current && current > dayjs().endOf("day");
        return current && current >= dayjs().startOf("day");
    };

    const [valuesChannel, valuesStore, valuesRangeTime, valueSourceType, , valueSme, valueContract] = useMemo(() => {
        const dateFormat = "YYYY/MM/DD HH:mm";
        const rangeTime =
            params?.from && params?.to
                ? [dayjs(dayjs.unix(params?.from).format(dateFormat), dateFormat), dayjs(dayjs.unix(params?.to).format(dateFormat), dateFormat)]
                : [
                    dayjs(dayjs().subtract(showHours ? previousDay : previousDay + 1, "day").startOf("day").format(dateFormat), dateFormat),
                    dayjs(dayjs().subtract(showHours ? 0 : 1, "day").endOf("day").format(dateFormat), dateFormat),
                ];
        return [
            params?.channel_codes ? params?.channel_codes?.split(",") : [],
            params?.store_ids ? params?.store_ids?.split(",")?.map((item) => +item) : [],
            rangeTime,
            params?.sources ? params?.sources?.split(",") : [],
            params?.services ? params?.services?.split(",")?.map((item) => +item) : [],
            params?.smes ? params?.smes?.split(",")?.map((item) => +item) : [],
            params?.contract_type ? +params?.contract_type : 1,
        ];
    }, [variablesQuery, params]);

    const onChangeRangeTime = useCallback(
        (dates: null | (Dayjs | null)[]) => {
            const omitValues = dates ? [] : ["from", "to"];
            const rangeTimeParams = dates
                ? { from: dayjs(dates[0]).startOf("hour").unix(), to: dayjs(dates[1]).endOf("hour").unix() }
                : {};
            navigate(`${baseRoute}?${queryString.stringify(omit({ ...params, ...rangeTimeParams }, omitValues)).replaceAll("%2C", ",")}`);
        },
        [params]
    );

    const onChangeOptions = useCallback(
        (values, type) => {
            const omitValues = values?.length > 0 ? [] : [type];
            const storePassed = valuesStore?.filter((item) => {
                const store = optionsStore?.find((st) => st?.id == item);
                return values?.includes(store?.channel?.code);
            });
            const requestUrl = omit(
                { ...params, ...(type == "channel_codes" ? { store_ids: storePassed.toString() } : {}), [type]: values.toString() },
                omitValues
            );
            navigate(`${baseRoute}?${queryString.stringify(pickBy(requestUrl, (item) => Boolean(item)) as any).replaceAll("%2C", ",")}`);
        },
        [params, valuesStore, optionsStore]
    );

    const onChangeSourceType = useCallback(
        (values) => {
            navigate(`${baseRoute}?${queryString.stringify({ ...params, sources: values.toString() }).replaceAll("%2C", ",")}`);
        },
        [params]
    );

    const onChangeContract = useCallback(
        (value) => {
            navigate(`${baseRoute}?${queryString.stringify(omit({ ...params, contract_type: value }, ["store_ids"])).replaceAll("%2C", ",")}`);
        },
        [params]
    );

    const onChangeSme = useCallback(
        (values) => {
            navigate(`${baseRoute}?${queryString.stringify({ ...params, smes: values.toString(), store_ids: undefined }).replaceAll("%2C", ",")}`);
        },
        [params]
    );

    const mappedOptionsStore = useMemo(() => {
        if (valuesChannel?.length == 0) return optionsStore;
        return optionsStore?.filter((store) => valuesChannel.includes(store?.channel?.code));
    }, [optionsStore, valuesChannel]);

    const renderLabelChannel = useCallback((item) => {
        const channel = optionsChannel?.find((op) => op?.value == item?.value);
        return <Flex gap={4} align="center"><img src={channel?.logo_asset_url} style={{ width: 16, height: 16, borderRadius: 4 }} /><Text>{item?.label}</Text></Flex>;
    }, [optionsChannel]);

    const renderOptionsChannel = useCallback((option) => (
        <Flex gap={4} align="center"><img src={option?.data?.logo_asset_url} style={{ width: 16, height: 16, borderRadius: 4 }} /><Text>{option?.label}</Text></Flex>
    ), []);

    const renderLabelStore = useCallback((item) => {
        const store = optionsStore?.find((op) => op?.value == item?.value);
        return <Flex gap={4} align="center"><img src={store?.channel?.logo_asset_url} style={{ width: 16, height: 16, borderRadius: 4 }} /><Text>{item?.label}</Text></Flex>;
    }, [optionsStore]);

    const renderOptionsStore = useCallback((option) => (
        <Flex gap={4} align="center"><img src={option?.data?.channel?.logo_asset_url} style={{ width: 16, height: 16, borderRadius: 4 }} /><Text>{option?.label}</Text></Flex>
    ), []);

    return (
        <div className={`${isCollapseSideBar && "collapse"}`}>
            <Row gutter={[16, 12]} align="middle">
                <Col xs={24} lg={12} xxl={8}>
                    <FilterField label="Thời gian">
                        <RangePicker
                            showTime={{ format: "DD/MM/YYYY HH:mm" }}
                            presets={rangePresets}
                            disabledDate={disabledDate}
                            format="DD/MM/YYYY HH:mm"
                            value={valuesRangeTime as any}
                            onChange={onChangeRangeTime}
                        />
                    </FilterField>
                </Col>
                <Col xs={24} lg={12} xxl={8}>
                    <FilterField label="UpS">
                        <Select
                            mode="multiple"
                            placeholder="Tất cả"
                            value={valueSme}
                            options={optionSmes}
                            onChange={(values) => onChangeSme(values)}
                            maxTagCount="responsive"
                            maxTagPlaceholder={(omittedValues) => {
                                const hiddenStores = optionSmes?.filter((sme) => omittedValues.map((option) => option?.key).includes(sme?.value));
                                return (
                                    <Tooltip overlayStyle={{ pointerEvents: 'none' }} title={hiddenStores?.map((item) => item?.label).join(", ")}>
                                        <span>+ {omittedValues?.length} UpS</span>
                                    </Tooltip>
                                );
                            }}
                            showSearch
                            filterOption={(input, option) => option?.label?.toLowerCase().includes(input.toLowerCase())}
                        />
                    </FilterField>
                </Col>
                <Col xs={24} lg={12} xxl={8}>
                    <FilterField label="Nguồn phát sinh">
                        <Select
                            mode="multiple"
                            placeholder="Tất cả"
                            value={valueSourceType}
                            options={SOURCE_TYPES}
                            onChange={(values) => onChangeSourceType(values)}
                            maxTagCount="responsive"
                            maxTagPlaceholder={(omittedValues) => {
                                const hiddenSource = SOURCE_TYPES?.filter((source) => omittedValues.map((option) => option?.key).includes(source?.value));
                                return (
                                    <Tooltip overlayStyle={{ pointerEvents: 'none' }} title={hiddenSource?.map((item) => item?.label).join(", ")}>
                                        <span>+ {omittedValues?.length} nguồn</span>
                                    </Tooltip>
                                );
                            }}
                        />
                    </FilterField>
                </Col>
                <Col xs={24} lg={12} xxl={8}>
                    <FilterField label="Sàn">
                        <Select
                            mode="multiple"
                            placeholder="Tất cả"
                            value={valuesChannel}
                            options={optionsChannel}
                            onChange={(values) => onChangeOptions(values, "channel_codes")}
                            labelRender={(item) => renderLabelChannel(item)}
                            optionRender={(option) => renderOptionsChannel(option)}
                        />
                    </FilterField>
                </Col>
                <Col xs={24} lg={12} xxl={8}>
                    <FilterField label="Gian hàng">
                        <Select
                            mode="multiple"
                            placeholder="Tất cả"
                            value={valuesStore}
                            options={mappedOptionsStore}
                            onChange={(values) => onChangeOptions(values, "store_ids")}
                            labelRender={(item) => renderLabelStore(item)}
                            optionRender={(option) => renderOptionsStore(option)}
                            maxTagCount="responsive"
                            maxTagPlaceholder={(omittedValues) => {
                                const hiddenStores = optionsStore?.filter((store) => omittedValues.map((option) => option?.key).includes(store?.value));
                                return (
                                    <Tooltip overlayStyle={{ pointerEvents: 'none' }} title={hiddenStores?.map((item) => item?.label).join(", ")}>
                                        <span>+ {omittedValues?.length} gian hàng</span>
                                    </Tooltip>
                                );
                            }}
                            filterOption={(input, option) => option?.label?.toLowerCase().includes(input.toLowerCase())}
                        />
                    </FilterField>
                </Col>
                <Col xs={24} lg={12} xxl={8}>
                    <FilterField label="Trạng thái hợp đồng">
                        <Select
                            placeholder="Tất cả"
                            value={valueContract}
                            options={CONTRACT_TYPES}
                            onChange={(value) => onChangeContract(value)}
                        />
                    </FilterField>
                </Col>
            </Row>
        </div>
    );
};

export default memo(ReportFilterV3);
