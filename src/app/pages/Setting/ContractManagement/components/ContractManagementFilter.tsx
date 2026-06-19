import React, { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SearchProps } from "antd/es/input";
import { Typography, Input, DatePicker, Select, Flex, Tooltip, Row, Col } from "antd";
import queryString from "querystring";
import type { Dayjs } from "dayjs";
import _, { omit } from "lodash";

import { CONTRACT_STATUS_OPTIONS } from "../constants";

const { Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

type ContractManagementFilterProps = {
    id: number;
    optionsStore: any[];
};

const ContractManagementFilter = ({ id, optionsStore }: ContractManagementFilterProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = queryString.parse(location.search.slice(1)) as any;

    const [searchText, setSearchText] = useState(params?.q || "");
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

    const onSearch: SearchProps["onSearch"] = (value, _e, info) => {
        navigate(
            `/settings/smes/contract-management/${id}?${queryString.stringify({
                ...params,
                q: value,
            })}`.replaceAll("%2C", ",")
        )
    }

    const onChangeStore = (values: number[]) => {
        navigate(
            `/settings/smes/contract-management/${id}?${queryString.stringify({
                ...params,
                store_ids: values.join(","), 
            })}`.replaceAll("%2C", ",")
        );
    };

    const renderLabelStore = useCallback((item) => {
        const store = optionsStore?.find(op => op?.value == item?.value);
        return <Flex gap={4} align="center">
            <img src={store?.channel?.logo_asset_url} style={{ width: 16, height: 16, borderRadius: 4 }} />
            <Text>{store?.label || item?.value}</Text>
        </Flex>
    }, [optionsStore]);

    const renderOptionsStore = useCallback((option) => {
        return <Flex gap={4} align="center">
            <img src={option?.data?.channel?.logo_asset_url} style={{ width: 16, height: 16, borderRadius: 4 }} />
            <Text>{option?.label}</Text>
        </Flex>
    }, []);

    return (
        <>
            <Row gutter={20} style={{ marginBottom: 30 }}>
                {/* Search */}
                <Col span={6}>
                    <Flex className="search-field" align="center">
                        <Search
                            placeholder="Tìm theo tên hợp đồng" 
                            onSearch={onSearch}
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e?.target?.value);
                            }}
                            onBlur={(e) => {
                                navigate(
                                    `/settings/smes/contract-management/${id}?${queryString.stringify({
                                        ...params,
                                        q: e.target.value,
                                    })}`.replaceAll("%2C", ",")
                                );
                            }}
                        />
                    </Flex>
                </Col>

                {/* Date Range */}
                <Col span={6}>
                    <RangePicker
                        className="custom-border w-100"
                        value={dateRange}
                        format="DD/MM/YYYY"
                        onChange={(values) => {
                            if ( values && values.length === 2 && values[0] && values[1]) {
                                const [start, end] = values as [Dayjs, Dayjs];

                                navigate(
                                    `/settings/smes/contract-management/${id}?${queryString.stringify(
                                        {
                                            ...params,
                                            gt: start.unix(),
                                            lt: end.unix(),
                                        }
                                    )}`.replaceAll("%2C", ",")
                                );

                                setDateRange([start, end]);
                            } else {
                                navigate(
                                    `/settings/smes/contract-management/${id}?${queryString.stringify(
                                        omit(params, ["gt", "lt"])
                                    )}`
                                );
                                setDateRange(null);
                            }
                        }}
                    />
                </Col>
                <Col span={6}>
                    <Select
                        className="w-100"
                        placeholder="Chọn trạng thái hợp đồng"
                        showSearch
                        optionFilterProp="label"
                        mode="multiple"
                        options={CONTRACT_STATUS_OPTIONS}
                        allowClear
                        onChange={(val) => {
                            navigate(
                                `/settings/smes/contract-management/${id}?${queryString.stringify({
                                    ...params,
                                    statuses: val.join(","),
                                })}`.replaceAll("%2C", ",")
                            );
                        }}
                        value={ params?.statuses ? params?.statuses.split(",").map(Number): [] }
                    />
                </Col>
                <Col span={6}>
                    <Select
                        mode="multiple"
                        className="w-100"
                        placeholder={"Chọn gian hàng"}
                        options={optionsStore}
                        allowClear
                        value={params?.store_ids ? params?.store_ids.split(",").map(Number) : []}
                        onChange={onChangeStore}
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
                    />
                </Col>
            </Row>
        </>
    );
};

export default ContractManagementFilter;
