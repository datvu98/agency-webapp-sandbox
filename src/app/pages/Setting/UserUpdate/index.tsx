import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, Col, Collapse, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image, Input, Form } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { UserSettingWrapper } from '../Setting.styles';
import { useNavigate } from "react-router-dom"; import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import type { GetProp, UploadProps } from 'antd';
import { showAlert } from "utils/helper";
import { useForm } from "antd/es/form/Form";
import { useDispatch, useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import mutate_agencyUpdateMe from "graphql/mutations/mutate_agencyUpdateMe";
import query_user from "graphql/queries/query_user"
import { useGlobalSliceSlice } from "app/slice";
import { DeleteOutlined } from "@ant-design/icons";
import Axios from "axios";

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const { Text } = Typography;

const UserUpdate = () => {
    const { appendBreadcrumb } = useLayoutContext();
    const navigate = useNavigate()
    const [imageUrl, setImageUrl] = useState<any>();
    const [loadingFile, setLoadingFile] = useState<boolean>(false);
    const { user } = useSelector(selectGlobalSlice)
    const dispatch = useDispatch()
    const { actions } = useGlobalSliceSlice()

    const [form] = useForm();
    const [mutate, { loading }] = useMutation(mutate_agencyUpdateMe, {
        awaitRefetchQueries: true,
        refetchQueries: [{ query: query_user }]
    })

    useMemo(() => {
        setImageUrl(user?.avatar_url)
    }, [user])

    useLayoutEffect(() => {
        appendBreadcrumb([
            { title: user?.category_code == 'fulfillment' ? "Quản lý tài khoản " : "Cấu hình", pathname: "/settings" },
            {
                title: 'Tài khoản',
                pathname: '/settings/user',
            },
        ]);
    }, []);

    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Upload</div>
        </button>
    );

    const beforeUpload = (file: FileType) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            showAlert.error('Bạn chỉ có thể tải lên file có định dạng là JPG/PNG');
            return;
        };

        if (file.size > 2 * 1024 * 1024) {
            showAlert.error('Ảnh gửi lên tối đa 2MB');
            return;
        }
        let formData = new FormData();
        formData.append('type', 'file')
        formData.append('file', file, file.name || 'file.jpg');
        setLoadingFile(true);

        Axios.post(process.env.REACT_APP_URL_FILE_UPLOAD as string, formData)
            .then((response) => {
                setImageUrl(response?.data?.data?.source);
            })
            .catch((error) => {
                showAlert.error("Upload thất bại");
            })
            .finally(() => {
                setLoadingFile(false);
            });

        // fetch(process.env.REACT_APP_URL_FILE_UPLOAD as string, {
        //     method: 'POST',
        //     headers: {
        //         "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
        //     },
        //     body: formData
        // }).then(function (response) {
        //     return response.json()
        // }).then(function (response) {
        //     setImageUrl(response?.data?.source)

        // }).finally(() => {
        //     setLoadingFile(false);
        // });
    };
    const handleSubmit = async (values) => {
        console.log('Form values:', values);
        // Perform password update logic here
        let { data } = await mutate({
            variables: {
                agencyUpdateMeInput: {
                    avatarUrl: imageUrl,
                    fullName: values?.name,
                    phone: values?.phone
                }
            }
        })

        if (data?.agencyUpdateMe?.success) {
            showAlert.success('Cập nhật thông tin thành công')
            dispatch(actions.updateUser({ full_name: values?.name, phone: values?.phone, avatar_url: imageUrl }))
            localStorage.setItem('user', JSON.stringify({
                ...user,
                full_name: values?.name,
                phone: values?.phone,
                avatar_url: imageUrl
            }))
            navigate('/settings/user')
        } else {
            showAlert.error(data?.agencyUpdateMe?.message || 'Cập nhật thông tin thất bại')
            navigate('/settings/user')
        }
    };

    const initialValues = useMemo(() => {
        return {
            name: user?.full_name,
            phone: user?.phone,
            imageUrl: user?.avatar_url
        }
    }, [user])

    const handleRemove = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setImageUrl('');
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
            onFinish={handleSubmit}
            initialValues={initialValues}
        >
            <Spin spinning={false}>
                <Card className="card-switch" title={false}>
                    <Flex align="center" gap={12}>
                        <Text strong>Cập nhật thông tin tài khoản</Text>
                    </Flex>
                    <Row style={{ marginTop: '20px', marginRight: '30%' }}>
                        <Flex vertical gap={12} style={{ width: '100%' }}>
                            <Flex style={{ textAlign: 'right', width: '100%' }} align="center" justify="center">
                                <Col span={11}>
                                    <Text strong>Tên doanh nghiệp:</Text>
                                </Col> <Col span={1}></Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="name"
                                        className="input-item"
                                        rules={[
                                            { max: 120, message: 'Tên doanh nghiệp tối đa 120 kí tự' },
                                            { whitespace: true, message: 'Tên doanh nghiệp không được chứa khoảng trắng đầu và cuối' },
                                        ]}
                                    >
                                        <Input placeholder="Nhập tên doanh nghiệp"></Input>
                                    </Form.Item>
                                </Col>
                            </Flex>
                            <Flex style={{ textAlign: 'right', width: '100%' }} align="center" justify="center">
                                <Col span={11}>
                                    <Text strong>Số điện thoại:</Text>
                                </Col> <Col span={1}></Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="phone"
                                        className="input-item"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập số điện thoại' },
                                            { pattern: /^0\d{9}$/, message: 'Số điện thoại sai định dạng' },
                                        ]}
                                    >
                                        <Input placeholder="Vui lòng nhập số diện thoại"></Input>
                                    </Form.Item>
                                </Col>
                            </Flex>

                            <Flex style={{ textAlign: 'right', width: '100%' }} justify="center">
                                <Col span={11}>
                                    <Text strong>Ảnh đại diện:</Text>
                                </Col> <Col span={1}></Col>
                                <Col span={12} style={{ textAlign: 'left' }}>
                                    <Form.Item
                                        name="imageUrl"
                                    >
                                        <Upload
                                            name="avatar"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            showUploadList={false}
                                            beforeUpload={beforeUpload}
                                            accept="image/png, image/jpeg"
                                            multiple={false}
                                            disabled={loadingFile}
                                            onRemove={value => {
                                                setImageUrl(null)
                                            }}
                                            onPreview={() => { }}
                                        >
                                            {imageUrl ?
                                                <div style={{ position: 'relative', width: '100%' }}>
                                                    <img src={imageUrl} alt="avatar" style={{ width: '100%', height: '100%' }} />
                                                    <Button
                                                        icon={<DeleteOutlined />}
                                                        onClick={handleRemove}
                                                        style={{ position: 'absolute', top: 0, right: 0, color: 'red' }}
                                                    />
                                                </div> : uploadButton}
                                        </Upload>
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

export default UserUpdate;