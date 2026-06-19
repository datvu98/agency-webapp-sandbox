import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    ArrowUpOutlined,
    SettingOutlined,
    BankOutlined
} from '@ant-design/icons';
import { Layout, BackTop, Affix, Flex, Button, Menu, Typography } from 'antd';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import BreadcrumbList from './Breadcrumb/index';
import LayoutWrapper from './Layout.styles';
import MenuLayout from './Menu/index';
import { LayoutProvider } from '../../contexts/LayoutContext';
import HeaderLayout from './Header';
import { useGlobalSliceSlice } from 'app/slice';
import { useDispatch } from 'react-redux';
import Logo from 'assets/logo.png';

const { Text } = Typography;

const { Header, Content, Footer, Sider } = Layout;

interface DashboardProps {
    children: ReactNode
}

const Dashboard = ({ children }: DashboardProps) => {
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const { actions } = useGlobalSliceSlice();
    const dispatch = useDispatch();
    let location = useLocation();
    useMemo(() => {
        if (location.pathname == '/chats') {
            setCollapsed(true)
            return;
        }
    }, [location?.pathname])

    return (
        <LayoutProvider>
            <LayoutWrapper>
                <Layout>
                    <Header
                        className="site-layout-background site-layout-header"
                        style={{ position: 'fixed', zIndex: 1, width: '100%', boxShadow: '0 1px 9px -3px rgb(0 0 0 / 10%)', background: '#fff' }}
                    >
                        <Flex>
                            <div className='logo-wrapper' style={{ background: '#fff', boxShadow: '0 1px 9px -3px rgb(0 0 0 / 10%)', alignItems: 'center' }}>
                                <img
                                    className="logo"
                                    src={Logo}
                                />
                            </div>
                        </Flex>
                        <HeaderLayout />
                    </Header>
                    {/* <Layout className='layout-content'>
                        {children}
                    </Layout> */}
                    <Layout
                        className="site-layout"
                        style={{ marginLeft: collapsed ? 64 : 240 }}
                        hasSider
                    >
                        <Sider
                            className={'layout-sider-mobile'}
                            width={collapsed ? 64 : 240}
                            collapsible collapsed={collapsed}
                            trigger={null}
                            reverseArrow={true}
                            collapsedWidth={64}
                        >
                            <MenuLayout />
                            <Button
                                type="text"
                                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                                onClick={() => setCollapsed(!collapsed)}
                                style={{
                                    position: 'absolute',
                                    bottom: '60px',
                                    right: 0,
                                    fontSize: '16px',
                                    width: 64,
                                    height: 64,
                                }}
                            />

                        </Sider>
                        <Content className='layout-content'>
                            {/* <BreadcrumbList /> */}
                            <div>
                                {children}
                            </div>
                        </Content>
                    </Layout>
                </Layout>
                {/* <BackTop>
                    <div className='back-top-wrapper'>
                        <ArrowUpOutlined className='back-top' />
                    </div>
                </BackTop> */}
            </LayoutWrapper>
        </LayoutProvider>
    );
};

export default Dashboard;