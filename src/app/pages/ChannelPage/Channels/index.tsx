import { DownOutlined, WarningFilled, WarningOutlined } from '@ant-design/icons';
import { Button, Card, Dropdown, Flex, Form, Spin, Table, Tooltip, Typography } from 'antd';
import { useGlobalSliceSlice } from 'app/slice';
import { selectGlobalSlice } from 'app/slice/selectors';
import { AlignType } from 'rc-table/lib/interface';
import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import SettingWrapper from '../Setting.style';
import ModalAddChannel from '../components/ModalAddChannel';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import queryStores from 'graphql/queries/query_stores';
import { sortBy } from 'lodash';
import dayjs from 'dayjs';
import { Outlet } from 'react-router-dom';
import ModalConfirmDisconnect from '../components/ModalConfirmDisconnect';
import mutate_scConversationAuthorizationCancel from 'graphql/mutations/mutate_scConversationAuthorizationCancel';
import { showAlert } from 'utils/helper';
import ChannelsAddRedirect from '../ChannelsAddRedirect';
import query_scConversationAuthorizationUrl from 'graphql/queries/query_scConversationAuthorizationUrl';
import AuthorizationWrapper from 'app/components/AuthorizationWrapper';

const { Text } = Typography;

const Channels = () => {
    const { actions } = useGlobalSliceSlice()
    const { accessToken } = useSelector(selectGlobalSlice)

    const navigate = useNavigate();
    const location: any = useLocation();
    const [form] = Form.useForm();
    const dispatch = useDispatch();

    const [currentStoreId, setCurrentStoreId] = useState<number | null>(null);
    const [showAddChannel, setShowAddChannel] = useState<boolean>(false);

    const { loading: loadingStores, data: dataStores } = useQuery(queryStores, {
        fetchPolicy: 'cache-and-network'
    });

    const [authorize, { data: dataAuthozie, loading: loadingAuthorize }] = useLazyQuery(query_scConversationAuthorizationUrl);

    const [cancelConversationStore, { loading: loadingCancelConversationStore }] = useMutation(mutate_scConversationAuthorizationCancel, {
        awaitRefetchQueries: true,
        refetchQueries: ['query_stores_channel']
    });

    useMemo(() => {
        if (!!dataAuthozie) {
            if (dataAuthozie?.scConversationAuthorizationUrl?.authorization_url) {
                window.location.replace(dataAuthozie?.scConversationAuthorizationUrl?.authorization_url);
            } else {
                showAlert.error('Có lỗi xảy ra, xin vui lòng thử lại');
            }
        }
    }, [dataAuthozie]);

    const onCancelConversationStore = useCallback(async (conversation_store_id) => {
        try {
            const { data } = await cancelConversationStore({
                variables: { conversation_store_id }
            });

            setCurrentStoreId(null);
            if (!!data?.scConversationAuthorizationCancel?.success) {
                showAlert.success('Ngắt kết nối thành công');
            } else {
                showAlert.error(data?.scConversationAuthorizationCancel?.message || 'Ngắt kết nối thất bại');
            }
        } catch (error) {
            showAlert.error('Có lỗi xảy ra, xin vui lòng thử lại');
        }
    }, []);

    const formatAuthorizeTime = useCallback((authorization_expired_at) => {
        let view;

        if (!authorization_expired_at) {
            view = <Text>Không giới hạn</Text>
        }

        if (!!authorization_expired_at) {
            let [daysStill, hoursStill] = [
                dayjs(authorization_expired_at).diff(dayjs(), 'days'),
                dayjs(authorization_expired_at).diff(dayjs(), 'hours'),
            ];
            const hours = hoursStill - daysStill * 24;
            const [time, date_type] = [daysStill > 0 ? daysStill : (hours <= 0 ? '0' : hours > 10 ? hours : `0${hours}`), (daysStill > 0 || hours <= 0) ? 'ngày' : 'giờ']
            const textStill = `còn ${time} ${date_type}`;

            view = <Flex align='center' justify='center' gap={4}>
                <Text>{dayjs(authorization_expired_at).format('DD/MM/YYYY HH:mm')}</Text>
                (<Text style={{ color: daysStill < 8 ? 'red' : '' }}>{textStill}</Text>)
            </Flex>
        }

        return view;
    }, []);

    const columns = [
        {
            title: 'Tên gian hàng',
            dataIndex: 'name',
            key: 'name',
            width: '20%',
            render: (_item, record) => {
                const channel = dataStores?.op_connector_channels?.find(channel => channel?.code == record?.connector_channel_code);

                return <Flex align="center" gap={8}>
                    <img width={20} src={channel?.logo_asset_url} />
                    <Text>{record?.name}</Text>
                </Flex>
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'age',
            key: 'age',
            align: "center" as AlignType,
            width: '20%',
            render: (_item, record) => {
                if (record?.connector_channel_code == 'other') return '--';

                if (record?.status == 1) {
                    return <Text type="success">Đã kết nối</Text>
                } else if (record?.status == 0) {
                    return <Text type="danger">Ngắt kết nối</Text>
                } else if (record?.status == 2) {
                    return <Flex justify='center' align='center' gap={6}>
                        <Text type="danger">Mất kết nối</Text>
                        <Tooltip placement="top" title={"Gian hàng bị hết hạn uỷ quyền, vui lòng kết nối lại."} arrow={true}>
                            <WarningFilled style={{ color: 'red', fontSize: 20 }} />
                        </Tooltip>
                    </Flex>
                } else return;
            }
        },
        {
            title: 'Thời hạn ủy quyền',
            dataIndex: 'address',
            key: 'address',
            align: "center" as AlignType,
            width: '30%',
            render: (_item, record) => {
                if (record?.connector_channel_code == 'other') return '--';

                return formatAuthorizeTime(record?.authorization_expired_at)
            }
        },
        {
            title: 'Thời gian kết nối',
            dataIndex: 'address',
            key: 'address',
            align: "center" as AlignType,
            width: '20%',
            render: (_item, record) => {
                return <Text>{!!record?.last_connected_at ? dayjs(record?.last_connected_at).format('DD/MM/YYYY HH:mm') : '--'}</Text>
            }
        },
        {
            title: 'Thao tác',
            dataIndex: 'id',
            key: 'id',
            align: 'center' as AlignType,
            width: '10%',
            render: (item, record) => {
                return <AuthorizationWrapper keys={['customer_service_chat_store_connect']}>
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    label: <Typography.Text
                                        onClick={() => authorize({
                                            variables: {
                                                connector_channel_code: record?.connector_channel_code
                                            }
                                        })}
                                    >
                                        Kết nối lại
                                    </Typography.Text>,
                                    key: 1,
                                    style: { height: 40 }
                                },
                                {
                                    label: <Typography.Text
                                        onClick={() => setCurrentStoreId(record?.id)}
                                    >
                                        Ngắt kết nối
                                    </Typography.Text>,
                                    key: 2,
                                    style: { height: 40 }
                                },
                            ]
                        }}
                        trigger={['click']}
                        placement="bottomCenter"
                        arrow={{ pointAtCenter: true }}
                    >
                        <a className='color-base' onClick={(e) => e.preventDefault()}>
                            <Flex justify='center' align='center' gap={5}>
                                <Typography.Text className='color-base'>Chọn</Typography.Text>
                                <DownOutlined style={{ fontSize: 12 }} />
                            </Flex>
                        </a>
                    </Dropdown>
                </AuthorizationWrapper>
            }
        },
    ];

    return (
        <SettingWrapper>
            <Helmet
                titleTemplate="Kênh bán - UpS"
                defaultTitle="Kênh bán - UpS"
            >
                <meta name="description" content="Kênh bán - UpS" />
            </Helmet>
            <Spin spinning={loadingAuthorize} size="large" fullscreen />
            {/* <ChannelsAddRedirect /> */}
            {/* <Outlet /> */}
            <ModalConfirmDisconnect
                currentStoreId={currentStoreId}
                loading={loadingCancelConversationStore}
                onConfirm={onCancelConversationStore}
                onHide={() => setCurrentStoreId(null)}
            />
            {showAddChannel && <ModalAddChannel
                show={showAddChannel}
                dataStores={dataStores}
                onHide={() => setShowAddChannel(false)}
            />}
            <Card title="Danh sách gian hàng" className="card" bordered={false}>
                <Flex justify="flex-end">
                    <AuthorizationWrapper keys={['customer_service_chat_store_create']}>
                        <Button
                            className='btn-base'
                            type='primary'
                            onClick={() => setShowAddChannel(true)}
                        >
                            Thêm gian hàng
                        </Button>
                    </AuthorizationWrapper>
                </Flex>
                <Spin spinning={loadingStores}>
                    <Table
                        className='setting-table ant-upbase'
                        dataSource={sortBy(dataStores?.sc_conversation_stores || [], _store => 1 - (_store.status || 0)) || []}
                        columns={columns as any}
                        bordered
                        pagination={false}
                    />
                </Spin>
            </Card>
        </SettingWrapper >
    );
};

export default Channels;