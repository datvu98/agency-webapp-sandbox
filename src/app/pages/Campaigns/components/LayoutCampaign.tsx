import { Layout } from "antd";
import React, { memo, ReactNode } from "react";
import BreadcrumbList from "app/pages/MainLayout/Breadcrumb";
import CampaignWrapper from "../Campaign.styles";

type LayoutProps = {
    children: ReactNode
}

const LayoutCampaign = ({ children }: LayoutProps) => {
    return (
        <CampaignWrapper>
            <Layout className="site-layout">
                <Layout>
                    <BreadcrumbList />
                    <div className="site-content">
                        {children}
                    </div>
                </Layout>
            </Layout>
        </CampaignWrapper >
    )
};

export default memo(LayoutCampaign);