import { Button, Flex, Form, Input, InputNumber, Modal, Select, Typography } from "antd";
import React, { memo, useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { OPTIONS_UNIT } from "../ChatConstants";

const { Text } = Typography;

const ModalWrapper = styled(Modal)`
    .ant-modal-body {
        margin: 20px 0px;
    }

    .input-wrapper {
        width: 50%;
        height: 35px;
    }

    .ant-input {
        height: 35px;
    }

    .ant-form-item {
        margin-bottom: 12px;
    }
`;

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

const ModalEditVariant = ({
    currentVariant,
    onHide,
    onEditVariant
}) => {
    const [form] = Form.useForm();
    const [currentUnit, setCurrentUnit] = useState<number>(OPTIONS_UNIT[1].value);

    const initialValues = useMemo(() => {
        setCurrentUnit(currentVariant?.unit);
        return {
            price: currentVariant?.price,
            quantity: currentVariant?.quantity,
            discount: currentVariant?.discount,
            unit: typeof currentVariant?.unit == 'number' ? currentVariant?.unit : OPTIONS_UNIT[1].value,
        }
    }, [currentVariant]);

    const onCancel = useCallback(() => {
        onHide();
        setCurrentUnit(OPTIONS_UNIT[1].value)
        form.resetFields();
    }, []);

    console.log({ currentUnit });

    return (
        <Form
            form={form}
            name="basic"
            layout="horizontal"
            initialValues={initialValues}
        >
            <ModalWrapper
                open={!!currentVariant}
                title="Chỉnh sửa"
                closable={false}
                footer={[
                    <Flex align="center" justify="flex-end">
                        <Flex align="center" gap={20}>
                            <Button
                                type="primary"
                                className="btn-base btn-cancel"
                                onClick={onCancel}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                className="btn-base"
                                onClick={() => {
                                    form.validateFields().then(values => {
                                        onEditVariant({ ...values, unit: currentUnit }, currentVariant)
                                    }).finally(() => onCancel());
                                }}
                            >
                                Xác nhận
                            </Button>
                        </Flex>
                    </Flex>
                ]}
            >
                <Flex vertical>
                    <Form.Item
                        {...layout}
                        label="Tên hàng hóa"
                    >
                        <Text>{currentVariant?.name}</Text>
                    </Form.Item>
                    <Form.Item
                        {...layout}
                        label="Số lượng"
                        name="quantity"
                    >
                        <InputNumber
                            className="w-100"
                            placeholder="Nhập số lượng"
                        />
                    </Form.Item>
                    <Form.Item
                        {...layout}
                        label="Giá bán"
                        name="price"
                    >
                        <InputNumber
                            className="w-100"
                            placeholder="Nhập giá bán"
                            addonAfter="đ"
                        />
                    </Form.Item>
                    <Form.Item
                        {...layout}
                        label="Chiết khấu"
                        name="discount"
                    >
                        <InputNumber
                            className="w-100"
                            placeholder="Nhập chiết khấu"
                            {...(currentUnit == OPTIONS_UNIT[1].value ? {
                                max: 100,
                                min: 0
                            } : {})}
                            addonAfter={<Select
                                value={currentUnit}
                                onChange={(value) => {
                                    form.setFieldValue(`discount`, 0);
                                    setCurrentUnit(value)
                                }}
                                options={OPTIONS_UNIT}
                            />}
                        />
                    </Form.Item>
                </Flex>
            </ModalWrapper>
        </Form>
    )
};

export default memo(ModalEditVariant);