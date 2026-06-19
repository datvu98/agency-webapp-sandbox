import { BgColorsOutlined, WarningFilled } from "@ant-design/icons";
import { Button, Checkbox, Col, ColorPicker, Flex, Form, Input, Modal, Popover, Radio, Row, Spin, Typography, theme } from "antd";
import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import type { ColorPickerProps, GetProp } from 'antd';
import styled from "styled-components";
import { useClickOutside } from 'hooks';
import { useMutation } from "@apollo/client";
import mutate_conversationLabelCreate from "graphql/mutations/mutate_conversationLabelCreate";
import mutate_conversationLabelUpdate from "graphql/mutations/mutate_conversationLabelUpdate";
import * as Yup from "yup";
import { showAlert } from "utils/helper";

interface ModalActionLabelProps {
    sme?: number,
    show: boolean,
    type: string,
    currentLabel: any,
    onHide: () => void
}

type Color = GetProp<ColorPickerProps, 'value'>;
const { Text } = Typography;

const ModalActionWrapper = styled(Modal).attrs((props: { color: string }) => props)`
    .input-color-picker {
        height: 35px;
        background-color: ${(props) => props.color} !important;
        color: ${(props) => !!props.color ? '#fff' : ''};
        
        &::placeholder {
            color: ${(props) => !!props.color ? '#fff' : ''};     
        }
    }

    .content {
        margin: 20px 0px 30px;
    }

    .icon-color-picker {
        font-size: 30px;
        cursor: pointer;
        color: ${(props) => !!props.color ? props.color : ''}
    }
`;


