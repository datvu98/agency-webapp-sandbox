import { UserOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Form, Image, Input, Row, Typography } from 'antd';
import React, { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router';
import logo from '../../../assets/logo.svg'
import queryString from 'querystring';
import { useMutation } from '@apollo/client';
import ForgotPasswordWrapper from './ForgotPassword.style'
import { showAlert } from 'utils/helper';
import mutate_authAgencyChangePassword from 'graphql/mutations/mutate_authAgencyChangePassword';
import { RuleObject } from 'antd/es/form';

const { Text } = Typography;

const SetPassword = () => {
    const navigate = useNavigate();
    const location: any = useLocation();
    const [form] = Form.useForm();

    const [mutate, { loading }] = useMutation(mutate_authAgencyChangePassword)

    const params = queryString.parse(location.search.slice(1, 100000));

    const onFinish = useCallback(
        async (values: any) => {
            let { data } = await mutate({
                variables: {
                    password: values?.password,
                    token: params?.token
                }
            })
            if (data?.authAgencyChangePassword?.success) {
                showAlert?.success(data?.authAgencyChangePassword?.message)
                navigate('/login')
            } else {
                showAlert?.error(data?.authAgencyChangePassword?.message)
            }
        }, []
    );

    const validatePassword = (rule: RuleObject, value: string) => {
        if (!!value && value?.length < 6) {
            return Promise.reject(new Error('Mật khẩu tối thiểu 6 kí tự'));
        }
        return Promise.resolve();
    };

    return (
        <ForgotPasswordWrapper>
            <Helmet
                titleTemplate="Quên mật khẩu - UpS"
                defaultTitle="Quên mật khẩu - UpS"
            >
                <meta name="description" content="Quên mật khẩu - UpS" />
            </Helmet>
            {/* {isSpinLogin && (
                <Spin size='large' className="spin-login" />
            )} */}

            <Card className="card"
            >
                <Flex justify='center' align='center'>
                    <Image
                        width={100}
                        src={logo}
                    />
                    <Text className='login_header'>UpS Agency</Text>
                </Flex>
                <Flex justify='center' align='center'>
                    <Text className='login_slogan'>Make Business Better</Text>
                </Flex>

                <Flex justify='center' align='center'>
                    <Text className='forgot_pass_header'>Mật khẩu mới</Text>
                </Flex>
                <Form
                    form={form}
                    onFinish={onFinish}
                    className="form-brand"
                    layout="vertical"
                    autoComplete='nope'
                >
                    <Form.Item
                        name="password"
                        className="input-item"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                            { validator: validatePassword },
                        ]}
                    >
                        <Input.Password
                            className="input-item"
                            placeholder="Nhập mật khẩu mới" />
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        rules={[
                            { required: true, message: 'Vui lòng nhập lại mật khẩu mới' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu mới và nhập lại mật khẩu mới không khớp'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            className="input-item"
                            placeholder="Nhập lại mật khẩu mới" />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            className="btn-brand btn-login"
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            Cập nhật
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </ForgotPasswordWrapper >
    );
};

export default SetPassword;