import { useMutation, useQuery } from "@apollo/client";
import { Select, Card, Tag, Col, Flex, Row, Typography, Input } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useState } from "react";
import FormulaInput from "./components/FormulaInput";
import { options, optionsOperator } from "./utils";
import { showAlert } from "utils/helper";

const { Text } = Typography;

const CardCommission = ({ dataStore, config, configs, setConfigs, index }: any) => {
    const renderOptionsStore = useCallback((option) => {
        const store = dataStore?.find(op => op?.value == option?.value);
        return <Flex gap={4} align="center">
            <img src={store?.logo} style={{ width: 16, height: 16, borderRadius: 4 }} />
            <Text>{option?.label}</Text>
        </Flex>;
    }, [dataStore]);

    const renderLabelStore = useCallback((item) => {
        const store = dataStore?.find(op => op?.value == item?.value);
        return <Flex gap={4} align="center">
            <img src={store?.logo} style={{ width: 16, height: 16, borderRadius: 4 }} />
            <Text>{item?.label}</Text>
        </Flex>;
    }, [dataStore]);

    const handleDelete = (groupIndex: number, ruleIndex: number, isExtended: boolean = false) => {
        let newConfigs = [...configs];
        if (isExtended) {
            newConfigs[index].extended_groups[groupIndex].formula_rules = newConfigs[index].extended_groups[groupIndex].formula_rules.filter((_, i) => i !== ruleIndex);
            if (newConfigs[index].extended_groups[groupIndex].formula_rules?.length == 0) {
                newConfigs[index].extended_groups = newConfigs[index].extended_groups?.filter((group, i) => i !== groupIndex);
            }
        } else {
            newConfigs[index].groups[groupIndex].formula_rules = newConfigs[index].groups[groupIndex].formula_rules.filter((_, i) => i !== ruleIndex);
            if (newConfigs[index].groups[groupIndex].formula_rules?.length == 0) {
                newConfigs[index].groups = newConfigs[index].groups?.filter((group, i) => i !== groupIndex);
            }
        }
        setConfigs(newConfigs);
    };

    const handleFormulaChange = (value: string, groupIndex: number, isExtended: boolean = false) => {
        let newConfigs = [...configs];
        if (isExtended) {
            newConfigs[index].extended_groups[groupIndex].formula_result = value;
        } else {
            newConfigs[index].groups[groupIndex].formula_result = value;
        }
        setConfigs(newConfigs);
    };

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
                                    className="w-100"
                                    value={options?.find(op => op?.value === condition?.applied_indicator)}
                                    options={options}
                                    allowClear={false}
                                    onChange={(value) => {
                                        let newConfigs = [...configs];
                                        newConfigs[index].groups[0].formula_rules[_index].applied_indicator = value;
                                        setConfigs(newConfigs);
                                    }}
                                />
                            </Col>
                            <Col span={6}>
                                <Select
                                    className="w-100"
                                    placeholder="Tất cả"
                                    value={optionsOperator?.find(op => op?.value === condition?.comparison_operators)}
                                    options={optionsOperator}
                                    allowClear={false}
                                    onChange={(value) => {
                                        let newConfigs = [...configs];
                                        newConfigs[index].groups[0].formula_rules[_index].comparison_operators = value;
                                        setConfigs(newConfigs);
                                    }}
                                />
                            </Col>
                            <Col span={4}>
                                <Input
                                    placeholder="Nhập giá trị"
                                    value={condition?.operands}
                                    min={0}
                                    onChange={(e) => {
                                        const inputValue = e?.target?.value;
                                        const reg = /^-?\d{0,11}(\.\d{0,6})?$/;
                                        if (inputValue === '' || reg.test(inputValue)) {
                                            let newConfigs = [...configs];
                                            newConfigs[index].groups[0].formula_rules[_index].operands = e?.target?.value;
                                            setConfigs(newConfigs);
                                        }
                                    }}
                                    onBlur={() => {
                                        let newConfigs = [...configs];
                                        let operandValue = parseFloat(condition?.operands); // Convert to number when user finishes typing
                                        newConfigs[index].groups[0].formula_rules[_index].operands = isNaN(operandValue) ? 0 : operandValue;
                                        setConfigs(newConfigs);
                                    }}
                                />
                            </Col>
                            <Col span={6}>
                                <Flex vertical>
                                    <Text>Gian hàng áp dụng</Text>
                                    <Select
                                        mode="multiple"
                                        className="w-100"
                                        placeholder="Chọn gian hàng"
                                        value={dataStore?.filter(op => condition?.stores?.includes(op?.value))}
                                        options={dataStore}
                                        allowClear={true}
                                        optionRender={option => renderOptionsStore(option)}
                                        labelRender={item => renderLabelStore(item)}
                                        onChange={(values) => {
                                            let newConfigs = [...configs];
                                            newConfigs[index].groups[0].formula_rules[_index].stores = values;
                                            setConfigs(newConfigs);
                                        }}
                                    />
                                </Flex>
                            </Col>
                            {config?.groups[0]?.formula_rules?.length > 1 && <Col span={1}>
                                <Text
                                    style={{ color: '#ff5629', cursor: 'pointer' }}
                                    onClick={() => handleDelete(0, _index)}
                                >Xóa</Text>
                            </Col>}
                        </Row>;
                    })
                }
                <Flex justify="center" vertical align="start">
                    {config?.groups[0]?.formula_rules?.length < 5 && <Text
                        style={{ color: '#ff5629', cursor: 'pointer', marginTop: 10 }}
                        onClick={() => {
                            let newConfigs = [...configs];
                            newConfigs[index].groups[0].formula_rules.push({ applied_indicator: 'nmv', comparison_operators: '>', operands: 0, stores: [] });
                            setConfigs(newConfigs);
                        }}
                    >+ Thêm điều kiện và</Text>}
                    {config?.groups?.length <= 4 && <Text style={{ color: '#ff5629', cursor: 'pointer', marginTop: 4 }}
                        onClick={() => {
                            let newConfigs = [...configs];
                            newConfigs[index].groups.push({
                                formula_result: '',
                                formula_rules: [
                                    {
                                        applied_indicator: 'nmv',
                                        comparison_operators: '>',
                                        operands: 0,
                                        stores: []
                                    }
                                ],
                                stores: configs[index]?.groups[0]?.stores
                            });
                            setConfigs(newConfigs);
                        }}
                    >+ Thêm điều kiện hoặc</Text>}
                </Flex>
            </Card>
            <Card>
                <Text strong>Hoa hồng đạt được</Text>
                <Row gutter={10} align="top" style={{ marginTop: 10 }}>
                    <Col span={8}>
                        <Text>Nhập công thức</Text>
                        <FormulaInput
                            value={config?.groups[0]?.formula_result}
                            onChange={(value) => handleFormulaChange(value, 0)}
                            tags={options}
                        />
                    </Col>
                    <Col span={16}>
                        <Flex vertical>
                            <Text>Gian hàng áp dụng</Text>
                            <Select
                                mode="multiple"
                                className="w-100"
                                placeholder="Chọn gian hàng"
                                value={dataStore?.filter(op => config?.groups[0]?.stores?.includes(op?.value))}
                                options={dataStore}
                                allowClear={true}
                                optionRender={option => renderOptionsStore(option)}
                                labelRender={item => renderLabelStore(item)}
                                onChange={(values) => {
                                    let newConfigs = [...configs];
                                    newConfigs[index].groups = newConfigs[index]?.groups?.map(_item => {
                                        return {
                                            ..._item,
                                            stores: values
                                        }
                                    })
                                    newConfigs[index].extended_groups = newConfigs[index]?.extended_groups?.map(_item => {
                                        return {
                                            ..._item,
                                            stores: values
                                        }
                                    })
                                    setConfigs(newConfigs);
                                }}
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
                            <Text
                                style={{ color: '#ff5629', cursor: 'pointer', marginRight: 12, marginLeft: 'auto' }}
                                onClick={() => {
                                    let newConfigs = [...configs];
                                    newConfigs[index].groups = newConfigs[index].groups.filter((_, i) => i !== _i + 1);
                                    setConfigs(newConfigs);
                                }}
                            >Xóa</Text>
                        </Flex>
                        <Card>
                            <Text strong>Điều kiện đạt hoa hồng</Text>
                            {configs[index]?.groups[_i + 1]?.formula_rules?.map((condition, _index) => {
                                return <Row gutter={10} align="bottom" style={{ marginBottom: 10 }}>
                                    <Col span={1}>{_index != 0 && 'Và'}</Col>
                                    <Col span={6}>
                                        <Select
                                            className="w-100"
                                            value={options?.find(op => op?.value == condition?.applied_indicator)}
                                            options={options}
                                            allowClear={false}
                                            onChange={(value) => {
                                                let newConfigs = [...configs];
                                                newConfigs[index].groups[_i + 1].formula_rules[_index].applied_indicator = value;
                                                setConfigs(newConfigs);
                                            }}
                                        />
                                    </Col>
                                    <Col span={6}>
                                        <Select
                                            className="w-100"
                                            placeholder="Tất cả"
                                            value={optionsOperator?.find(op => op?.value == condition?.comparison_operators)}
                                            options={optionsOperator}
                                            allowClear={false}
                                            onChange={(value) => {
                                                let newConfigs = [...configs];
                                                newConfigs[index].groups[_i + 1].formula_rules[_index].comparison_operators = value;
                                                setConfigs(newConfigs);
                                            }}
                                        />
                                    </Col>
                                    <Col span={4}>
                                        <Input
                                            placeholder="Nhập giá trị"
                                            value={condition?.operands}
                                            min={0}
                                            onChange={(e) => {
                                                const inputValue = e?.target?.value;
                                                const reg = /^-?\d{0,11}(\.\d{0,6})?$/;
                                                if (inputValue === '' || reg.test(inputValue)) {
                                                    let newConfigs = [...configs];
                                                    newConfigs[index].groups[_i + 1].formula_rules[_index].operands = e?.target?.value;
                                                    setConfigs(newConfigs);
                                                }
                                            }}
                                            onBlur={() => {
                                                let newConfigs = [...configs];
                                                let operandValue = parseFloat(condition?.operands); // Convert to number when user finishes typing
                                                newConfigs[index].groups[_i + 1].formula_rules[_index].operands = isNaN(operandValue) ? 0 : operandValue;
                                                setConfigs(newConfigs);
                                            }}
                                        />
                                    </Col>
                                    <Col span={6}>
                                        <Flex vertical>
                                            <Text>Gian hàng áp dụng</Text>
                                            <Select
                                                mode="multiple"
                                                className="w-100"
                                                placeholder="Chọn gian hàng"
                                                value={dataStore?.filter(op => condition?.stores?.includes(op?.value))}
                                                options={dataStore}
                                                allowClear={true}
                                                optionRender={option => renderOptionsStore(option)}
                                                labelRender={item => renderLabelStore(item)}
                                                onChange={(values) => {
                                                    let newConfigs = [...configs];
                                                    newConfigs[index].groups[_i + 1].formula_rules[_index].stores = values;
                                                    setConfigs(newConfigs);
                                                }}
                                            />
                                        </Flex>
                                    </Col>
                                    <Col span={1}>
                                        <Text
                                            style={{ color: '#ff5629', cursor: 'pointer' }}
                                            onClick={() => handleDelete(_i + 1, _index)}
                                        >Xóa</Text>
                                    </Col>
                                </Row>;
                            })}
                            <Flex justify="center" vertical align="start">
                                {configs[index]?.groups[_i + 1]?.formula_rules?.length < 5 && <Text
                                    style={{ color: '#ff5629', cursor: 'pointer', marginTop: 10 }}
                                    onClick={() => {
                                        let newConfigs = [...configs];
                                        newConfigs[index].groups[_i + 1].formula_rules.push({ applied_indicator: 'nmv', comparison_operators: '>', operands: 0, stores: [] });
                                        setConfigs(newConfigs);
                                    }}
                                >+ Thêm điều kiện và</Text>}
                            </Flex>
                        </Card>
                        <Card>
                            <Text strong>Hoa hồng đạt được</Text>
                            <Row gutter={10} align="top" style={{ marginTop: 10 }}>
                                <Col span={8}>
                                    <Text>Nhập công thức</Text>
                                    <FormulaInput
                                        value={configs[index]?.groups[_i + 1]?.formula_result}
                                        onChange={(value) => handleFormulaChange(value, _i + 1)}
                                        tags={options}
                                    />
                                </Col>
                                <Col span={16}>
                                    <Flex vertical>
                                        <Text>Gian hàng áp dụng</Text>
                                        <Select
                                            mode="multiple"
                                            className="w-100 custom-disabled-select"
                                            placeholder="Chọn gian hàng"
                                            value={dataStore?.filter(op => configs[index]?.groups[_i + 1]?.stores?.includes(op?.value))}
                                            options={dataStore}
                                            allowClear={true}
                                            optionRender={option => renderOptionsStore(option)}
                                            labelRender={item => renderLabelStore(item)}
                                            disabled={true}
                                        />
                                    </Flex>
                                </Col>
                            </Row>
                        </Card>
                    </Card>;
                })

            }
            {
                !!config?.extended_groups?.length && config?.extended_groups?.map((extend, _index) => {
                    return <Card style={{ marginTop: 10, backgroundColor: '#B4D7EE' }} bodyStyle={{ padding: '12px 0 0' }}>
                        <Flex style={{ marginBottom: 12, marginLeft: 12 }} justify="between">
                            <Text strong>Điều kiện phụ</Text>
                            <Text
                                style={{ color: '#ff5629', cursor: 'pointer', marginRight: 12, marginLeft: 'auto' }}
                                onClick={() => {
                                    let newConfigs = [...configs];
                                    newConfigs[index].extended_groups = newConfigs[index].extended_groups.filter((_, i) => i !== _index);
                                    setConfigs(newConfigs);
                                }}
                            >Xóa</Text>
                        </Flex>
                        <Card>
                            <Text strong>Điều kiện đạt hoa hồng</Text>
                            {extend?.formula_rules?.length &&
                                extend?.formula_rules?.map((condition, _ii) => {
                                    return <Row gutter={10} align="bottom" style={{ marginBottom: 10 }}>
                                        <Col span={1}>{_ii != 0 && 'Và'}</Col>
                                        <Col span={6}>
                                            <Select
                                                className="w-100"
                                                value={options?.find(op => op?.value == condition?.applied_indicator)}
                                                options={options}
                                                allowClear={false}
                                                onChange={(value) => {
                                                    let newConfigs = [...configs]
                                                    newConfigs[index].extended_groups[_index].formula_rules[_ii].applied_indicator = value
                                                    setConfigs(newConfigs)
                                                }}
                                            />
                                        </Col>
                                        <Col span={6}>
                                            <Select
                                                className="w-100"
                                                placeholder="Tất cả"
                                                value={optionsOperator?.find(op => op?.value == condition?.comparison_operators)}
                                                options={optionsOperator}
                                                allowClear={false}
                                                onChange={(value) => {
                                                    let newConfigs = [...configs]
                                                    newConfigs[index].extended_groups[_index].formula_rules[_ii].comparison_operators = value
                                                    setConfigs(newConfigs)
                                                }}
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <Input
                                                placeholder="Nhập giá trị"
                                                min={0}
                                                value={condition?.operands}
                                                onChange={(e) => {
                                                    const inputValue = e?.target?.value;
                                                    const reg = /^-?\d{0,11}(\.\d{0,6})?$/;
                                                    if (inputValue === '' || reg.test(inputValue)) {
                                                        let newConfigs = [...configs];
                                                        newConfigs[index].extended_groups[_index].formula_rules[_ii].operands = inputValue;
                                                        setConfigs(newConfigs);
                                                    }
                                                }}
                                                onBlur={() => {
                                                    let newConfigs = [...configs];
                                                    let operandValue = parseFloat(condition?.operands);
                                                    newConfigs[index].extended_groups[_index].formula_rules[_ii].operands = isNaN(operandValue) ? 0 : operandValue;
                                                    setConfigs(newConfigs);
                                                }}
                                            />
                                        </Col>
                                        <Col span={6}>
                                            <Flex vertical>
                                                <Text>Gian hàng áp dụng</Text>
                                                <Select
                                                    mode="multiple"
                                                    className="w-100 custom-disabled-select"
                                                    placeholder="Chọn gian hàng"
                                                    value={dataStore?.filter(op => condition?.stores?.includes(op?.value))}
                                                    options={dataStore}
                                                    allowClear={true}
                                                    optionRender={option => renderOptionsStore(option)}
                                                    labelRender={item => renderLabelStore(item)}
                                                    onChange={(values) => {
                                                        let newConfigs = [...configs]
                                                        newConfigs[index].extended_groups[_index].formula_rules[_ii].stores = values
                                                        setConfigs(newConfigs)
                                                    }}
                                                />
                                            </Flex>
                                        </Col>
                                        <Col span={1}>
                                            <Text
                                                style={{ color: '#ff5629', cursor: 'pointer' }}
                                                onClick={() => handleDelete(_index, _ii, true)}
                                            >Xóa</Text>
                                        </Col>
                                    </Row>
                                })
                            }
                            <Flex justify="center" vertical align="start">
                                {extend?.formula_rules?.length < 3 && <Text
                                    style={{ color: '#ff5629', cursor: 'pointer', marginTop: 10 }}
                                    onClick={() => {
                                        let newConfigs = [...configs]
                                        newConfigs[index].extended_groups[_index].formula_rules.push(
                                            {
                                                applied_indicator: 'nmv',
                                                comparison_operators: '>',
                                                operands: 0,
                                                stores: [],
                                            })
                                        setConfigs(newConfigs)
                                    }}
                                >+ Thêm điều kiện và</Text>}
                            </Flex>
                        </Card>
                        <Card>
                            <Text strong>Hoa hồng đạt được</Text>
                            <Row gutter={10} align="top" style={{ marginTop: 10 }}>
                                <Col span={8}>
                                    <Text>Nhập công thức</Text>
                                    <FormulaInput
                                        value={extend?.formula_result}
                                        onChange={(value) => handleFormulaChange(value, _index, true)}
                                        tags={options}
                                    />
                                </Col>
                                <Col span={16}>
                                    <Flex vertical>
                                        <Text>Gian hàng áp dụng</Text>
                                        <Select
                                            mode="multiple"
                                            className="w-100 custom-disabled-select"
                                            placeholder="Chọn gian hàng"
                                            value={dataStore?.filter(op => extend?.stores?.includes(op?.value))}
                                            options={dataStore}
                                            allowClear={true}
                                            optionRender={option => renderOptionsStore(option)}
                                            labelRender={item => renderLabelStore(item)}
                                            disabled={true}
                                        // onChange={(values) => {
                                        //     let newConfigs = [...configs]
                                        //     newConfigs[index].extended_groups[_index].stores = values
                                        //     setConfigs(newConfigs)
                                        // }}
                                        />
                                    </Flex>
                                </Col>
                            </Row>
                        </Card>
                    </Card>
                })
            }
        </>
    );
};

export default CardCommission;
