import React, { memo, useCallback, useMemo, useState } from "react";
import { Card, Col, Collapse, Flex, Form, Input, Row, Select, Typography } from 'antd';
import { useCreateOrderContext } from "app/contexts/CreateOrderContext";
import { NumericFormat } from "react-number-format";
import { OPTIONS_FEE_BEARER } from "../../ChatConstants";

const { Text } = Typography;
const KEY_COLLAPSE_LOGISTIC = 'logistic'

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

const InfoLogistic = ({ form }) => {
    const { collapseActiveKey, setCollapseActiveKey, optionsShippingUnit, yupSync } = useCreateOrderContext();

    const isExpand = useMemo(() => collapseActiveKey?.includes(KEY_COLLAPSE_LOGISTIC), [collapseActiveKey]);

    const extraTitle = useMemo(() => isExpand ? 'Thu gọn' : 'Mở rộng', [isExpand]);

    const onExpand = useCallback(() => {
        setCollapseActiveKey((prev: string[]) => isExpand
            ? prev.filter((key: string) => key != KEY_COLLAPSE_LOGISTIC)
            : prev.concat([KEY_COLLAPSE_LOGISTIC]))
    }, [isExpand]);

    return <Collapse
        className="collapse-order-manual"
        size="small"
        accordion={true}
        {...(isExpand && {
            activeKey: KEY_COLLAPSE_LOGISTIC
        })}
        collapsible="icon"
        items={[{
            key: KEY_COLLAPSE_LOGISTIC,
            showArrow: false,
            forceRender: true,
            extra: <Text
                className="cursor-pointer color-base"
                onClick={onExpand}
            >
                {extraTitle}
            </Text>,
            label: <Text strong>Thông tin vận chuyển</Text>,
            children: <Flex vertical>
                <Form.Item
                    {...layout}
                    name="package_weight"
                    label="Tổng khối lượng"
                    rules={[yupSync]}
                >
                    <NumericFormat
                        placeholder="Nhập tổng khối lượng"
                        customInput={Input}
                        addonAfter="g"
                        onChange={e => {
                            // e.preventDefault();
                            // e.stopPropagation();
                            // console.log({ value123: +e?.target?.value?.replaceAll('.', '') })
                            // form.setFieldValue("package_weight", +e?.target?.value?.replaceAll('.', ''))
                        }}
                        // onValueChange={(value) => {
                        //     form.setFieldValue("package_weight", value?.floatValue)
                        // }}
                        // thousandSeparator="."
                        // decimalSeparator=","
                        allowNegative={false}
                        decimalScale={0}
                    />
                </Form.Item>
                <Form.Item
                    {...layout}
                    name="shipping_carrier"
                    label="Đơn vị vận chuyển"
                    rules={[yupSync]}
                    required
                >
                    <Select
                        placeholder="Chọn ĐVVC"
                        options={optionsShippingUnit}
                        allowClear
                    />
                </Form.Item>
                <Form.Item
                    {...layout}
                    name="shipping_original_fee"
                    label="Phí vận chuyển"
                    rules={[yupSync]}
                >
                    <NumericFormat
                        placeholder="Nhập phí vận chuyển thực tế"
                        customInput={Input}
                        addonAfter="đ"
                        // thousandSeparator="."
                        // decimalSeparator=","
                        allowNegative={false}
                        decimalScale={2}
                    />
                </Form.Item>
                <Form.Item
                    {...layout}
                    name="fee_bearer"
                    label="Người chịu phí"
                >
                    <Select
                        placeholder="Chọn người chịu phí"
                        options={OPTIONS_FEE_BEARER}
                    />
                </Form.Item>
            </Flex>
        }]}
    />
}

export default memo(InfoLogistic);