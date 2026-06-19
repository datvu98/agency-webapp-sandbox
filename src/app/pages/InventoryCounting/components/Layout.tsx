import React, { ReactNode, memo } from "react";
import { Layout, Menu, Typography } from 'antd';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import queryString from 'querystring';
import { MailOutlined } from "@ant-design/icons";
import BreadcrumbList from "app/pages/MainLayout/Breadcrumb";
import InventoryCountingWrapper from '../InventoryCounting.styles'

const { Header, Content, Footer, Sider } = Layout;
const { Text } = Typography;

type LayoutProps = {
    children: ReactNode
}

const LayoutInventoryCounting = ({ children }: LayoutProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = queryString.parse(
        location.search.slice(1, location.search.length),
    );

    return (
        <InventoryCountingWrapper>
        
            <Layout className="site-layout">
                <Layout>
                    <BreadcrumbList />
                    <div className="site-content">
                        {children}
                    </div>
                </Layout>
            </Layout>
        </InventoryCountingWrapper>
    )
};

export default memo(LayoutInventoryCounting);