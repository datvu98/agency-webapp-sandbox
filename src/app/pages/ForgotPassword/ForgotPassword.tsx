import { UserOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Form, Image, Input, Row, Typography } from 'antd';
import React, { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router';
import logo from '../../../assets/logo.svg'
import queryString from 'querystring';
import mutate_agencyUserLogin from 'graphql/mutations/mutate_agencyUserLogin';
import mutate_authAgencyForgotPassword from 'graphql/mutations/mutate_authAgencyForgotPassword';
import { useMutation } from '@apollo/client';
import ForgotPasswordWrapper from './ForgotPassword.style'
import { showAlert } from 'utils/helper';

const { Text } = Typography;

const ForgotPassword = () => {
    const navigate = useNavigate();
    const location: any = useLocation();
    const [form] = Form.useForm();

    const [mutate, { loading }] = useMutation(mutate_authAgencyForgotPassword)

    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const params = queryString.parse(location.search.slice(1, 100000));

    const onFinish = useCallback(
        async (values: any) => {
            const { data } = await mutate({
                variables: {
                    email: values?.email
                }
            })
            if (data?.authAgencyForgotPassword?.success) {
                showAlert?.success(data?.authAgencyForgotPassword?.message)
                setIsSuccess(true)
            } else {
                showAlert?.error(data?.authAgencyForgotPassword?.message)
            }
        }, []
    );

    // const isSuccess = false

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
                    <img
                        width={100}
                        src={logo}
                    />
                    <Text className='login_header'>UpS Agency</Text>
                </Flex>
                <Flex justify='center' align='center'>
                    <Text className='login_slogan'>Make Business Better</Text>
                </Flex>

                <Flex justify='center' align='center'>
                    <Text className='forgot_pass_header'>Quên mật khẩu</Text>
                </Flex>


                <Flex justify='center' align='center'>
                    {!isSuccess ? <Text style={{ textAlign: 'center' }}>Vui lòng nhập email đã đăng kí tài khoản, Upbase sẽ gửi cho bạn mã xác nhận để cập nhật mật khẩu.</Text>
                        : <Text style={{ textAlign: 'center' }}>{`UpS đã gửi mã xác nhận tới email ${form.getFieldValue('email')}.\n Bạn vui lòng kiểm tra email vào thao tác theo hướng dẫn.`}</Text>}
                </Flex>
                {!isSuccess && <Form
                    form={form}
                    onFinish={onFinish}
                    className="form-brand"
                    layout="vertical"
                    autoComplete='nope'
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập Email' },
                            { type: 'email', message: 'Email sai định dạng' }
                        ]}
                    >
                        <Input
                            className="input-item"
                            placeholder="Email đăng nhập"
                            disabled={loading}
                            prefix={<UserOutlined style={{ marginRight: 4, color: '#F24E1E' }} />}
                            allowClear
                            autoComplete="off"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            className="btn-brand btn-login"
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            Tiếp tục
                        </Button>
                    </Form.Item>
                </Form>}

                {isSuccess && <Button
                    className="btn-brand btn-login"
                    type="primary"
                    onClick={() => {
                        navigate('/login')
                    }}
                >
                    Đóng
                </Button>}
            </Card>
        </ForgotPasswordWrapper >
    );
};

export default ForgotPassword;