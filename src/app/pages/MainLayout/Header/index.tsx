import {
    LogoutOutlined,
    SettingOutlined, ShopOutlined,
    MailOutlined,
    BellOutlined
} from '@ant-design/icons';
import { Avatar, Dropdown, Menu, Spin, Badge, Typography, Flex, Tooltip, Divider } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import HeaderLayoutWrapper, { MenuHeaderWrapper } from './Header.style';
import { selectGlobalSlice } from 'app/slice/selectors';
import { useGlobalSliceSlice } from 'app/slice';
import { useNavigate } from 'react-router';
import { auth } from '../../../../firebase';
import { useMutation } from '@apollo/client';
import mutate_chatNotificationUnregisterDevice from 'graphql/mutations/mutate_chatNotificationUnregisterDevice';
import AuthorizationWrapper from 'app/components/AuthorizationWrapper';
import client from "../../../../apollo";
import { useChatSliceSlice } from 'app/pages/ChatPage/slice';
import { usePostHog } from '@posthog/react';

const MenuHeaderDropdown = () => {
    const { actions } = useGlobalSliceSlice();
    const { actions: actionChats } = useChatSliceSlice()
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const posthog = usePostHog();

    const [chatNotificationUnregisterDevice] = useMutation(mutate_chatNotificationUnregisterDevice);

    return <MenuHeaderWrapper>
        <Menu className="menu-header" selectedKeys={[]}>
            <Menu.Item
                key="logout"
                onClick={async e => {
                    if (window?.OneSignal?.User?.PushSubscription?.id) {
                        await chatNotificationUnregisterDevice({
                            variables: {
                                deviceId: window?.OneSignal?.User?.PushSubscription?.id
                            },
                        })
                    }
                    posthog?.capture('user_logged_out');
                    posthog?.reset();
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('refresh_token')
                    localStorage.removeItem('user')
                    localStorage.removeItem('email')
                    dispatch(actions.saveToken({ token: "", email: "" }))
                    dispatch(actions.saveUser({ user: null }))
                    dispatch(actionChats.clearConversation())
                    client.clearStore();
                    // auth.signOut();

                    navigate('/login')
                }}
            >
                <Flex style={{ color: 'red', height: 40 }} align='center' justify='center' gap={10}>
                    <LogoutOutlined />
                    <Typography.Text style={{ color: 'red' }}>Đăng xuất</Typography.Text>
                </Flex>
            </Menu.Item>
        </Menu>
    </MenuHeaderWrapper>
};

const HeaderLayout = () => {
    const { user } = useSelector(selectGlobalSlice);
    const navigate = useNavigate();
    return (
        <HeaderLayoutWrapper>
            <Flex align='center' gap={30}>
                {/* <AuthorizationWrapper keys={['customer_service_chat_store_connect']}>
                    <Tooltip placement="top" title={'Gian hàng'} arrow={true}>
                        <ShopOutlined
                            style={{ fontSize: 20 }}
                            onClick={() => navigate('/setting/channels')}
                        />
                    </Tooltip>
                </AuthorizationWrapper> */}
                <Dropdown
                    overlay={<MenuHeaderDropdown />}
                    placement="bottomLeft"
                    arrow
                >
                    <div className='header-avatar-wrapper'>
                        <Badge status="success" dot={true} offset={[-18, 48]}>
                            {user?.avatar_url ? (
                                <Avatar
                                    className="header-avatar"
                                    alt="avatar"
                                    src={user?.avatar_url}
                                />
                            ) : (
                                <Avatar
                                    className="header-avatar"
                                    alt="avatar"
                                >
                                    {user?.email?.slice(0, 1).toUpperCase()}
                                </Avatar>
                            )}
                        </Badge>
                        <span>{user?.email}</span>
                    </div>
                </Dropdown>
            </Flex>
        </HeaderLayoutWrapper>
    );
};

export default HeaderLayout;