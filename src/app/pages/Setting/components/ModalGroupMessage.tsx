import { DeleteFilled, DeleteOutlined } from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import { Button, Col, Flex, Form, Input, Modal, Row, Select, Spin, Typography } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import classNames from "classnames";
import mutate_chatTplMessageGroupCreateOrUpdate from "graphql/mutations/mutate_chatTplMessageGroupCreateOrUpdate";
import React, { FC, memo, useCallback, useContext, useMemo, useState } from "react";
import styled from "styled-components";
import { randomString, showAlert } from "utils/helper";
import * as Yup from "yup";

type ModalGroupMessageProps = {
    show: boolean,
    onHide: () => void,
    currentData: any,
    optionsStore: any
}

const { Text } = Typography;
const { TextArea } = Input;

const ModalWrapper = styled(Modal).attrs((props: { isScroll: boolean }) => props)`
    .ant-modal-body {
        margin: 24px 0px 28px;   
    }

    .icon-btn {
        font-size: 20px;
    }

    .message-body {
        padding: 0px 12px;
        margin: 0px -12px;
        max-height: 40vh;
        overflow: auto;
        // overflow: ${(props) => props.isScroll ? 'auto' : 'unset'};
    }
`;

const MAX_MESSAGES = 10;

const ModalGroupMessage: FC<ModalGroupMessageProps> = ({ show, onHide, currentData, optionsStore }) => {
    const [form] = Form.useForm();
    const [messages, setMessages] = useState<any>([]);
    const [schema, setSchema] = useState<any>({
        name: Yup.string()
            .required('Vui lòng nhập tên nhóm tin nhắn')
            .max(100, 'Tên nhóm tin nhắn không được vượt quá 100 ký tự')
            .test(
                'chua-ky-tu-space-o-dau-cuoi',
                'Tên nhóm tin nhắn không được chứa dấu cách ở đầu và cuối',
                (value, context) => {
                    if (!!value) {
                        return value.length == value.trim().length;
                    }
                    return false;
                },
            )
            .test(
                'chua-ky-tu-2space',
                'Tên nhóm tin nhắn không được chứa 2 dấu cách liên tiếp',
                (value, context) => {
                    if (!!value) {
                        return !(/\s\s+/g.test(value))
                    }
                    return false;
                },
            ),
        stores: Yup.array().min(1, "Vui lòng chọn gian hàng").required('Vui lòng chọn gian hàng')
    });

    const [mutateChatTplMessageGroupCreateOrUpdate, { loading }] = useMutation(mutate_chatTplMessageGroupCreateOrUpdate, {
        awaitRefetchQueries: true,
        refetchQueries: ['chatTplMessageGroups']
    });

    useMemo(() => {
        if (!!currentData) {
            form.setFieldsValue({
                name: currentData?.name,
                stores: currentData?.stores
            });
            setMessages(currentData?.messages?.map(item => {
                const id = randomString();
                form.setFieldValue(`message-${id}`, item);

                return { id }
            }));
        }
    }, [currentData]);

    const isUpdate = useMemo(() => !!currentData, [currentData]);

    const optionsStoreApply = useMemo(() => {
        return optionsStore?.map(store => ({
            value: store?.id,
            label: store?.name,
            logo: store?.channel?.logo_asset_url
        }))
    }, [optionsStore]);

    useMemo(() => {
        const messagesSchema = messages.reduce((result, value) => {
            result[`message-${value?.id}`] = Yup.string()
                .required('Vui lòng nhập tin nhắn')
                .max(525, 'Tin nhắn không được vượt quá 525 ký tự')
                .test(
                    'chua-ky-tu-space-o-dau-cuoi',
                    'Tin nhắn không được chứa dấu cách ở đầu và cuối',
                    (value, context) => {
                        if (!!value) {
                            return value.length == value.trim().length;
                        }
                        return false;
                    },
                )
                .test(
                    'chua-ky-tu-2space',
                    'Tin nhắn không được chứa 2 dấu cách liên tiếp',
                    (value, context) => {
                        if (!!value) {
                            return !(/\s\s+/g.test(value))
                        }
                        return false;
                    },
                );

            return result
        }, {});

        setSchema(prev => ({ ...prev, ...messagesSchema }));
    }, [messages]);

    const yupSync: any = useMemo(() => {
        return {
            async validator({ field }, value) {
                await Yup.object().shape(schema).validateSyncAt(field, { [field]: value });
            }
        }
    }, [schema]);

    const onCreateOrUpdate = useCallback(() => {
        try {
            form.validateFields()
                .then(async values => {
                    console.log({
                        variables: {
                            ...(!!currentData ? {
                                id: currentData?.id
                            } : {}),
                            name: values?.name,
                            stores: values?.stores?.map(st => Number(st)),
                            messages: messages?.map(mess => values[`message-${mess?.id}`])
                        }
                    })
                    const { data } = await mutateChatTplMessageGroupCreateOrUpdate({
                        variables: {
                            ...(!!currentData ? {
                                id: currentData?.id
                            } : {}),
                            name: values?.name,
                            stores: values?.stores?.map(st => Number(st)),
                            messages: messages?.map(mess => values[`message-${mess?.id}`])
                        }
                    });

                    if (!!data?.chatTplMessageGroupCreateOrUpdate?.success) {
                        onCancel();
                        showAlert.success(isUpdate ? "Cập nhật nhóm tin nhắn thành công" : "Thêm nhóm tin nhắn thành công");
                    } else {
                        showAlert.error(isUpdate ? "Cập nhật nhóm tin nhắn thất bại" : "Thêm nhóm tin nhắn thất bại");
                    }
                })
        } catch (error) {
            showAlert.error('Có lỗi xảy ra, xin vui lòng thử lại')
        }
    }, [messages, currentData, isUpdate]);


    const onAddMessage = useCallback(() => {
        if (messages?.length > MAX_MESSAGES - 1) return;
        setMessages(prev => prev.concat([{
            id: randomString()
        }]))
    }, [messages]);

    const onDeleteMessage = useCallback((id) => {
        setMessages(prev => prev.filter(mess => mess?.id != id));
    }, [messages]);

    const onCancel = useCallback(() => {
        onHide();
        form.resetFields();
        setMessages([]);
    }, []);

    return (
        <ModalWrapper
            open={show}
            title={isUpdate ? "Cập nhật nhóm tin nhắn nhanh" : "Thêm nhóm tin nhắn nhanh"}
            closable={false}
            width={750}
            centered
            footer={[
                <Flex align="center" justify="space-between">
                    <Text
                        className={classNames("color-base cursor-pointer", {
                            "cursor-not-allowed": messages?.length > MAX_MESSAGES - 1
                        })}
                        onClick={onAddMessage}
                    >
                        + Thêm tin nhắn mới
                    </Text>
                    <Flex align="center" gap={20}>
                        <Button
                            type="primary"
                            className="btn-base btn-cancel"
                            disabled={loading}
                            onClick={onCancel}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            className="btn-base"
                            loading={loading}
                            disabled={messages?.length == 0}
                            onClick={onCreateOrUpdate}
                        >
                            {isUpdate ? 'Cập nhật' : 'Thêm'}
                        </Button>
                    </Flex>
                </Flex>
            ]}
        >
            <Spin spinning={loading}>
                <Form
                    form={form}
                    name="basic"
                    layout="vertical"
                    initialValues={{ remember: true }}
                >
                    <Flex vertical gap={12}>
                        <Form.Item
                            style={{ margin: 0 }}
                            name="name"
                            required
                            rules={[yupSync]}
                        >
                            <Input
                                className="input-base"
                                placeholder="Nhập tên nhóm tin nhắn nhanh"
                                allowClear
                                maxLength={100}
                            />
                        </Form.Item>
                        <Form.Item
                            style={{ margin: 0 }}
                            name="stores"
                            required
                            rules={[yupSync]}
                        >
                            <Select
                                mode="multiple"
                                className="select-base"
                                placeholder="Chọn gian hàng áp dụng"
                                options={optionsStoreApply}
                                labelRender={item => {
                                    const store = optionsStoreApply?.find(op => op?.value == item?.value);
                                    return <Flex gap={4} align="center">
                                        <img src={store?.logo} style={{ width: 16, height: 16, borderRadius: 4 }} />
                                        <Text>{item?.label}</Text>
                                    </Flex>
                                }}
                                optionRender={option => {
                                    return <Flex gap={4} align="center">
                                        <img src={option?.data?.logo} style={{ width: 16, height: 16, borderRadius: 4 }} />
                                        <Text>{option?.label}</Text>
                                    </Flex>
                                }}
                            />
                        </Form.Item>
                        <Text strong>Tin nhắn nhanh ({messages?.length}/{MAX_MESSAGES})</Text>
                        <Flex vertical gap={20} className="message-body">
                            {messages?.map((mess, index) => {
                                return <Row align="middle" key={`message-${index}`}>
                                    <Col span={1}>{index + 1}</Col>
                                    <Col span={22}>
                                        <Form.Item
                                            style={{ margin: 0 }}
                                            name={`message-${mess?.id}`}
                                            required
                                            rules={[yupSync]}
                                        >
                                            <TextArea
                                                placeholder="Nhập tin nhắn"
                                                maxLength={525}
                                                showCount
                                                allowClear
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={1}>
                                        <Flex justify="end">
                                            <DeleteFilled
                                                className="color-danger icon-btn cursor-pointer"
                                                onClick={() => onDeleteMessage(mess?.id)}
                                            />
                                        </Flex>
                                    </Col>
                                </Row>
                            })}
                        </Flex>
                    </Flex>
                </Form>
            </Spin>
        </ModalWrapper>
    )
};

export default memo(ModalGroupMessage);