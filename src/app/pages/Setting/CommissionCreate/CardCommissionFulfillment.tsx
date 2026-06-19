import { useMutation, useQuery } from "@apollo/client";
import { Select, Card, Tag, Col, Flex, Row, Typography, Input, InputNumber } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useState } from "react";
import FormulaInput from "./components/FormulaInput";
import { options, optionsFulfillment, optionsOperator } from "./utils";
import { formatNumberToCurrency, showAlert } from "utils/helper";

const { Text } = Typography;

const CardCommissionFulfillment = ({ dataStore, config, configs, setConfigs, index }: any) => {
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
            newConfigs[index].formula_result = value;
        } else {
            newConfigs[index].formula_result = value;
        }
        setConfigs(newConfigs);
    };

    return (
        <>
            <Card>
                <Text strong>Cấu hình hoa hồng</Text>
                <Row gutter={10} align="top" style={{ marginTop: 10 }}>
                    <Col span={8} >
                        <Text>Nhập công thức</Text>
                        <FormulaInput
                            tags={optionsFulfillment}
                            placeholder="Nhập giá trị"
                            onChange={(value) => handleFormulaChange(value, 0)}
                            value={config?.formula_result}
                        />
                    </Col>
                    <Col span={16}>
                        <Flex vertical>
                            <Text>Gian hàng áp dụng</Text>
                            <Select
                                mode="multiple"
                                className="w-100 custom-disabled-select"
                                placeholder="Chọn gian hàng"
                                value={dataStore?.filter(op => config?.stores?.includes(op?.value))}
                                options={dataStore}
                                optionRender={option => renderOptionsStore(option)}
                                labelRender={item => renderLabelStore(item)}
                                onChange={(values) => {
                                    let newConfigs = [...configs];
                                    newConfigs[index].stores = values;
                                    setConfigs(newConfigs);
                                }}
                            />
                        </Flex>
                    </Col>
                </Row>
            </Card>
            {config?.commission_per_order != null && <Card style={{ marginTop: 10, backgroundColor: '#B4D7EE' }} bodyStyle={{ padding: '12px 0 0' }}>
                <Flex style={{ marginBottom: 12, marginLeft: 12 }} justify="between">
                    <Text strong>Điều kiện ràng buộc</Text>
                    <Text
                        style={{ color: '#ff5629', cursor: 'pointer', marginRight: 12, marginLeft: 'auto' }}
                        onClick={() => {
                            let newConfigs = [...configs];
                            newConfigs[index].commission_per_order = null;
                            setConfigs(newConfigs);
                        }}
                    >Xóa</Text>
                </Flex>
                <Card>
                    <Text strong>Số tiền hoa hồng tối đa trên 1 đơn hàng</Text>
                    <Row gutter={10} align="bottom" style={{ marginTop: 10 }}>
                        <Col span={8} style={{ marginTop: 10 }}>
                            <InputNumber
                                placeholder="Nhập giá trị"
                                value={config?.commission_per_order}
                                className='custom-disabled-input'
                                min={1}
                                defaultValue={1}
                                max={100000000}
                                controls={false}
                                style={{ width: '100%' }}
                                onChange={(value) => {
                                    if (value >= 1) {
                                        let newConfigs = [...configs];
                                        newConfigs[index].commission_per_order = value;
                                        setConfigs(newConfigs);
                                    } else {
                                        let newConfigs = [...configs];
                                        newConfigs[index].commission_per_order = 1;
                                        setConfigs(newConfigs);
                                    }
                                }}
                            />
                        </Col>
                    </Row>
                </Card>
            </Card>}
        </>
    );
};

export default CardCommissionFulfillment;
