import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, Col, Collapse, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image, Input, Form } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { UserSettingWrapper } from '../Setting.styles';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import mutate_agencyChangePassword from "graphql/mutations/mutate_agencyChangePassword";
import { showAlert } from "utils/helper";

const { Text } = Typography;

const UserChangePassword = () => {
    const { appendBreadcrumb } = useLayoutContext();
    const navigate = useNavigate();
    const { user } = useSelector(selectGlobalSlice);

    const [form] = Form.useForm();

    const [mutate, { loading }] = useMutation(mutate_agencyChangePassword)

    useLayoutEffect(() => {
        appendBreadcrumb([
            { title: user?.category_code == 'fulfillment' ? "Quản lý tài khoản " :"Cấu hình", pathname: "/settings" },
            {
                title: 'Tài khoản',
                pathname: '/settings/user',
            },
        ]);
    }, []);

    const handleSubmit = async (values) => {
        let { data } = await mutate({
            variables: {
                newPassword: values?.newPassword,
                oldPassword: values?.oldPassword
            }
        })
        if (data?.agencyChangePassword?.success) {
            showAlert.success('Đổi mật khẩu thành công')
            navigate('/settings/user')
        } else {
            showAlert.error(data?.agencyChangePassword?.message || 'Đổi mật khẩu thất bại')
            navigate('/settings/user')
        }
        // Perform password update logic here
    };

    return <UserSettingWrapper>
        <Helmet
            titleTemplate="Tài khoản"
            defaultTitle="Tài khoản"
        >
            <meta name="description" content="Tài khoản" />
        </Helmet>
        <Form
            form={form}
            onFinish={handleSubmit}>
            <Spin spinning={false}>
                <Card className="card-switch" title={false}>
                    <Flex align="center" gap={12}>
                        <Text strong>Đổi mật khẩu</Text>
                    </Flex>
                    <Row style={{ marginTop: '20px', marginRight: '30%' }}>
                        <Flex vertical gap={12} style={{ width: '100%' }}>
                            <Flex style={{ textAlign: 'right', width: '100%' }} align="center" justify="center">
                                <Col span={11}>
                                    <Text strong>Email</Text>
                                </Col> <Col span={1}></Col>
                                <Col span={12}>
                                    <Input disabled value={user?.email}></Input>
                                </Col>
                            </Flex>
                            <Flex style={{ textAlign: 'right', width: '100%' }} align="center" justify="center">
                                <Col span={11}>
                                    <Text strong>Mật khẩu cũ</Text>
                                </Col>
                                <Col span={1}></Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="oldPassword"
                                        className="input-item"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập mật khẩu cũ' },
                                        ]}
                                    >
                                        <Input.Password
                                            placeholder="Nhập mật khẩu" />
                                    </Form.Item>
                                </Col>
                            </Flex>
                            <Flex style={{ textAlign: 'right', width: '100%' }} align="center" justify="center">
                                <Col span={11}>
                                    <Text strong>Mật khẩu mới</Text>
                                </Col>
                                <Col span={1}></Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="newPassword"
                                        className="input-item"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                                            { min: 6, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' },
                                        ]}
                                    >
                                        <Input.Password
                                            placeholder="Nhập mật khẩu" />
                                    </Form.Item>
                                </Col>
                            </Flex>
                            <Flex style={{ textAlign: 'right', width: '100%' }} align="center" justify="center">
                                <Col span={11}>
                                    <Text strong>Nhập lại mật khẩu mới</Text>
                                </Col>
                                <Col span={1}></Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="confirmPassword"
                                        className="input-item"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập lại mật khẩu mới' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('newPassword') === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('Mật khẩu mới và nhập lại mật khẩu mới không khớp'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password
                                            placeholder="Nhập mật khẩu" />
                                    </Form.Item>
                                </Col>
                            </Flex>
                        </Flex>

                    </Row>
                    <Flex style={{ marginTop: '20px' }} gap={12} justify="center">
                        <Button
                            type="primary"
                            className="btn-base  btn-cancel"
                            onClick={() => { navigate('/settings/user') }}
                        >
                            Hủy
                        </Button>
                        <Form.Item>
                            <Button
                                type="primary"
                                className="btn-base"
                                htmlType="submit"
                                disabled={loading}
                            >
                                Cập nhật
                            </Button>
                        </Form.Item>
                    </Flex>
                </Card>
            </Spin>
        </Form>
    </UserSettingWrapper >
};

export default UserChangePassword;