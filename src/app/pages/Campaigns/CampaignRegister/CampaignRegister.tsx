import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useLayoutEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { CampaignWrapper } from "../Campaign.styles";
import { Button, Flex, Tabs, Typography } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import useRegisterParams from "./hooks/useRegisterParams";
import { TAB_ITEMS, TabKey, TAB_KEYS } from "./constants/constant";
import { ArrowLeftOutlined } from "@ant-design/icons";
import CampaignSampleTab from "./CampaignSampleTab";
import CampaignShowcaseTab from "./CampaignShowcaseTab";

const { Text } = Typography;

const CampaignRegister = () => {
  const { appendBreadcrumb } = useLayoutContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const headerTitle = useMemo(() => {
    return searchParams.get("campaignName") || "Danh sách nhà sáng tạo";
  }, [searchParams]);
  const { activeTab, setActiveTab, basePath } = useRegisterParams();

  const titlePage = useMemo(() => {
    return "Danh sách nhà sáng tạo";
  }, []);

  useLayoutEffect(() => {
    appendBreadcrumb([
      {
        title: "Danh sách chiến dịch",
        pathname: "/campaign-manage",
      },
      {
        title: titlePage,
        pathname: basePath,
      },
    ]);
  }, []);

  return (
    <CampaignWrapper>
      <Helmet titleTemplate={titlePage} defaultTitle={titlePage}>
        <meta name="description" content={titlePage} />
      </Helmet>
      <Flex vertical className="campaign-register-header">
        <Flex justify="space-between" align="flex-end">
          <h2
            style={{
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Button
              type="text"
              size="small"
              onClick={() => navigate("/campaign-manage/list-campaign")}
              icon={
                <ArrowLeftOutlined
                  style={{ fontSize: 12, transform: "scaleX(1.35)" }}
                />
              }
              style={{ padding: 0, width: 20, minWidth: 20, height: 20 }}
            />
            {headerTitle}
          </h2>
        </Flex>
        <Text style={{ color: "#666", fontSize: 13 }}>
          Hiển thị danh sách lượt đăng ký nhận sản phẩm mẫu và thêm sản phẩm vào
          trang trưng bày của nhà sáng tạo
        </Text>
      </Flex>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as TabKey)}
        items={TAB_ITEMS.map(({ key, label }) => ({
          key,
          label,
          children:
            key === TAB_KEYS.REGISTER_SAMPLE ? (
              <CampaignSampleTab basePath={basePath} />
            ) : (
              <CampaignShowcaseTab basePath={basePath} />
            ),
        }))}
      />
    </CampaignWrapper>
  );
};

export default CampaignRegister;
