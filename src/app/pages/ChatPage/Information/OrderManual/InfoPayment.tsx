import React, { memo, useCallback, useMemo, useState } from "react";
import { Card, Col, Collapse, Divider, Flex, Form, Input, Row, Typography } from 'antd';
import { useCreateOrderContext } from "app/contexts/CreateOrderContext";
import { formatNumberToCurrency } from "utils/helper";
import { NumericFormat } from "react-number-format";

const { Text } = Typography;
const KEY_COLLAPSE_PAYMENT = 'payment';

const InfoPayment = ({ form }) => {
    const { collapseActiveKey, setCollapseActiveKey, variantsOrder } = useCreateOrderContext();
    const valuesForm = Form.useWatch([], { form, preserve: true }) as any;

    const isExpand = useMemo(() => collapseActiveKey?.includes(KEY_COLLAPSE_PAYMENT), [collapseActiveKey]);

    const extraTitle = useMemo(() => isExpand ? 'Thu gọn' : 'Mở rộng', [isExpand]);

    const [totalQuantityVariant, totalPriceVariant, totalDiscountVariant] = useMemo(() => {
        const totalQuantity = variantsOrder.reduce((result, variant) => {
            const variantQuantity = valuesForm[`variant_${variant?.variant?.id}_quantity`] || 0;
            result += variantQuantity
            return result
        }, 0);

        const totalPrice = variantsOrder.reduce((result, variant) => {
            const [variantQuantity, variantPrice] = [
                valuesForm[`variant_${variant?.variant?.id}_quantity`] || 0,
                valuesForm[`variant_${variant?.variant?.id}_price`],
            ];
            result += (variantQuantity * variantPrice)
            return result
        }, 0);

        const totalDiscount = variantsOrder.reduce((result, variant) => {
            const [variantDiscountUnit, variantPrice, variantQuantity, variantDiscount] = [
                valuesForm[`variant_${variant?.variant?.id}_unit`] || 0,
                valuesForm[`variant_${variant?.variant?.id}_price`],
                valuesForm[`variant_${variant?.variant?.id}_quantity`] || 1,
                valuesForm[`variant_${variant?.variant?.id}_discount`] || 0,
            ]
            let discounts;
            if (variantDiscountUnit) {
                discounts = variantQuantity * Math.round((variantDiscount * variantPrice) / 100)
            } else {
                discounts = variantQuantity * variantDiscount
            };
            result += discounts
            return result
        }, 0);

        return [totalQuantity, totalPrice, totalDiscount];
    }, [valuesForm]);

    const onExpand = useCallback(() => {
        setCollapseActiveKey((prev: string[]) => isExpand
            ? prev.filter((key: string) => key != KEY_COLLAPSE_PAYMENT)
            : prev.concat([KEY_COLLAPSE_PAYMENT]))
    }, [isExpand]);

    return (
        <Collapse
            className="collapse-order-manual"
            size="small"
            accordion={true}
            {...(isExpand && {
                activeKey: KEY_COLLAPSE_PAYMENT
            })}
            collapsible="icon"
            items={[{
                key: KEY_COLLAPSE_PAYMENT,
                forceRender: true,
                showArrow: false,
                extra: <Text
                    className="cursor-pointer color-base"
                    onClick={onExpand}
                >
                    {extraTitle}
                </Text>,
                label: <Text strong>Thông tin thanh toán</Text>,
                children: <Flex vertical gap={10}>
                    <Flex justify="space-between" align="center">
                        <Text>Tổng giá trị đơn hàng:</Text>
                        <Text>{formatNumberToCurrency(totalPriceVariant - totalDiscountVariant)}đ</Text>
                    </Flex>
                    <Flex justify="space-between" align="center">
                        <Text type="secondary">Tổng tiền sản phẩm:</Text>
                        <Text>{formatNumberToCurrency(totalPriceVariant)}đ</Text>
                    </Flex>
                    <Flex justify="space-between" align="center">
                        <Text type="secondary">Tổng tiền chiết khấu:</Text>
                        <Text>{formatNumberToCurrency(totalDiscountVariant)}đ</Text>
                    </Flex>
                    <Row align="middle">
                        <Col span={10}>
                            <Text>Giảm giá đơn hàng:</Text>
                        </Col>
                        <Col span={14}>
                            <Form.Item name={`promotion_seller_amount`}>
                                <NumericFormat
                                    placeholder="Nhập giảm giá đơn hàng"
                                    customInput={Input}
                                    style={{ textAlign: 'end' }}
                                    // thousandSeparator="."
                                    // decimalSeparator=","
                                    allowNegative={false}
                                    decimalScale={2}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Flex justify="space-between" align="center">
                        <Text>Phí vận chuyển phải trả:</Text>
                        <Text>{formatNumberToCurrency((valuesForm?.[`shipping_original_fee`] || 0) - (valuesForm?.[`shipping_discount_seller_fee`] || 0))}đ</Text>
                    </Flex>
                    <Flex justify="space-between" align="center">
                        <Text type="secondary">Phí vận chuyển thực tế:</Text>
                        <Text>{formatNumberToCurrency(valuesForm?.[`shipping_original_fee`] || 0)}đ</Text>
                    </Flex>
                    <Flex justify="space-between" align="center">
                        <Text type="secondary">Nhà bán hỗ trợ vận chuyển:</Text>
                        <Text>{formatNumberToCurrency(valuesForm?.['shipping_discount_seller_fee'] || 0)}đ</Text>
                    </Flex>
                    <Divider style={{ margin: 0 }} />
                    <Flex justify="space-between" align="center">
                        <Text strong>Tổng tiền thanh toán:</Text>
                        <Text type="danger" strong>
                            {formatNumberToCurrency(totalPriceVariant - (totalDiscountVariant + (+valuesForm?.[`promotion_seller_amount`] || 0)) + ((valuesForm?.[`shipping_original_fee`] || 0) - (valuesForm?.[`shipping_discount_seller_fee`] || 0)))}đ
                        </Text>
                    </Flex>
                </Flex>
            }]}
        />
    )
}

export default memo(InfoPayment);