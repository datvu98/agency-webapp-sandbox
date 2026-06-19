import { useMutation, useQuery } from "@apollo/client";
import { Select, Card, Tag, Table, Col, Popover, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image, Input, Form, Dropdown, InputNumber } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { options, optionsOperator } from "../../CommissionCreate/utils";
import FormulaInput from "../../CommissionCreate/components/FormulaInput";
import { formatNumberToCurrency } from "utils/helper";

const { Text } = Typography;

const CardCommission = ({ dataStore, config, configs, index }: any) => {
    const renderOptionsStore = useCallback((option) => {
        const store = dataStore?.find(op => op?.value == option?.value);
        return <Flex gap={4} align="center">
            <img src={store?.logo} style={{ width: 16, height: 16, borderRadius: 4 }} />
            <Text>{option?.label}</Text>
        </Flex>
    }, [dataStore]);
    const renderLabelStore = useCallback((item) => {
        const store = dataStore?.find(op => op?.value == item?.value);
        return <Flex gap={4} align="center">
            <img src={store?.logo} style={{ width: 16, height: 16, borderRadius: 4 }} />
            <Text>{item?.label}</Text>
        </Flex>
    }, [dataStore]);
    return (
        <>
            <Card>
                <Text strong>Điều kiện đạt hoa hồng</Text>
                {config?.groups?.length &&
                    config?.groups[0]?.formula_rules?.map((condition, _index) => {
                        return <Row gutter={10} align="bottom" style={{ marginBottom: 10 }}>
                            <Col span={1}>{_index != 0 && 'Và'}</Col>
                            <Col span={6}>
                                <Select
                                    className="w-100 custom-disabled-select"
                                    value={options?.find(op => op?.value == condition?.applied_indicator)}
                                    options={options}
                                    allowClear={false}
                                    disabled={true}
                                />
                            </Col>
                            <Col span={6}>
                                <Select
                                    className="w-100 custom-disabled-select"
                                    placeholder="Tất cả"
                                    value={optionsOperator?.find(op => op?.value == condition?.comparison_operators)}
                                    options={optionsOperator}
                                    allowClear={false}
                                    disabled={true}
                                />
                            </Col>
                            <Col span={5}>
                                <Input
                                    placeholder="Nhập giá trị"
                                    value={formatNumberToCurrency(condition?.operands, 3)}
                                    disabled={true}
                                    className='custom-disabled-input'
                                />
                            </Col>
                            <Col span={6}>
                                <Flex vertical>
                                    <Text>Gian hàng áp dụng</Text>
                                    <Select
                                        mode="multiple"
                                        className="w-100 custom-disabled-select"
                                        placeholder="Tất cả"
                                        value={dataStore?.filter(op => condition?.stores?.includes(op?.value))}
                                        options={dataStore}
                                        optionRender={option => renderOptionsStore(option)}
                                        labelRender={item => renderLabelStore(item)}
                                        disabled={true}
                                    />
                                </Flex>
                            </Col>
                        </Row>
                    })
                }
            </Card>
            <Card>
                <Text strong>Hoa hồng đạt được</Text>
                <Row gutter={10} align="bottom" style={{ marginTop: 10 }}>
                    <Col span={24}>
                        <Text>Nhập công thức</Text>
                    </Col>
                    <Col span={8} style={{ marginTop: 10 }}>
                        <FormulaInput
                            tags={options}
                            placeholder="Nhập giá trị"
                            value={config?.groups[0]?.formula_result}
                            disabled={true}
                        />
                    </Col>
                    <Col span={16}>
                        <Flex vertical>
                            <Text>Gian hàng áp dụng</Text>
                            <Select
                                mode="multiple"
                                className="w-100 custom-disabled-select"
                                placeholder="Tất cả"
                                value={dataStore?.filter(op => config?.groups[0]?.stores?.includes(op?.value))}
                                options={dataStore}
                                optionRender={option => renderOptionsStore(option)}
                                labelRender={item => renderLabelStore(item)}
                                disabled={true}
                            />
                        </Flex>
                    </Col>
                </Row>
            </Card>
            {config?.groups?.length > 1 &&
                config?.groups?.slice(1)?.map((item, _i) => {
                    return <Card style={{ marginTop: 10, backgroundColor: '#FFB347' }} bodyStyle={{ padding: '12px 0 0' }}>
                        <Flex style={{ marginBottom: 12, marginLeft: 12 }} justify="between">
                            <Text strong>Điều kiện hoặc</Text>
                        </Flex>
                        <Card>
                            <Text strong>Điều kiện đạt hoa hồng</Text>
                            {configs[index]?.groups[_i + 1]?.formula_rules?.map((condition, _index) => {
                                return <Row gutter={10} align="bottom" style={{ marginBottom: 10 }}>
                                    <Col span={1}>{_index != 0 && 'Và'}</Col>
                                    <Col span={6}>
                                        <Select
                                            className="w-100 custom-disabled-select"
                                            value={options?.find(op => op?.value == condition?.applied_indicator)}
                                            options={options}
                                            allowClear={false}
                                            disabled={true}
                                        />
                                    </Col>
                                    <Col span={6}>
                                        <Select
                                            className="w-100 custom-disabled-select"
                                            placeholder="Tất cả"
                                            value={optionsOperator?.find(op => op?.value == condition?.comparison_operators)}
                                            options={optionsOperator}
                                            disabled={true}
                                        />
                                    </Col>
                                    <Col span={5}>
                                        <Input
                                            placeholder="Nhập giá trị"
                                            value={formatNumberToCurrency(condition?.operands, 3)}
                                            disabled={true}
                                            className='custom-disabled-input'
                                        />
                                    </Col>
                                    <Col span={6}>
                                        <Flex vertical>
                                            <Text>Gian hàng áp dụng</Text>
                                            <Select
                                                mode="multiple"
                                                className="w-100 custom-disabled-select"
                                                placeholder="Tất cả"
                                                value={dataStore?.filter(op => condition?.stores?.includes(op?.value))}
                                                options={dataStore}
                                                optionRender={option => renderOptionsStore(option)}
                                                labelRender={item => renderLabelStore(item)}
                                                disabled={true}
                                            />
                                        </Flex>
                                    </Col>
                                </Row>
                            })}
                        </Card>
                        <Card>
                            <Text strong>Hoa hồng đạt được</Text>
                            <Row gutter={10} align="bottom" style={{ marginTop: 10 }}>
                                <Col span={24}>
                                    <Text>Nhập công thức</Text>
                                </Col>
                                <Col span={8} style={{ marginTop: 10 }}>
                                    <FormulaInput
                                        tags={options}
                                        placeholder="Nhập giá trị"
                                        value={configs[index]?.groups[_i + 1]?.formula_result}
                                        disabled={true}
                                    />
                                </Col>
                                <Col span={16}>
                                    <Flex vertical>
                                        <Text>Gian hàng áp dụng</Text>
                                        <Select
                                            mode="multiple"
                                            className="w-100 custom-disabled-select"
                                            placeholder="Tất cả"
                                            value={dataStore?.filter(op => configs[index]?.groups[_i + 1]?.stores?.includes(op?.value))}
                                            options={dataStore}
                                            optionRender={option => renderOptionsStore(option)}
                                            labelRender={item => renderLabelStore(item)}
                                            disabled={true}
                                        />
                                    </Flex>
                                </Col>
                            </Row>
                        </Card>
                    </Card>
                })
            }
            {
                !!config?.extended_groups?.length && config?.extended_groups?.map((extend, _index) => {
                    return <Card style={{ marginTop: 10, backgroundColor: '#B4D7EE' }} bodyStyle={{ padding: '12px 0 0' }}>
                        <Flex style={{ marginBottom: 12, marginLeft: 12 }} justify="between">
                            <Text strong>Điều kiện phụ</Text>
                        </Flex>
                        <Card>
                            <Text strong>Điều kiện đạt hoa hồng</Text>
                            {extend?.formula_rules?.length &&
                                extend?.formula_rules?.map((condition, _ii) => {
                                    return <Row gutter={10} align="bottom" style={{ marginBottom: 10 }}>
                                        <Col span={1}>{_index != 0 && 'Và'}</Col>
                                        <Col span={6}>
                                            <Select
                                                className="w-100 custom-disabled-select"
                                                value={options?.find(op => op?.value == condition?.applied_indicator)}
                                                options={options}
                                                disabled={true}
                                            />
                                        </Col>
                                        <Col span={6}>
                                            <Select
                                                className="w-100 custom-disabled-select"
                                                placeholder="Tất cả"
                                                value={optionsOperator?.find(op => op?.value == condition?.comparison_operators)}
                                                options={optionsOperator}
                                                disabled={true}
                                            />
                                        </Col>
                                        <Col span={5}>
                                            <Input
                                                placeholder="Nhập giá trị"
                                                value={formatNumberToCurrency(condition?.operands, 3)}
                                                disabled={true}
                                                className='custom-disabled-input'
                                            />
                                        </Col>
                                        <Col span={6}>
                                            <Flex vertical>
                                                <Text>Gian hàng áp dụng</Text>
                                                <Select
                                                    mode="multiple"
                                                    className="w-100 custom-disabled-select"
                                                    placeholder="Tất cả"
                                                    value={dataStore?.filter(op => condition?.stores?.includes(op?.value))}
                                                    options={dataStore}
                                                    optionRender={option => renderOptionsStore(option)}
                                                    labelRender={item => renderLabelStore(item)}
                                                    disabled={true}
                                                />
                                            </Flex>
                                        </Col>
                                    </Row>
                                })
                            }
                        </Card>
                        <Card>
                            <Text strong>Hoa hồng đạt được</Text>
                            <Row gutter={10} align="bottom" style={{ marginTop: 10 }}>
                                <Col span={24}>
                                    <Text>Nhập công thức</Text>
                                </Col>
                                <Col span={8} style={{ marginTop: 10 }}>
                                    <FormulaInput
                                        tags={options}
                                        placeholder="Nhập giá trị"
                                        value={extend?.formula_result}
                                        disabled={true}
                                    />
                                </Col>
                                <Col span={16}>
                                    <Flex vertical>
                                        <Text>Gian hàng áp dụng</Text>
                                        <Select
                                            mode="multiple"
                                            className="w-100 custom-disabled-select"
                                            placeholder="Tất cả"
                                            value={dataStore?.filter(op => extend?.stores?.includes(op?.value))}
                                            options={dataStore}
                                            optionRender={option => renderOptionsStore(option)}
                                            labelRender={item => renderLabelStore(item)}
                                            disabled={true}
                                        />
                                    </Flex>
                                </Col>
                            </Row>
                        </Card>
                    </Card>
                })
            }
        </>
    )
};

export default CardCommission;
