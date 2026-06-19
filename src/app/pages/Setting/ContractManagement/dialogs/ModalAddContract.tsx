import React, { useMemo, useCallback, useState, useEffect } from "react";
import {
    Modal,
    Form,
    Typography,
    DatePicker,
    Input,
    Row,
    Col,
    Select,
    Flex,
    Image,
    Tooltip,
    Space,
    Button,
} from "antd";
import mutate_vrUpsertCmsContract from "graphql/mutations/mutate_vrUpsertCmsContract";
import { useMutation } from "@apollo/client";
import { showAlert } from "utils/helper";

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const ModalAddContract = ({ onHide, show, optionsStore, smeId }) => {
    const [form] = Form.useForm();
    const [currentStores, setCurrentStores] = useState<number[] | null>(null);

    const [vrUpsertCmsContract, { loading: loadingVrUpsertCmsContract }] = useMutation(mutate_vrUpsertCmsContract, {
        awaitRefetchQueries: true,
        refetchQueries: ["vrCmsContracts"],
    });

    const handleSubmit = async (values) => {
        try {
            const [start, end] = values.rangeTime;
        
            let { data } = await vrUpsertCmsContract({
                variables: {
					begin_at: start.format("YYYY-MM-DD"),
					end_at: end.format("YYYY-MM-DD"),
                    title: values?.name,
                    description: values?.description,
                    store_ids: currentStores,
                    sme_id: smeId,
                }
            })

            if (data?.vrUpsertCmsContract?.success) {
                showAlert.success("Thêm hợp đồng thành công");
                onHide();
            } else {
                showAlert.error(data?.vrUpsertCmsContract?.message || "Tạo hợp đồng thất bại");
            }
        } catch (err) {
            console.log(err);
        }
    };

    const renderLabelStore = useCallback((item) => {
        const store = optionsStore?.find(op => op?.value == item?.value);
        return <Flex gap={4} align="center">
            <img src={store?.channel?.logo_asset_url} style={{ width: 16, height: 16, borderRadius: 4 }} />
            <Text>{store?.label || item?.value}</Text>
        </Flex>
    }, [optionsStore]);

    const renderOptionsStore = useCallback((option) => {
        return <Flex gap={4} align="center">
            <img src={option?.data?.channel?.logo_asset_url} style={{ width: 16, height: 16, borderRadius: 4 }} />
            <Text>{option?.label}</Text>
        </Flex>
    }, []);

    // Reset form
    useEffect(() => {
        if (show) {
            form.resetFields();
            setCurrentStores(null);
        }
    }, [show]);

    return (
        <Modal
            open={show}
            onCancel={onHide}
            title="Thêm mới hợp đồng"
            centered
            width={600}
            footer={null}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="name"
                            label="Tên hợp đồng"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên hợp đồng",
                                },
                                { max: 255, message: "Tối đa 255 ký tự" },
                                {
                                    validator: (_, value) => {
                                        if (value && value.trim().length === 0)
                                            return Promise.reject(
                                                "Tên hợp đồng không được chỉ gồm dấu cách"
                                            );
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <Input placeholder="Nhập tên hợp đồng" maxLength={255}/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row style={{ marginBottom: 24 }}>
                    <Text>Chọn gian hàng áp dụng</Text>
                    <Select
                        mode={"multiple"}
                        className="w-100"
                        placeholder={'Tất cả'}
                        options={optionsStore}
                        value={currentStores}
                        onChange={(values) => {
                            if (values?.length) {
                                setCurrentStores(values);
                            } else {
                                setCurrentStores(null);
                            }
                        }}
                        allowClear
                        labelRender={item => renderLabelStore(item)}
                        optionRender={option => renderOptionsStore(option)}
                        maxTagCount='responsive'
                        maxTagPlaceholder={(omittedValues) => {
                            const hiddenStores = optionsStore?.filter(store => omittedValues.map((option) => option?.key).includes(store?.value))
                            return (    
                                <Tooltip
                                    overlayStyle={{
                                        pointerEvents: 'none',
                                    }}
                                    title={hiddenStores?.map(item => item?.label).join(', ')}
                                >
                                    <span>+ {omittedValues?.length} gian hàng</span>
                                </Tooltip>
                            )
                        }}
                    />
                </Row>
                <Row>
                    <Col span={24}>
                        <Form.Item
                            name="rangeTime"
                            label="Khoảng thời gian hợp đồng"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn khoảng thời gian hợp đồng",
                                },
                            ]}
                        >
                            <RangePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row style={{ marginBottom: 24 }}>
                    <Col span={24}>
                        <Form.Item label="Mô tả" name="description">
                            <TextArea rows={3} maxLength={1000} placeholder="Nhập mô tả" showCount />
                        </Form.Item>
                    </Col>
                </Row>

                <Space style={{ width: "100%", justifyContent: "end", marginTop: 10 }}>
                    <Button onClick={onHide} className="btn-base">
                        Huỷ
                    </Button>
                    <Button 
                        type="primary" 
                        className="btn-base" 
                        htmlType="submit"
                        loading={loadingVrUpsertCmsContract}
                    >
                        Thêm hợp đồng
                    </Button>
                </Space>
            </Form>
        </Modal>
    );
};

export default ModalAddContract;
