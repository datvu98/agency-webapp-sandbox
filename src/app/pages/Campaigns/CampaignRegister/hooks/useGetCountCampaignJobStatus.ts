import { useLazyQuery } from "@apollo/client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { ETYPE_PROCESS_STATUS } from "app/pages/Campaigns/CampaignRegister/constants/constant";
import { GET_COUNT_CAMPAIGN_JOBS } from "graphql/queries/query_affCountCampaignJobsByStatus";
import { CampaignSampleFilterValues } from "app/pages/Campaigns/CampaignRegister/types";
import { useParams } from "react-router-dom";

interface CampaignJobStatusCountModel {
  count: number;
  status: string;
}

interface GetCountCampaignJobsResponse {
  affCountCampaignJobsByStatus: {
    data: CampaignJobStatusCountModel;
    message: string;
    success: boolean;
  };
}

interface CountCampaignJobStatus {
  status: ETYPE_PROCESS_STATUS;
  count: number;
}

interface UseGetCountCampaignJobStatusProps extends CampaignSampleFilterValues {
  status: ETYPE_PROCESS_STATUS[];
}

interface UseGetCountCampaignJobStatusResult {
  counts: CountCampaignJobStatus[];
  loading: boolean;
  refetchCounts: (statuses?: ETYPE_PROCESS_STATUS[]) => Promise<void>;
}

const useGetCountCampaignJobStatus = (
  props: UseGetCountCampaignJobStatusProps,
): UseGetCountCampaignJobStatusResult => {
  const { status, key_time, rangeTime, advertisingTypes, q, registeredProductCountType, cancelBy } =
    props;
  const { id } = useParams<{ id: string }>();
  const campaignStoreId = id ? Number(id) : undefined;

  const [getCount] = useLazyQuery<GetCountCampaignJobsResponse>(
    GET_COUNT_CAMPAIGN_JOBS,
    {
      fetchPolicy: "network-only",
    },
  );

  const [counts, setCounts] = useState<CountCampaignJobStatus[]>([]);
  const [loading, setLoading] = useState(false);

  const statusKey = useMemo(() => (status ?? []).join(","), [status]);

  const rangeTimeKey = useMemo(() => {
    if (!Array.isArray(rangeTime)) return "";
    return rangeTime.join(",");
  }, [rangeTime]);

  const fetchCountsByStatuses = useCallback(
    async (statuses?: ETYPE_PROCESS_STATUS[]) => {
      const statusList = statuses ?? status ?? [];
      const targetStatuses = statusList.length
        ? statusList
        : [ETYPE_PROCESS_STATUS.ALL];

      setLoading(true);

      try {
        const responses = await Promise.all(
          targetStatuses.map((item) => {
            const isNeedProcess = item === ETYPE_PROCESS_STATUS.NEED_PROCESS;
            return getCount({
              variables: {
                filter: {
                  ...(isNeedProcess
                    ? { isPreShippingCancel: true }
                    : item !== ETYPE_PROCESS_STATUS.ALL
                      ? { status: item }
                      : {}),
                  ...(cancelBy ? { cancelBy } : {}),
                  key_time,
                  rangeTime,
                  advertisingTypes,
                  campaignStoreId,
                  q,
                  registeredProductCountType,
                },
              },
            });
          }),
        );

        const mapped: CountCampaignJobStatus[] = responses.map(
          (res, index) => ({
            status: targetStatuses[index],
            count: res.data?.affCountCampaignJobsByStatus?.data?.count ?? 0,
          }),
        );

        setCounts(mapped);
      } catch (error) {
        console.error("Error fetching counts:", error);
        setCounts([]);
      } finally {
        setLoading(false);
      }
    },
    [
      status,
      getCount,
      key_time,
      rangeTime,
      advertisingTypes,
      campaignStoreId,
      q,
      registeredProductCountType,
      cancelBy,
    ],
  );

  useEffect(() => {
    fetchCountsByStatuses();
  }, [
    fetchCountsByStatuses,
    statusKey,
    rangeTimeKey,
    registeredProductCountType,
    cancelBy,
    q,
  ]);

  return {
    counts,
    loading,
    refetchCounts: fetchCountsByStatuses,
  };
};

export { useGetCountCampaignJobStatus };
