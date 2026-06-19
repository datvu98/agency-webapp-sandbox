import { useQuery } from "@apollo/client";
import {
  EORDER_BY_COLUMN,
  ESORT_DIRECTION,
  ICampaignJob,
  OrderV2Model,
} from "app/pages/Campaigns/CampaignRegister/types";
import { ICreatorChannelPerformance } from "app/pages/Campaigns/types";
import { GET_CAMPAIGN_JOBS } from "graphql/queries/query_affGetCampaignJobs";
import query_affGetCreatorChannelPerformances from "graphql/queries/query_affGetCreatorChannelPerformances";
import { QUERY_SC_GET_ORDERS_V2 } from "graphql/queries/query_scGetOrdersV2";
import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { CampaignSampleFilterValues } from "../types/CampaignSampleFilter.type";

type CampaignSampleRegisterFilter = CampaignSampleFilterValues & {
  order_by?: {
    column?: EORDER_BY_COLUMN;
    direction?: ESORT_DIRECTION;
  };
  cancelBy?: string;
};

const toUniqueIds = <T>(
  items: T[],
  selector: (item: T) => number | undefined
): number[] =>
  Array.from(
    new Set(
      items.map(selector).filter((id): id is number => typeof id === "number")
    )
  );

const toMap = <K, V>(items: V[], keySelector: (item: V) => K): Map<K, V> => {
  const map = new Map<K, V>();
  for (const item of items) {
    const key = keySelector(item);
    if (key !== undefined && key !== null) {
      map.set(key, item);
    }
  }
  return map;
};

export const useCampaignSampleRegister = (
  filter: CampaignSampleRegisterFilter
) => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const campaignStoreId = id ? Number(id) : undefined;
  const smeId = Number(searchParams.get("smeId"));

  const payloadFilter = useMemo(() => {
    return {
      q: filter.q,
      rangeTime: filter.rangeTime,
      key_time: filter.key_time,
      advertisingTypes: filter.advertisingTypes,
      page: filter.page,
      registeredProductCountType: filter.registeredProductCountType,
      listStatus: filter.listStatus,
      cancelBy: filter.cancelBy,
      limit: filter.limit,
      campaignStoreId,
      ...(filter.isPreShippingCancel != null
        ? { isPreShippingCancel: filter.isPreShippingCancel }
        : {}),
      order_by: filter.order_by
        ? {
          column: filter.order_by.column,
          direction: filter.order_by.direction,
        }
        : undefined,
    };
  }, [
    filter.q,
    filter.rangeTime,
    filter.key_time,
    filter.advertisingTypes,
    filter.page,
    filter.registeredProductCountType,
    filter.listStatus,
    filter.cancelBy,
    filter.limit,
    filter.isPreShippingCancel,
    filter.order_by?.column,
    filter.order_by?.direction,
    campaignStoreId,
  ]);

  const { data, loading, error, refetch } = useQuery(GET_CAMPAIGN_JOBS, {
    variables: { filter: payloadFilter },
    skip: !campaignStoreId,
    fetchPolicy: "network-only",
  });

  const rawItems: ICampaignJob[] = useMemo(
    () => data?.affGetCampaignJobs?.data?.items ?? [],
    [data]
  );

  const totalItems = useMemo(
    () => data?.affGetCampaignJobs?.data?.total ?? 0,
    [data]
  );

  const creatorChannelIds = useMemo(
    () => toUniqueIds(rawItems, (item) => item.creatorChannelId),
    [rawItems]
  );

  const { data: performancesData, loading: performancesLoading } = useQuery(
    query_affGetCreatorChannelPerformances,
    {
      variables: { ids: creatorChannelIds },
      skip: !campaignStoreId || creatorChannelIds.length === 0,
      fetchPolicy: "network-only",
    }
  );

  const performanceByCreatorChannelId: Map<number, ICreatorChannelPerformance> =
    useMemo(() => {
      const items =
        performancesData?.affGetCreatorChannelPerformances?.data?.items ?? [];
      return toMap(items, (row) => row.creatorChannelId);
    }, [performancesData]);

  // ── Orders ────────────────────────────────────────────────────────────────

  const orderIds = useMemo(
    () =>
      toUniqueIds(rawItems, (item) => {
        const id = Number(item.campaignSampleRequest?.orderId);
        return Number.isInteger(id) && id > 0 ? id : undefined;
      }),
    [rawItems]
  );

  const { data: ordersData, loading: ordersLoading } = useQuery(
    QUERY_SC_GET_ORDERS_V2,
    {
      variables: { ids: orderIds, sme_id: smeId },
      skip: !campaignStoreId || !smeId || orderIds.length === 0,
      fetchPolicy: "no-cache",
    }
  );

  const orderById = useMemo(() => {
    const items: OrderV2Model[] = ordersData?.findOrderByIds ?? [];
    return toMap(items, (order) => order.id);
  }, [ordersData]);

  const tableData: ICampaignJob[] = useMemo(
    () =>
      rawItems.map((item) => {
        const sampleRequest = item.campaignSampleRequest;

        if (!sampleRequest) {
          return {
            ...item,
            campaignSampleRequest: sampleRequest,
          };
        }

        const creatorChannelId = sampleRequest.creatorChannelId;

        const perf = creatorChannelId
          ? performanceByCreatorChannelId.get(creatorChannelId)
          : undefined;

        const order = sampleRequest.orderId
          ? orderById.get(Number(sampleRequest.orderId))
          : undefined;

        return {
          ...item,
          campaignSampleRequest: {
            ...sampleRequest,
            ecLiveCount: perf?.ecLiveCount ?? null,
            ecVideoCount: perf?.ecVideoCount ?? null,
            followCount: perf?.followerCount ?? null,
            isGmvHiddenByCreator: perf?.isGmvHiddenByCreator ?? false,
            gmv: (() => {
              const gmvValue =
                perf?.gmvAmount != null && !Number.isNaN(perf.gmvAmount)
                  ? `${perf.gmvAmount.toLocaleString('vi-VN')} VNĐ`
                  : '0';
              return perf?.isGmvHiddenByCreator ? `~${gmvValue}` : gmvValue;
            })(),
            soldCount: perf?.unitsSold ?? null,
            avgVideoViews: perf?.avgEcVideoPlayCount ?? null,
            // avgLiveViews: perf?.avgEcLiveViewCount ?? null,
            engagementRate:
              perf?.ecVideoEngagementRate != null
                ? perf.ecVideoEngagementRate / 100
                : null,
            category: perf?.listCategories?.map((c) => c.display_name) ?? null,
            urlCreatorChannel: perf?.creatorChannel?.ref_url ?? null,
            order,
          },
        };
      }),
    [rawItems, performanceByCreatorChannelId, orderById]
  );

  const paginationData = useMemo(() => {
    const d = data?.affGetCampaignJobs?.data;
    return {
      page: d?.page ?? payloadFilter.page,
      limit: d?.limit ?? payloadFilter.limit,
      total: d?.total ?? 0,
    };
  }, [data, payloadFilter.page, payloadFilter.limit]);

  // ─────────────────────────────────────────────────────────────────────────

  return {
    tableData,
    paginationData,
    loading: loading || performancesLoading || ordersLoading,
    error,
    refetch,
    totalItems,
  };
};
