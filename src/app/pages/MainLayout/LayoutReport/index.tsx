import React, { ReactNode, memo } from "react";
import { Layout, Menu, Typography } from 'antd';
import { LayoutReportWrapper } from '../Layout.styles';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import queryString from 'querystring';
import { BarChartOutlined, MailOutlined, MessageOutlined, TagsOutlined } from "@ant-design/icons";
import BreadcrumbList from "app/pages/MainLayout/Breadcrumb";

const { Header, Content, Footer, Sider } = Layout;
const { Text } = Typography;

type LayoutProps = {
    children: ReactNode
}

const LayoutReport = ({ children }: LayoutProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = queryString.parse(
        location.search.slice(1, location.search.length),
    );

    return (
        <LayoutReportWrapper>
            {/* <Layout hasSider>
                <Sider
                    className="layout-sider"
                    collapsed={false}
                    breakpoint="lg"
                    width={240}
                >
                    <Menu
                        theme="light"
                        mode="vertical"
                        items={[
                            {
                                key: '',
                                label: 'Tổng quan',
                                icon: <BarChartOutlined />
                            },
                            {
                                key: 'conversation',
                                label: 'Hội thoại',
                                icon: <MessageOutlined />
                            },
                            {
                                key: 'label',
                                label: 'Nhãn hội thoại',
                                icon: <TagsOutlined />
                            },
                        ]}
                        className='base-antd-menu'
                        selectedKeys={[location.pathname.split('/report/')[1] || '']}
                        onClick={(e) => {
                            const afterUrl = e.key ? `/${e.key}` : '';
                            navigate(`/report${afterUrl}`);
                        }}
                    />
                </Sider>
                <Layout className="site-layout">
                    <BreadcrumbList />
                    <div className="site-content">
                        {children}
                    </div>
                </Layout>
            </Layout> */}
        </LayoutReportWrapper>
    )
};

export default memo(LayoutReport);