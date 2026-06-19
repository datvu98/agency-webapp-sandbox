import React from "react";
import { Card, Flex } from "antd";
import CampaignRegisterShowcaseFilter from "./components/CampaignRegisterShowcaseFilter";
import CampaignRegisterShowcaseTable from "./components/CampaignRegisterShowcaseTable";
import useRegisterParams from "./hooks/useRegisterParams";
import { useCampaignRegister } from "./hooks/useCampaignRegister";

interface CampaignShowcaseTabProps {
  basePath: string;
} 

const CampaignShowcaseTab = ({ basePath }: CampaignShowcaseTabProps) => {
  const { q, from, to, setKeyword, setRangeTime } = useRegisterParams();
  const { tableData, paginationData, loading, productImageByScProductId } =
    useCampaignRegister();

  return (
    <Card>
      <Flex vertical gap={20}>
        <CampaignRegisterShowcaseFilter
          keyword={q}
          from={from}
          to={to}
          onKeywordChange={setKeyword}
          onRangeChange={setRangeTime}
        />
        <CampaignRegisterShowcaseTable
          basePath={basePath}
          data={tableData}
          loading={loading}
          total={paginationData.total}
          page={paginationData.page}
          limit={paginationData.limit}
          productImageByScProductId={productImageByScProductId}
        />
      </Flex>
    </Card>
  );
};

export default CampaignShowcaseTab;
