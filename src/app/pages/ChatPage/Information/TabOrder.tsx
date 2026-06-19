import { Button, Empty, Flex, Form, Modal, Result, Spin } from "antd";
import React, { Fragment, memo, useCallback, useContext, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import InfoCustomer from "./OrderManual/InfoCustomer";
import InfoProduct from "./OrderManual/InfoProduct";
import { CreateOrderProvider, useCreateOrderContext } from "app/contexts/CreateOrderContext";
import InfoLogistic from "./OrderManual/InfoLogistic";
import InfoOther from "./OrderManual/InfoOther";
import InfoPayment from "./OrderManual/InfoPayment";
import { OPTIONS_FEE_BEARER, OPTIONS_PAYMENT_METHOD } from "../ChatConstants";
import { useSelector } from "react-redux";
import { selectCurrentConverstation } from "../slice/selectors";
import { ShopOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { showAlert } from "utils/helper";
import { useMutation } from "@apollo/client";
import mutate_saveManualOrder from "graphql/mutations/mutate_saveManualOrder";
import { selectGlobalSlice } from "app/slice/selectors";
import { SocketContext } from "app/contexts/SocketContext";
import AuthorizationWrapper from "app/components/AuthorizationWrapper";

const TabOrderWrapper = styled.div`  
    .box-empty {
        margin-top: 5%;
    }

    .content-wrapper {    
        padding: 0px 20px;
        height: calc(100vh - 200px);
        overflow: auto;
    }

    .collapse-order-manual {
        margin-bottom: 20px;
    }

    .ant-form-item {
        margin-bottom: 16px;
    }

    .bottom-wrapper {
        border-top: 1px solid #e9e9e9;
        padding: 20px;
    }
`;

const TabOrder = () => {
    const currentConversation = useSelector(selectCurrentConverstation);
    const [form] = Form.useForm();

    if (!currentConversation?.storeId) {
        return <TabOrderWrapper>
            <Flex className="box-empty" align="center" justify="center">
                <Result
                    status="403"
                    subTitle="Gian hàng chưa được kết nối trên UpS, vui lòng kết nối để Tạo đơn hàng"
                    extra={<Button
                        className="btn-base"
                        block
                        type="primary"
                        onClick={() => window.open(`${process.env.REACT_APP_SME_ENDPOINT}/setting/channels`)}
                    >
                        Kết nối SME
                    </Button>}
                />
            </Flex>
        </TabOrderWrapper>
    }

    return <CreateOrderProvider>
        <OrderCreateForm
            form={form}
            currentConversation={currentConversation}
        />
    </CreateOrderProvider>
};

const OrderCreateForm = ({ form, currentConversation }) => {
    const { optionsProvince, optionsDistrict, infoReceiver, infoCustomer, smeWarehouseSelected, variantsOrder, setVariantsOrder, setInfoReceiver, setSmeWarehouseSelected } = useCreateOrderContext();
    const { setCurrentSegmented, setCurrentTab, currentTab } = useContext(SocketContext);
    const [createOrderManual, { loading: loadingCreateOrderManual }] = useMutation(mutate_saveManualOrder);
    const valuesForm = Form.useWatch([], { form, preserve: true }) as any;

    const onResetForm = useCallback(() => {
        form.resetFields();
        setVariantsOrder([]);
        setInfoReceiver(null);
        setSmeWarehouseSelected(null);
    }, [form]);

    useMemo(() => {
        if (currentTab == '1') onResetForm();
    }, [currentTab]);


    const onCreateOrderManual = useCallback(() => {
        form.validateFields()
            .then(async values => {
                const { order_at, paid_at } = values || {};

                const [timeStampOrderAt, timeStampPaidAt] = [
                    !!order_at ? dayjs(order_at).unix() : null,
                    !!paid_at ? dayjs(paid_at).unix() : null,
                ];
                console.log({ timeStampOrderAt, timeStampPaidAt });

                if (!timeStampOrderAt) {
                    showAlert.error('Vui lòng chọn thời gian đặt hàng')
                }

                const province = optionsProvince?.find(item => item?.value == values?.province);
                const district = optionsDistrict?.[values?.province]?.find(item => item?.value == values?.district);

                console.log(`[FORM VALUES]: `, values, valuesForm);
                const bodyRequest = {
                    customer_info: {
                        crm_customer_id: infoCustomer?.id,
                        sc_customer_id: infoCustomer?.sc_customer_id,
                        name: infoCustomer?.name,
                        phone: infoCustomer?.phone,
                    },
                    received_address: {
                        crm_address_id: infoReceiver?.id,
                        sc_recipient_address_id: infoReceiver?.sc_recipient_address_id,
                        name: values?.name_receiver,
                        phone: values?.phone_receiver,
                        district_code: values?.district,
                        district_name: district?.label,
                        state_code: values?.province,
                        state_name: province?.label,
                        // full_address: infoReceiver?.sc_recipient_address_id 
                        // ? values[`address`] 
                        // : 
                        //  `${prefix(values[`address`], values[`district`]?.label)}${prefix(values[`district`]?.label, values[`province`]?.label)}${values[`province`]?.label || ''}`,

                        full_address: values?.address,
                    },
                    package_data: {
                        package_weight: +(values?.package_weight / 1000),
                        shipping_carrier: values?.shipping_carrier,
                    },
                    order_info: {
                        shipping_fee_by: values?.fee_bearer,
                        sc_warehouse_id: null,
                        note: values?.note,
                        ref_id: values?.order_code,
                        ref_shop_id: currentConversation?.channelRefId,
                        store_id: currentConversation?.storeId,
                        connector_channel_code: currentConversation?.channelCode,
                        person_in_charge: values?.person_charge,
                        sme_warehouse_id: smeWarehouseSelected?.value,
                        payment_method: values?.payment_method,
                        order_at: timeStampOrderAt,
                        paid_at: timeStampPaidAt,
                        shipping_discount_seller_fee: +values[`shipping_discount_seller_fee`] || 0,
                        shipping_original_fee: +values[`shipping_original_fee`] || 0,
                        promotion_seller_amount: +values[`promotion_seller_amount`] || 0,
                    },
                    order_items: variantsOrder?.map(variant => {
                        const [variantDiscountUnit, variantPrice, variantQuantity, variantDiscount] = [
                            valuesForm[`variant_${variant?.variant?.id}_unit`],
                            valuesForm[`variant_${variant?.variant?.id}_price`],
                            valuesForm[`variant_${variant?.variant?.id}_quantity`],
                            valuesForm[`variant_${variant?.variant?.id}_discount`],
                        ]
                        let discountSellerAmount;
                        if (variantDiscountUnit?.value) {
                            discountSellerAmount = Math.round((variantDiscount * variantPrice) / 100)
                        } else {
                            discountSellerAmount = variantDiscount
                        }

                        return {
                            sme_product_id: variant?.variant?.sme_catalog_product?.id,
                            sme_product_name: variant?.variant?.sme_catalog_product?.name,
                            sme_product_sku: variant?.variant?.sme_catalog_product?.sku,
                            sme_variant_id: variant?.variant?.id,
                            sme_variant_name: variant?.variant?.attributes?.length > 0 ? variant?.variant?.name : null,
                            sme_variant_sku: variant?.variant?.sku,
                            sme_variant_full_name: variant?.variant?.variant_full_name,
                            quantity_purchased: valuesForm[`variant_${variant?.variant?.id}_quantity`],
                            original_price: valuesForm[`variant_${variant?.variant?.id}_price`],
                            discount_seller_amount: discountSellerAmount,
                            sme_warehouse_id: String(smeWarehouseSelected?.value),
                            unit: variant?.variant?.unit,
                            is_combo: variant?.variant?.is_combo,
                            is_gift: 0,
                            combo_item: variant?.variant?.combo_items?.map(item => ({
                                sme_variant_id: item?.combo_variant_id,
                                quantity_in_combo: item?.quantity,
                                sme_variant_sku: item?.combo_item.sku
                            }))
                        }
                    })
                };

                console.log({ bodyRequest });

                const { data } = await createOrderManual({
                    variables: bodyRequest
                });

                if (data?.saveManualOrder?.success) {
                    showAlert.success('Tạo đơn thủ công thành công');
                    setCurrentTab('1');
                    setTimeout(() => setCurrentSegmented('order'), 150);
                } else {
                    showAlert.error(data?.saveManualOrder?.message || 'Tạo đơn thủ công thất bại')
                }
            })
            .catch(err => {
                console.log(`[FORM ERRORS]: `, err)
                showAlert.error('Tạo đơn thủ công thất bại');

            })
    }, [form, infoCustomer, infoReceiver, currentConversation, variantsOrder, valuesForm]);

    return (
        <TabOrderWrapper>
            <Spin spinning={loadingCreateOrderManual}>
                <Form
                    form={form}
                    preserve={true}
                    name="basic"
                    layout="horizontal"
                    initialValues={{
                        fee_bearer: OPTIONS_FEE_BEARER[0]?.value,
                        payment_method: OPTIONS_PAYMENT_METHOD[0]?.value,
                        shipping_discount_seller_fee: 0,
                        shipping_original_fee: 0,
                        promotion_seller_amount: 0,
                    }}
                >
                    <Flex className="content-wrapper" vertical>
                        <InfoCustomer form={form} />
                        <InfoProduct form={form} />
                        <InfoLogistic form={form} />
                        <InfoOther form={form} />
                        <InfoPayment form={form} />
                    </Flex>
                    <Flex className="bottom-wrapper" justify="flex-end">
                        <Flex align="center" gap={20}>
                            <Button
                                type="primary"
                                className="btn-base btn-cancel"
                                onClick={onResetForm}
                            >
                                Hủy
                            </Button>
                            <AuthorizationWrapper keys={['order_sales_person_create_manual']}>
                                <Button
                                    type="primary"
                                    className="btn-base"
                                    onClick={onCreateOrderManual}
                                >
                                    Lưu
                                </Button>
                            </AuthorizationWrapper>
                        </Flex>
                    </Flex>
                </Form>
            </Spin>
        </TabOrderWrapper>
    )
}

export default memo(TabOrder);