import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined, UserOutlined, KeyOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Col, Flex, Form, Image, Input, Row, Typography } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router';
import LoginWrapper from './Login.style';
import { showAlert } from 'utils/helper';
import { useGlobalSliceSlice } from 'app/slice';
import { selectGlobalSlice } from 'app/slice/selectors';
import logo from '../../../assets/logo.svg'
import { Menu } from 'antd';
import { menuItems } from './LoginHelper';
import type { MenuProps } from 'antd/lib/menu';
import queryString from 'querystring';
import { RuleObject } from 'antd/es/form';
import mutate_agencyUserLogin from 'graphql/mutations/mutate_agencyUserLogin';
import mutate_agencySubUserLogin from 'graphql/mutations/mutate_agencySubUserLogin';
import { useMutation } from '@apollo/client';
import client from 'apollo';
import query_user from 'graphql/queries/query_user';
import { error } from 'console';
import { Link } from 'react-router-dom';

const { Text } = Typography;
const key_login = 'login';

const Login = () => {
    const { actions } = useGlobalSliceSlice()
    const { accessToken } = useSelector(selectGlobalSlice)

    const navigate = useNavigate();
    const location: any = useLocation();
    const [form] = Form.useForm();
    const dispatch = useDispatch()
    const [isChecked, onChangeRemember] = useState(JSON.parse(localStorage.getItem('isChecked') || 'false'))

    const [mutate, { loading }] = useMutation(mutate_agencyUserLogin)
    const [mutateSubUserLogin, { loading: loadingSubUserLogin }] = useMutation(mutate_agencySubUserLogin)
    //useMutation(login)

    const [openModal, setOpenModal] = useState<boolean>(false);
    const [current, setCurrent] = useState<string>('user');
    const params = queryString.parse(location.search.slice(1, 100000));
    useEffect(() => {
        if (!!accessToken) {
            const { from } = location?.state || {}
            navigate(from?.pathname || '/')
        }
    }, [accessToken, location?.state])

    useMemo(() => {
        if (params?.login_type) {
            setCurrent(`${params?.login_type}`)
        }
    }, [params?.login_type])

    const onFinish = useCallback(
        async (value: any) => {
            if (params?.login_type != "sub-user") {
                let { username, password } = value;
                let { data } = await mutate({
                    variables: {
                        agencyUserLoginInput: {
                            email: username,
                            password
                        }
                    }
                })

                if (data?.agencyUserLogin?.success) {
                    dispatch(actions.saveToken({ token: data?.agencyUserLogin?.accessToken, email: username }))
                    localStorage.setItem('refresh_token', data?.agencyUserLogin?.refreshToken)
                    showAlert.success('Đăng nhập thành công.');
                    navigate('/');

                    if (isChecked) {
                        localStorage.setItem('username', username)
                        localStorage.setItem('password', password)
                        localStorage.setItem('isChecked', JSON.stringify(isChecked))
                    } else {
                        localStorage.removeItem('username')
                        localStorage.removeItem('password')
                        localStorage.removeItem('isChecked')
                    }

                    localStorage.setItem('email', username)
                    localStorage.setItem('accessToken', data?.agencyUserLogin?.accessToken)
                    const { data: dataUser } = await client.query({
                        query: query_user
                    });
                    if (!!dataUser?.agencyMe) {
                        localStorage.setItem('user', JSON.stringify(dataUser?.agencyMe));
                        dispatch(actions.saveUser({
                            user: dataUser?.agencyMe
                        }))
                    };
                } else {
                    showAlert.error(data?.agencyUserLogin?.message || "Đăng nhập không thành công.");
                }
            } else {
                let { agency_id, subusername, password } = value;
                let { data } = await mutateSubUserLogin({
                    variables: {
                        agencySubUserLoginInput: {
                            agencyId: +agency_id,
                            username: subusername,
                            password
                        }
                    }
                })

                if (data?.agencySubUserLogin?.success) {
                    dispatch(actions.saveToken({ token: data?.agencySubUserLogin?.accessToken, email: subusername }))
                    localStorage.setItem('refresh_token', data?.agencySubUserLogin?.refreshToken)
                    showAlert.success('Đăng nhập tài khoản phụ thành công.');
                    navigate('/');

                    if (isChecked) {
                        localStorage.setItem('agency_id', agency_id)
                        localStorage.setItem('subusername', subusername)
                        localStorage.setItem('password', password)
                        localStorage.setItem('isChecked', JSON.stringify(isChecked))
                    } else {
                        localStorage.removeItem('agency_id')
                        localStorage.removeItem('subusername')
                        localStorage.removeItem('password')
                        localStorage.removeItem('isChecked')
                    }
                    localStorage.setItem('accessToken', data?.agencySubUserLogin?.accessToken)
                    const { data: dataUser } = await client.query({
                        query: query_user
                    });
                    if (!!dataUser?.agencyMe) {
                        localStorage.setItem('user', JSON.stringify(dataUser?.agencyMe));
                        dispatch(actions.saveUser({
                            user: dataUser?.agencyMe
                        }))
                    };

                } else {
                    showAlert.error(data?.agencySubUserLogin?.message || "Đăng nhập tài khoản phụ không thành công.");
                }
            }

        }, [location?.state, isChecked, params?.login_type]
    );

    const validatePassword = (rule: RuleObject, value: string) => {
        if (!!value && value?.length < 6) {
            return Promise.reject(new Error('Mật khẩu tối thiểu 6 kí tự'));
        }
        return Promise.resolve();
    };

    const onClick: MenuProps['onClick'] = (e) => {
        setCurrent(e.key);
        navigate({
            pathname: location.pathname,
            search: queryString.stringify({ ...params, login_type: e.key }),
        });
        form.setFieldsValue({
            username: '',
            password: '',
            agency_id: '',
            subusername: ''
        })
    };

    return (
        <LoginWrapper>
            <Helmet
                titleTemplate="Đăng nhập - UpS"
                defaultTitle="Đăng nhập - UpS"
            >
                <meta name="description" content="Đăng nhập - UpS" />
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
                <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={menuItems} />
                <Form
                    form={form}
                    onFinish={onFinish}
                    className="form-brand"
                    layout="vertical"
                    initialValues={{
                        username: localStorage.getItem('username') || '',
                        password: localStorage.getItem('password') || '',
                        agency_id: localStorage.getItem('agency_id') || '',
                        subusername: localStorage.getItem('subusername') || ''
                    }}
                    autoComplete='nope'
                >
                    {current == 'sub-user' && <Form.Item
                        name="agency_id"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mã tài khoản chính' },
                            { pattern: /^[0-9]*$/, message: 'Mã tài khoản chỉ được nhập số' }
                        ]}
                    >
                        <Input
                            className="input-item"
                            placeholder="Nhập mã tài khoản chính"
                            disabled={loading}
                            prefix={<KeyOutlined style={{ marginRight: 4, color: '#F24E1E' }} />}
                            allowClear
                            autoComplete="off"
                        />
                    </Form.Item>}
                    {current != 'sub-user' && <Form.Item
                        name="username"
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
                    </Form.Item>}
                    {current == 'sub-user' && <Form.Item
                        name="subusername"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên tài khoản hoặc email' },
                        ]}
                    >
                        <Input
                            className="input-item"
                            placeholder="Nhập email hoặc tên tài khoản"
                            disabled={loading}
                            prefix={<UserOutlined style={{ marginRight: 4, color: '#F24E1E' }} />}
                            allowClear
                            autoComplete="off"
                        />
                    </Form.Item>}
                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu' },
                            { validator: validatePassword },
                        ]}
                    >
                        <Input.Password
                            className="input-item"
                            placeholder="Nhập mật khẩu"
                            disabled={loading}
                            prefix={<LockOutlined style={{ marginRight: 4, color: '#F24E1E' }} />}
                            iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            autoComplete="nope"
                        />
                    </Form.Item>
                    <div className="" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Checkbox
                            checked={isChecked}
                            onChange={e => onChangeRemember(e.target.checked)}
                            style={{ marginBottom: 20, }}
                        >
                            Nhớ mật khẩu
                        </Checkbox>
                        {params?.login_type != 'sub-user' && <Link
                            style={{ color: '#019ef7', cursor: 'pointer' }}
                            // onClick={e => {
                            //     navigate('/forgot-password')
                            // }}
                            // type='link'
                            to={'/forgot-password'}
                        >
                            Quên mật khẩu
                        </Link>}
                    </div>
                    <Form.Item>
                        <Button
                            className="btn-brand btn-login"
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </LoginWrapper >
    );
};

export default Login;