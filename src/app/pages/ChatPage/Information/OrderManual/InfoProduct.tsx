import React, { Fragment, memo, useCallback, useMemo, useState } from "react";
import { Button, Card, Col, Collapse, Flex, Form, Popover, Row, Select, Table, Tooltip, Typography } from 'antd';
import { useCreateOrderContext } from "app/contexts/CreateOrderContext";
import { formatNumberToCurrency } from "utils/helper";
import ModalAddVariant from "../../components/ModalAddVariant";
import { OPTIONS_UNIT } from "../../ChatConstants";
import ModalEditVariant from "../../components/ModalEditVariant";
import { WarningFilled, WarningOutlined } from "@ant-design/icons";

const { Text, Paragraph } = Typography;
const KEY_COLLAPSE_PRODUCT = 'product'

const InfoProduct = ({ form }) => {
    const { collapseActiveKey, setCollapseActiveKey, optionsSmeWarehouse, smeWarehouseSelected, setSmeWarehouseSelected, variantsOrder, setVariantsOrder } = useCreateOrderContext();
    const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
    const [currentVariant, setCurrentVariant] = useState<any>(null);
    const [showActionKey, setShowActionKey] = useState<string | null>(null);

    const valuesForm = Form.useWatch([], { form, preserve: true }) as any;

    console.log({ valuesForm });

    const columns = [
        {
            title: 'Tên hàng hóa',
            dataIndex: 'name',
            key: 'name',
            width: '30%',
            render: (_item, record) => {
                return <Popover
                    open={showActionKey == record?.key}
                    content={<Flex justify="center" align="center" vertical gap={4}>
                        <Button
                            type="text"
                            className="color-base"
                            onClick={() => setCurrentVariant({
                                id: record?.variant_id,
                                name: record?.variant?.variant_full_name,
                                price: valuesForm[`variant_${record?.variant?.id}_price`],
                                quantity: valuesForm[`variant_${record?.variant?.id}_quantity`],
                                discount: valuesForm[`variant_${record?.variant?.id}_discount`],
                                unit: valuesForm[`variant_${record?.variant?.id}_unit`],
                            })}
                        >
                            Chỉnh sửa SP
                        </Button>
                        <Button
                            type="text"
                            onClick={() => setVariantsOrder(prev => prev.filter(item => item?.key != record?.key))}
                        >
                            Xóa sản phẩm
                        </Button>
                    </Flex>}
                    title={false}
                    trigger="click"
                    placement="left"
                >
                    <Paragraph
                        ellipsis={{ rows: 2, tooltip: record?.variant?.variant_full_name }}
                    >
                        {record?.variant?.variant_full_name}
                    </Paragraph>
                </Popover>
            }
        },
        {
            title: 'Đơn giá',
            dataIndex: 'price',
            key: 'price',
            width: '23%',
            render: (_item, record) => {
                const hasDiscount = !!valuesForm[`variant_${record?.variant?.id}_discount`];

                return <Flex vertical gap={4}>
                    <Text className="text-small">{formatNumberToCurrency(valuesForm[`variant_${record?.variant?.id}_price`] || 0)}đ</Text>
                    {hasDiscount && <Text className="color-base text-small">{`(-${formatNumberToCurrency(valuesForm[`variant_${record?.variant?.id}_discount`])}${OPTIONS_UNIT[valuesForm[`variant_${record?.variant?.id}_unit`]]?.label})`}</Text>}
                </Flex>
            }
        },
        {
            title: 'SL',
            dataIndex: 'quantity',
            key: 'quantity',
            width: '15%',
            align: 'center',
            render: (_item, record) => {
                return <Flex vertical gap={4} align="center">
                    <Text>{valuesForm[`variant_${record?.variant?.id}_quantity`] || '--'}</Text>
                    {!valuesForm[`variant_${record?.variant?.id}_quantity`] && <Tooltip title="Vui lòng nhập số lượng hàng hóa" placement="top">
                        <WarningFilled className="color-danger" style={{ fontSize: 18 }} />
                    </Tooltip>}
                </Flex>
            }
        },
        {
            title: 'Thành tiền',
            dataIndex: 'originPrice',
            key: 'originPrice',
            width: '22%',
            render: (item, record) => {
                const [variantDiscountUnit, variantPrice, variantQuantity, variantDiscount] = [
                    valuesForm[`variant_${record?.variant?.id}_unit`],
                    valuesForm[`variant_${record?.variant?.id}_price`],
                    valuesForm[`variant_${record?.variant?.id}_quantity`],
                    valuesForm[`variant_${record?.variant?.id}_discount`],
                ]
                let price;

                if (variantDiscountUnit) {
                    price = variantQuantity * (variantPrice - Math.round((variantDiscount * variantPrice) / 100))
                } else {
                    price = variantQuantity * (variantPrice - variantDiscount)
                };

                return <Text className="text-small">{formatNumberToCurrency(Number(price))}đ</Text>

            }
        },
    ];

    const isExpand = useMemo(() => collapseActiveKey?.includes(KEY_COLLAPSE_PRODUCT), [collapseActiveKey]);

    const extraTitle = useMemo(() => isExpand ? 'Thu gọn' : 'Mở rộng', [isExpand]);

    const onExpand = useCallback(() => {
        setCollapseActiveKey((prev: string[]) => isExpand
            ? prev.filter((key: string) => key != KEY_COLLAPSE_PRODUCT)
            : prev.concat([KEY_COLLAPSE_PRODUCT]))
    }, [isExpand]);

    return (
        <Fragment>
            {showModalAdd && <ModalAddVariant
                show={showModalAdd}
                onHide={() => setShowModalAdd(false)}
                onAddVariantsOrder={(variants) => {
                    setVariantsOrder(prev => prev.concat(variants));
                    const variantsField = variants?.reduce((result, variant) => {
                        result[`variant_${variant?.variant?.id}_price`] = variant?.variant?.price || 0;
                        result[`variant_${variant?.variant?.id}_discount`] = 0;
                        result[`variant_${variant?.variant?.id}_unit`] = OPTIONS_UNIT[1].value;

                        return result;
                    }, {});

                    form.setFieldsValue(variantsField);
                }}
            />}
            {!!currentVariant && <ModalEditVariant
                currentVariant={currentVariant}
                onHide={() => setCurrentVariant(null)}
                onEditVariant={(values, variantSelect) => {
                    form.setFieldsValue({
                        [`variant_${variantSelect?.id}_price`]: values?.price,
                        [`variant_${variantSelect?.id}_quantity`]: values?.quantity,
                        [`variant_${variantSelect?.id}_discount`]: values?.discount,
                        [`variant_${variantSelect?.id}_unit`]: values?.unit
                    })
                }}
            />}
            <Collapse
                className="collapse-order-manual"
                size="small"
                accordion={true}
                {...(isExpand && {
                    activeKey: KEY_COLLAPSE_PRODUCT
                })
                }
                collapsible="icon"
                items={
                    [{
                        key: KEY_COLLAPSE_PRODUCT,
                        showArrow: false,
                        forceRender: true,
                        extra: <Text
                            className="cursor-pointer color-base"
                            onClick={onExpand}
                        >
                            {extraTitle}
                        </Text>,
                        label: <Text strong>Thông tin hàng hóa</Text>,
                        children: <Flex vertical>
                            <Row gutter={20}>
                                <Col span={14}>
                                    <Form.Item>
                                        <Select
                                            placeholder="Chọn kho"
                                            value={smeWarehouseSelected}
                                            onChange={value => {
                                                setVariantsOrder([]);
                                                if (!value) {
                                                    setSmeWarehouseSelected(null);
                                                    return;
                                                }

                                                const warehouseSelect = optionsSmeWarehouse?.find(wh => wh?.value == value);
                                                setSmeWarehouseSelected(warehouseSelect);
                                            }}
                                            allowClear
                                            options={optionsSmeWarehouse}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={10}>
                                    <Button
                                        type="primary"
                                        disabled={!smeWarehouseSelected}
                                        onClick={() => setShowModalAdd(true)}
                                        block
                                    >
                                        Thêm hàng hóa
                                    </Button>
                                </Col>
                            </Row>
                            <Table
                                className="ant-upbase"
                                dataSource={variantsOrder}
                                columns={columns as any}
                                scroll={{ y: 450 }}
                                onRow={(record) => {
                                    return {
                                        onMouseEnter: () => {
                                            setShowActionKey(record?.key);
                                        },
                                        onMouseLeave: () => {
                                            setShowActionKey(null);
                                        },
                                    };
                                }}
                                bordered
                                pagination={false}
                            />
                        </Flex>
                    }]}
            />
        </Fragment >
    )
}

export default memo(InfoProduct);