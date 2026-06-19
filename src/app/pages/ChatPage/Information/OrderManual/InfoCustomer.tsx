import React, { Fragment, memo, useCallback, useMemo, useState } from "react";
import { Card, Col, Collapse, Flex, Form, Input, Row, Select, Typography } from 'antd';
import { NumericFormat } from "react-number-format";
import ModalReceiver from "../../components/ModalReceiver";
import { useCreateOrderContext } from "app/contexts/CreateOrderContext";

const { Text } = Typography;

const InfoCustomer = ({ form }) => {
    const [openModalReceiver, setOpenModalReceiver] = useState<boolean>(false);
    const provinceValueForm = Form.useWatch('province', form);
    const { optionsProvince, optionsDistrict, yupSync, setInfoReceiver } = useCreateOrderContext();

    const optionsDistrictForm = useMemo(() => {
        if (!provinceValueForm) return [];

        return optionsDistrict[provinceValueForm]
    }, [provinceValueForm, optionsDistrict]);

    const onSelectReceiver = useCallback((receiver) => {
        form.setFieldValue('name_receiver', receiver?.name || null);
        form.setFieldValue('phone_receiver', receiver?.phone || null);
        form.setFieldValue('province', receiver?.province_code || null);
        form.setFieldValue('district', receiver?.district_code || null);
        form.setFieldValue('address', receiver?.address || null);
        setInfoReceiver(receiver)
    }, []);


    return (
        <Fragment>
            {openModalReceiver && <ModalReceiver
                show={openModalReceiver}
                onHide={() => setOpenModalReceiver(false)}
                onSelectReceiver={onSelectReceiver}
            />}
            <Collapse
                className="collapse-order-manual"
                size="small"
                accordion={true}
                activeKey={1}
                items={[{
                    key: 1,
                    showArrow: false,
                    extra: <Text
                        className="color-base"
                        onClick={() => setOpenModalReceiver(true)}
                    >
                        Lấy từ CRM
                    </Text>,
                    label: <Text strong>Thông tin khách hàng</Text>,
                    children: <Row gutter={20}>
                        <Col span={12}>
                            <Form.Item
                                name="name_receiver"
                                validateTrigger={["onBlur", "onChange"]}
                                rules={[yupSync]}
                            >
                                <Input
                                    placeholder="Tên người nhận"
                                    maxLength={50}
                                    showCount
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="phone_receiver"
                                validateTrigger={["onBlur", "onChange"]}
                                rules={[yupSync]}
                            >
                                <NumericFormat
                                    placeholder="Số điện thoại"
                                    customInput={Input}
                                    allowClear
                                    allowLeadingZeros
                                    allowNegative={false}
                                    decimalScale={2}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="address"
                                rules={[yupSync]}
                                validateTrigger={["onBlur", "onChange"]}
                                style={{ marginBottom: 20 }}
                            >
                                <Input.TextArea
                                    placeholder="Địa chỉ"
                                    maxLength={550}
                                    showCount
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="province"
                                rules={[yupSync]}
                                validateTrigger={["onBlur", "onChange"]}
                            >
                                <Select
                                    placeholder="Tỉnh/Thành phố"
                                    onChange={() => form.setFieldValue('district', undefined)}
                                    allowClear
                                    options={optionsProvince}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="district"
                                rules={[yupSync]}
                                validateTrigger={["onBlur", "onChange"]}
                            >
                                <Select
                                    placeholder="Quận/Huyện"
                                    allowClear
                                    disabled={!provinceValueForm}
                                    options={optionsDistrictForm}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                }]}
            />
        </Fragment>
    )
}

export default memo(InfoCustomer);