const ModalActionLabel = ({
    sme,
    show,
    currentLabel,
    type = 'create',
    onHide
}: ModalActionLabelProps) => {
    const { token } = theme.useToken();
    const [form] = Form.useForm();
    const refColorPicker = useRef();
    const [openColorPicker, setOpenColorPicker] = useState<boolean>(false);
    const [currentColor, setCurrentColor] = useState<Color>('#ff5629');

    const schema = Yup.object().shape({
        name: Yup.string()
            .required('Vui lòng nhập tên nhãn hội thoại')
            .max(50, 'Tên nhãn hội thoại không được vượt quá 50 ký tự')
            .test(
                'chua-ky-tu-space-o-dau-cuoi',
                'Tên nhãn hội thoại không được chứa dấu cách ở đầu và cuối',
                (value, context) => {
                    if (!!value) {
                        return value.length == value.trim().length;
                    }
                    return false;
                },
            )
            .test(
                'chua-ky-tu-2space',
                'Tên nhãn hội thoại không được chứa 2 dấu cách liên tiếp',
                (value, context) => {
                    if (!!value) {
                        return !(/\s\s+/g.test(value))
                    }
                    return false;
                },
            )
    });

    const [createConversationLabel, { loading: loadingCreate }] = useMutation(mutate_conversationLabelCreate, {
        awaitRefetchQueries: true,
        refetchQueries: ['conversationLabelList']
    });

    const [updateConversationLabel, { loading: loadingUpdate }] = useMutation(mutate_conversationLabelUpdate, {
        awaitRefetchQueries: true,
        refetchQueries: ['conversationLabelList']
    });

    useClickOutside(refColorPicker, () => setOpenColorPicker(false));

    useMemo(() => {
        if (currentLabel) {
            form.setFieldValue(`name`, currentLabel?.title);
            setCurrentColor(currentLabel?.color);
        }
    }, [currentLabel]);

    const [title, textConfirm] = useMemo(() => {
        if (type == 'create') return ['Tạo nhãn hội thoại', 'Tạo'];

        return ['Cập nhật nhãn hội thoại', 'Cập nhật']
    }, [type]);

    const bgColor = useMemo<string>(
        () => (typeof currentColor === 'string' ? currentColor : currentColor!.toHexString()),
        [currentColor],
    );

    const yupSync: any = {
        async validator({ field }, value) {
            await schema.validateSyncAt(field, { [field]: value });
        },
    };

    const onReset = useCallback(() => {
        setOpenColorPicker(false);
        setTimeout(() => {
            setCurrentColor('#ff5629');
            form.resetFields();
            onHide();
        }, 50)
    }, [form]);
    console.log(sme)
    const onActionLabel = useCallback(() => {
        form.validateFields()
            .then(async values => {
                if (currentLabel) {
                    const { data } = await updateConversationLabel({
                        variables: {
                            id: currentLabel?.id,
                            title: values?.name,
                            color: bgColor,
                        }
                    }) as any;

                    if (data?.conversationLabelUpdate?.success) {
                        onReset();
                        showAlert.success('Cập nhật nhãn mới thành công');
                    } else {
                        showAlert.error(data?.conversationLabelUpdate?.message || 'Cập nhật nhãn mới thất bại');
                    }
                } else {
                    const { data } = await createConversationLabel({
                        variables: {
                            title: values?.name,
                            color: bgColor,
                            smeId: sme ? +sme : null
                        }
                    }) as any;

                    if (data?.conversationLabelCreate?.success) {
                        onReset();
                        showAlert.success('Tạo nhãn mới thành công');
                    } else {
                        showAlert.error(data?.conversationLabelCreate?.message || 'Tạo nhãn mới thất bại');
                    }
                }
            })
    }, [form, bgColor, currentLabel]);

    return (
        <ModalActionWrapper
            title={title}
            open={show}
            color={bgColor}
            closable={true}
            maskClosable={false}
            onCancel={() => {
                if (loadingCreate || loadingUpdate) return;
                onReset();
            }}
            centered
            footer={[
                <Flex className="w-100" align="center" gap={20} justify="flex-end">
                    <Button
                        type="primary"
                        className="btn-base btn-cancel"
                        disabled={loadingCreate || loadingUpdate}
                        onClick={onReset}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="primary"
                        className="btn-base"
                        loading={loadingCreate || loadingUpdate}
                        onClick={onActionLabel}
                    >
                        {textConfirm}
                    </Button>
                </Flex>
            ]}
        >
            <Spin spinning={loadingCreate || loadingUpdate}>
                <Form
                    form={form}
                    name="basic"
                    layout="vertical"
                    // onValuesChange={(changedValues, allValues) => {
                    //     // Update form values
                    //     form.setFieldsValue(changedValues);

                    //     // Get all field errors
                    //     const fieldsError = form.getFieldsError();

                    //     // Set form errors
                    //     setFormErrors(fieldsError.reduce((acc, field) => {
                    //         if (field.errors.length > 0) {
                    //             acc[field.name[0]] = field.errors;
                    //         }
                    //         return acc;
                    //     }, {}));
                    // }}
                    initialValues={{ remember: true }}
                >
                    <Row align="middle" justify="space-between" className="content">
                        <Col span={20}>
                            <Form.Item
                                style={{ margin: 0 }}
                                name="name"
                                rules={[yupSync]}
                            >
                                <Input
                                    className="input-color-picker"
                                    placeholder="Nhập tên nhãn hội thoại"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Flex justify="flex-end">
                                <ColorPicker
                                    placement="bottom"
                                    open={openColorPicker}
                                    value={bgColor}
                                    destroyTooltipOnHide
                                    onChangeComplete={value => {
                                        setCurrentColor(value);
                                        setOpenColorPicker(false);
                                    }}
                                    styles={{ popupOverlayInner: { width: '100%' } }}
                                >
                                    <BgColorsOutlined
                                        ref={refColorPicker as any}
                                        className="icon-color-picker"
                                        onClick={() => setOpenColorPicker(true)}
                                    />
                                </ColorPicker>
                            </Flex>
                        </Col>
                    </Row>
                </Form>
            </Spin>
        </ModalActionWrapper>
    )
};

export default memo(ModalActionLabel);