import React, { memo, useCallback, useMemo, useState } from "react";
import { Card, Collapse, DatePicker, Flex, Form, Input, Select, Spin, Tooltip, Typography } from 'antd';
import { useCreateOrderContext } from "app/contexts/CreateOrderContext";
import { ThunderboltOutlined } from "@ant-design/icons";
import { selectGlobalSlice } from "app/slice/selectors";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { queryCheckRepOrderIdExist } from "utils/helper";
import { OPTIONS_PAYMENT_METHOD } from "../../ChatConstants";

const { Text } = Typography;
const KEY_COLLAPSE_OTHER = 'other';

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

const InfoOther = ({ form }) => {
    const { user } = useSelector(selectGlobalSlice);
    const { collapseActiveKey, setCollapseActiveKey } = useCreateOrderContext();
    const [loading, setLoading] = useState<boolean>(false);

    const valuePaymentMethod = Form.useWatch('payment_method', form);

    const isExpand = useMemo(() => collapseActiveKey?.includes(KEY_COLLAPSE_OTHER), [collapseActiveKey]);

    const extraTitle = useMemo(() => isExpand ? 'Thu gọn' : 'Mở rộng', [isExpand]);

    const OPTIONS_PERSONNAL = useMemo(() => {
        if (!user?.email) return [];
        return [{ value: user?.email, label: user?.email }]
    }, [user]);

    const onExpand = useCallback(() => {
        setCollapseActiveKey((prev: string[]) => isExpand
            ? prev.filter((key: string) => key != KEY_COLLAPSE_OTHER)
            : prev.concat([KEY_COLLAPSE_OTHER]))
    }, [isExpand]);

    const generateOrderCode = useCallback(() => {
        form.setFieldValue('order_code', `OR${user?.sme_id}${dayjs().unix()}`);
    }, [form, user]);

    console.log({ valuePaymentMethod })

    return (
        <Collapse
            className="collapse-order-manual"
            size="small"
            accordion={true}
            {...(isExpand && {
                activeKey: KEY_COLLAPSE_OTHER
            })}
            collapsible="icon"
            items={[{
                key: KEY_COLLAPSE_OTHER,
                showArrow: false,
                forceRender: true,
                extra: <Text
                    className="cursor-pointer color-base"
                    onClick={onExpand}
                >
                    {extraTitle}
                </Text>,
                label: <Text strong>Thông tin khác</Text>,
                children: <Flex vertical>
                    <Spin spinning={loading}>
                        <Form.Item
                            {...layout}
                            label="Mã đơn hàng"
                            name="order_code"
                            required
                        >
                            <Input
                                placeholder="Nhập mã đơn hàng"
                                onBlur={async e => {
                                    const orderCode = e.target?.value;
                                    if (!orderCode) return;
                                    setLoading(true);
                                    const checkExistOrderCode = await queryCheckRepOrderIdExist(orderCode);
                                    setLoading(false);

                                    if (checkExistOrderCode) {
                                        form.setFieldValue('order_code_boolean', { order_code: true })
                                    } else {
                                        form.setFieldValue('order_code_boolean', { order_code: false })
                                    }
                                }}
                                addonAfter={<Tooltip placement="bottom" title="Tự động tạo">
                                    <ThunderboltOutlined
                                        className="cursor-pointer"
                                        onClick={generateOrderCode}
                                    />
                                </Tooltip>}
                            />
                        </Form.Item>
                    </Spin>
                    <Form.Item
                        {...layout}
                        label="Phương thức"
                        name="payment_method"
                        tooltip="Phương thức thanh toán"
                        required
                    >
                        <Select
                            placeholder="Chọn phương thức thanh toán"
                            options={OPTIONS_PAYMENT_METHOD}
                            allowClear
                        />
                    </Form.Item>
                    {valuePaymentMethod && valuePaymentMethod != OPTIONS_PAYMENT_METHOD[0].value
                        && <Form.Item
                            {...layout}
                            label="TG thanh toán"
                            tooltip="Thời gian thanh toán"
                            name="paid_at"
                            required
                        >
                            <DatePicker
                                className="w-100"
                                format='YYYY-MM-DD HH:mm'
                                showTime={{
                                    format: 'YYYY-MM-DD HH:mm'
                                }}
                                placeholder="Chọn thời gian thanh toán"
                            />
                        </Form.Item>}
                    <Form.Item
                        {...layout}
                        label="TG đặt hàng"
                        tooltip="Thời gian đặt hàng"
                        name="order_at"
                        required
                    >
                        <DatePicker
                            className="w-100"
                            format='YYYY-MM-DD HH:mm'
                            showTime={{
                                format: 'YYYY-MM-DD HH:mm'
                            }}
                            placeholder="Chọn thời gian đặt hàng"
                        />
                    </Form.Item>
                    <Form.Item
                        {...layout}
                        label="Người phụ trách"
                        name="person_charge"
                    >
                        <Select
                            placeholder="Chọn người phụ trách"
                            allowClear
                            options={OPTIONS_PERSONNAL}
                        />
                    </Form.Item>
                    <Form.Item
                        {...layout}
                        name="note"
                        label="Ghi chú người bán"
                    >
                        <Input.TextArea
                            allowClear
                            showCount
                            maxLength={500}
                            placeholder="Nhập ghi chú người bán"
                        />
                    </Form.Item>
                </Flex>
            }]}
        />
    )
}

export default memo(InfoOther);