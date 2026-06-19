import { Select, Card, Tag, Table, Col, Popover, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image, Input, Form, Dropdown, InputNumber } from "antd";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { options, optionsFulfillment, optionsOperator } from "../../CommissionCreate/utils";
import FormulaInput from "../../CommissionCreate/components/FormulaInput";
import { formatNumberToCurrency } from "utils/helper";

const { Text } = Typography;

const CardCommissionFulfillment = ({ dataStore, config }: any) => {
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
    console.log(config?.formula_result)
    return (
        <>
            <Card>
                <Text strong>Cấu hình hoa hồng</Text>
                <Row gutter={10} align="bottom" style={{ marginTop: 10 }}>
                    <Col span={24}>
                        <Text>Nhập công thức</Text>
                    </Col>
                    <Col span={8} style={{ marginTop: 10 }}>
                        <FormulaInput
                            tags={optionsFulfillment}
                            placeholder="Nhập giá trị"
                            value={config?.formula_result}
                            disabled={true}
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
                                disabled={true}
                            />
                        </Flex>
                    </Col>
                </Row>
            </Card>
            {config?.commission_per_order && <Card style={{ marginTop: 10, backgroundColor: '#B4D7EE' }} bodyStyle={{ padding: '12px 0 0' }}>
                <Flex style={{ marginBottom: 12, marginLeft: 12 }} justify="between">
                    <Text strong>Điều kiện ràng buộc</Text>
                </Flex>
                <Card>
                    <Text strong>Số tiền hoa hồng tối đa trên 1 đơn hàng</Text>
                    <Row gutter={10} align="bottom" style={{ marginTop: 10 }}>
                        <Col span={8} style={{ marginTop: 10 }}>
                            <Input
                                placeholder="Nhập giá trị"
                                value={formatNumberToCurrency(config?.commission_per_order)}
                                disabled={true}
                                className='custom-disabled-input'
                            />
                        </Col>
                    </Row>
                </Card>
            </Card>}
        </>
    )
};

export default CardCommissionFulfillment;
