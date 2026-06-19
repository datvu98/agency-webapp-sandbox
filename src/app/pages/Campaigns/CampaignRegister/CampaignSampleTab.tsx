import { Button, Card, Flex, Spin, Tabs } from "antd";
import {
  CampaignRegisterSampleFilter,
  CampaignSampleReport,
} from "app/pages/Campaigns/CampaignRegister/components";
import {
  useGetCountCampaignJobStatus,
  useSampleFilter,
} from "app/pages/Campaigns/CampaignRegister/hooks";
import React from "react";
import { useParams } from "react-router-dom";
import CampaignRegisterSampleTable from "./components/CampaignRegisterSampleTable";
import {
  CANCEL_BY_OPTIONS,
  CANCELLED_BY_AGENCY,
  CANCELLED_BY_HUB,
  ETYPE_PROCESS_STATUS,
  TYPE_PROCESS_STATUS_OPTIONS,
} from "./constants/constant";
import { useCampaignSampleRegister } from "./hooks/useCampaignSampleRegister";
import { EORDER_BY_COLUMN } from "app/pages/Campaigns/CampaignRegister/types";

interface CampaignSampleTabProps {
  basePath: string;
}

const CampaignSampleTab = ({ basePath }: CampaignSampleTabProps) => {
  const { id } = useParams<{ id: string }>();
  const campaignStoreId = id ? Number(id) : undefined;

  const {
    onSubmit,
    initValues,
    apiPayload,
    countFilterPayload,
    exportPayload,
    subTab,
    cancelBy,
    onSubTabChange,
    onCancelByChange,
    onTableChange,
  } = useSampleFilter();
  const { tableData, paginationData, loading, refetch } =
    useCampaignSampleRegister(apiPayload);

  const countFilterRangeTime = React.useMemo(
    () =>
      countFilterPayload.rangeTime?.filter(
        (value): value is string => typeof value === "string"
      ),
    [countFilterPayload.rangeTime]
  );

  const countStatusList = React.useMemo(
    () => [
      ETYPE_PROCESS_STATUS.ALL,
      ETYPE_PROCESS_STATUS.SHIPPING_IN_PROGRESS,
      ETYPE_PROCESS_STATUS.PENDING_POSTING,
      ETYPE_PROCESS_STATUS.PENDING_REVIEW,
      ETYPE_PROCESS_STATUS.PENDING_AIRING,
      ETYPE_PROCESS_STATUS.PENDING_ACCEPTANCE,
      ETYPE_PROCESS_STATUS.CANCELLED,
      ETYPE_PROCESS_STATUS.COMPLETED,
      ETYPE_PROCESS_STATUS.PENDING,
      ETYPE_PROCESS_STATUS.PENDING_SHIPMENT,
      ETYPE_PROCESS_STATUS.NEED_PROCESS,
    ],
    []
  );

  const cancelledStatus = React.useMemo(
    () => [ETYPE_PROCESS_STATUS.CANCELLED],
    []
  );

  const {
    counts: countCampaignJobStatus,
    loading: countCampaignJobStatusLoading,
    refetchCounts,
  } = useGetCountCampaignJobStatus({
    ...countFilterPayload,
    rangeTime: countFilterRangeTime,
    status: countStatusList,
  });

  const {
    counts: agencyCancelCounts,
    loading: agencyCancelCountLoading,
    refetchCounts: refetchAgencyCancelCount,
  } = useGetCountCampaignJobStatus({
    ...countFilterPayload,
    rangeTime: countFilterRangeTime,
    status: cancelledStatus,
    cancelBy: CANCELLED_BY_AGENCY,
  });

  const {
    counts: hubCancelCounts,
    loading: hubCancelCountLoading,
    refetchCounts: refetchHubCancelCount,
  } = useGetCountCampaignJobStatus({
    ...countFilterPayload,
    rangeTime: countFilterRangeTime,
    status: cancelledStatus,
    cancelBy: CANCELLED_BY_HUB,
  });

  const refetchTableAndCounts = React.useCallback(async () => {
    await Promise.all([
      refetch(),
      refetchCounts(countStatusList),
      refetchAgencyCancelCount(cancelledStatus),
      refetchHubCancelCount(cancelledStatus),
    ]);
  }, [
    refetch,
    refetchCounts,
    refetchAgencyCancelCount,
    refetchHubCancelCount,
    countStatusList,
    cancelledStatus,
  ]);

  const exportFilter = React.useMemo(
    () => ({
      ...exportPayload,
      campaignStoreId,
    }),
    [exportPayload, campaignStoreId],
  );

  return (
    <Card>
      <Flex vertical gap={20}>
        <CampaignRegisterSampleFilter
          onFilterChange={onSubmit}
          initialValues={initValues()}
        />
        <CampaignSampleReport />

        <div>
          <Tabs
            activeKey={subTab}
            onChange={onSubTabChange}
            items={TYPE_PROCESS_STATUS_OPTIONS.map((opt) => {
              const count = countCampaignJobStatus.find(
                (item) => item.status === opt.value
              )?.count;
              const isLoadingCount = countCampaignJobStatusLoading;

              return {
                key: opt.value,
                label: (
                  <span>
                    {opt.label} (
                    {isLoadingCount ? <Spin size="small" /> : count ?? 0})
                  </span>
                ),
              };
            })}
          />

          {subTab === ETYPE_PROCESS_STATUS.CANCELLED && (
            <Flex gap={8}>
              {CANCEL_BY_OPTIONS.map((opt) => {
                const isActive = cancelBy === opt.value;
                return (
                  <Button
                    key={opt.value}
                    type="default"
                    onClick={() => onCancelByChange(opt.value)}
                    style={{
                      borderRadius: '16px',
                      border: isActive ? "1px solid #ff5629" : "1px solid #d9d9d9",
                      padding: "4px 16px",
                      minWidth: 160,
                      color: isActive ? "#ff5629" : "#000000",
                    }}
                  >
                    {opt.label} (
                    {opt.value === "agency"
                      ? (agencyCancelCountLoading ? <Spin size="small" /> : agencyCancelCounts[0]?.count ?? 0)
                      : (hubCancelCountLoading ? <Spin size="small" /> : hubCancelCounts[0]?.count ?? 0)}
                    )
                  </Button>
                );
              })}
            </Flex>
          )}
        </div>

        <CampaignRegisterSampleTable
          basePath={basePath}
          sort={{
            column: apiPayload.order_by?.column as EORDER_BY_COLUMN,
            direction: apiPayload.order_by?.direction,
          }}
          currentStatus={subTab as ETYPE_PROCESS_STATUS}
          refetch={refetchTableAndCounts}
          data={tableData}
          loading={loading}
          total={paginationData.total}
          page={paginationData.page}
          limit={paginationData.limit}
          handleTableChange={onTableChange}
          exportFilter={exportFilter}
        />
      </Flex>
    </Card>
  );
};

export default CampaignSampleTab;
