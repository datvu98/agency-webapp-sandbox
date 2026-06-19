import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import query_affGetCampaignSampleRequests from "graphql/queries/query_affGetCampaignSampleRequests";
import query_affGetCreatorChannelPerformances from "graphql/queries/query_affGetCreatorChannelPerformances";
import query_affCheckCampaignSampleRequestItemsStock from "graphql/queries/query_affCheckCampaignSampleRequestItemsStock";
import { useCallback, useMemo } from "react";
import { CampaignRegister, ICampaignRegisterTable, ICreatorChannelPerformance } from "app/pages/Campaigns/types";
import useRegisterParams from "./useRegisterParams";
import mutate_affApproveCampaignSampleRequest from "graphql/mutations/mutate_affApproveCampaignSampleRequest";
import { useSequentialBulkRunner } from "app/pages/Campaigns/CampaignRegister/hooks/useSequentialBulkRunner";
import mutate_affRejectCampaignSampleRequest from "graphql/mutations/mutate_affRejectCampaignSampleRequest";
import { showAlert } from "utils/helper";
import query_ScGetSmeProducts from "graphql/queries/query_ScGetSmeProducts";
import query_scGetProductByIdsWithoutScope from "graphql/queries/query_scGetProductByIdsWithoutScope";

const BULK_APPROVE_DELAY_MS = 350;
const BULK_APPROVE_TIMEOUT_MS = 12000;

export interface BulkApproveErrorItem {
  key: string;
  creatorChannelName: string;
  creatorChannelUsername: string;
  createdAt: string;
  errorMessage: string;
  row: ICampaignRegisterTable;
}

export interface BulkApproveProgress {
  isOpen: boolean;
  isProcessing: boolean;
  total: number;
  processed: number;
  approvedCount: number;
  errorCount: number;
  dataError: BulkApproveErrorItem[];
}

export const useCampaignRegister = () => {
  const { payloadFilter } = useRegisterParams();
  const campaignStoreId = payloadFilter.campaignStoreId;

  const { data, loading, error, refetch } = useQuery(
    query_affGetCampaignSampleRequests,
    {
      variables: {
        filter: payloadFilter,
      },
      skip: !campaignStoreId,
      fetchPolicy: "network-only",
    }
  );

  const totalItems = useMemo(() => data?.affGetCampaignSampleRequests?.data?.total ?? 0, [data]);

  const rawItems: CampaignRegister[] = useMemo(
    () => data?.affGetCampaignSampleRequests?.data?.items ?? [],
    [data]
  );

  const creatorChannelIds = useMemo(
    () =>
      Array.from(
        new Set(
          rawItems
            .map((item) => item.creatorChannelId)
            .filter((id): id is number => typeof id === "number")
        )
      ),
    [rawItems]
  );

  const scProductIds = useMemo(
    () =>
      Array.from(
        new Set(
          rawItems.flatMap((request) =>
            (request.items ?? [])
              .map((lineItem) => lineItem.scProductId)
              .filter((id): id is number => typeof id === "number")
          )
        )
      ),
    [rawItems]
  );

  const smeId = useMemo(() => {
    return rawItems.find((item) => item.smeId != null)?.smeId ?? 0;
  }, [rawItems]);

  const { data: ScGetSmeProductsResponse, loading: ScGetSmeProductsLoading } = useQuery(
    query_scGetProductByIdsWithoutScope,
    {
      variables: { product_ids: scProductIds, sme_id: smeId },
      skip: !campaignStoreId || scProductIds.length === 0 || smeId === 0,
      fetchPolicy: "network-only",
    }
  );

  const scProductData = useMemo(
    () => ScGetSmeProductsResponse?.scGetProductByIdsWithoutScope ?? [],
    [ScGetSmeProductsResponse]
  );

  const productImageByScProductId = useMemo(() => {
    const map = new Map<number, string | null>();
    for (const p of scProductData) {
      if (typeof p.id !== "number") continue;
      map.set(p.id, p.productAssets?.[0]?.sme_url ?? null);
    }
    return map;
  }, [scProductData]);

  const { data: performancesData, loading: performancesLoading } = useQuery(
    query_affGetCreatorChannelPerformances,
    {
      variables: { ids: creatorChannelIds },
      skip: !campaignStoreId || creatorChannelIds.length === 0,
      fetchPolicy: "network-only",
    }
  );

  const performanceByCreatorChannelId: Map<number, ICreatorChannelPerformance> = useMemo(() => {
    const items =
      performancesData?.affGetCreatorChannelPerformances?.data?.items ?? [];
    const map = new Map<
      number,
      (typeof items)[number]
    >();
    for (const row of items) {
      map.set(row.creatorChannelId, row);
    }
    return map;
  }, [performancesData]);

  const tableData: ICampaignRegisterTable[] = useMemo(
    () =>
      rawItems.map((item) => {
        const creatorChannelId = item.creatorChannelId ?? 0;
        const perf = performanceByCreatorChannelId.get(creatorChannelId);
        const postCount =
          perf == null
            ? []
            : [{
              Live: perf.ecLiveCount ?? 0,
              video: perf.ecVideoCount ?? 0,
            }];
        
        return {
          key: String(item.id),
          id: item.id,
          campaignId: item.campaignId,
          creatorId: item.creatorId,
          creatorChannelId,
          creatorChannelName: item.creatorChannelName ?? "--",
          creatorChannelUsername: item.creatorChannelUsername ?? "--",
          creatorRefId: item.creatorRefId,
          fullAddress: item.fullAddress ?? "--",
          phone: item.phone ?? "--",
          requestType: item.requestType ?? "--",
          status: item.status,
          rejectMessage: item.rejectMessage,
          isReceiveSample: item.isReceiveSample,
          orderId: item.orderId,
          items: item.items ?? [],
          createdAt: item.createdAt,

          ecLiveCount: perf?.ecLiveCount ?? null,
          ecVideoCount: perf?.ecVideoCount ?? null,
          followCount: perf?.followerCount ?? null,
          postCount,
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
        };
      }),
    [rawItems, performanceByCreatorChannelId]
  );

  const paginationData = useMemo(() => {
    const d = data?.affGetCampaignSampleRequests?.data;
    return {
      page: d?.page ?? payloadFilter.page,
      limit: d?.limit ?? payloadFilter.limit,
      total: d?.total ?? 0,
    };
  }, [data, payloadFilter.page, payloadFilter.limit]);

  const [
    approveSampleRequest,
    { loading: approveRowLoading },
  ] = useMutation(mutate_affApproveCampaignSampleRequest);

  const [
    rejectCampaignSampleRequest,
    { loading: bulkRejectLoading },
  ] = useMutation(mutate_affRejectCampaignSampleRequest);

  const mapBulkApproveError = useCallback(
    (row: ICampaignRegisterTable, index: number, err: unknown): BulkApproveErrorItem => ({
      key: `${row.id}-${index}`,
      creatorChannelName: row.creatorChannelName || "--",
      creatorChannelUsername: row.creatorChannelUsername || "--",
      createdAt: row.createdAt,
      errorMessage:
        err instanceof Error ? err.message : "Duyệt thất bại",
      row,
    }),
    []
  );

  const onBulkSequenceComplete = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const {
    progress: bulkProgress,
    run: runBulkSequence,
    cancel: cancelBulkApprove,
    reset: closeBulkApproveModal,
  } = useSequentialBulkRunner<ICampaignRegisterTable, BulkApproveErrorItem>({
    delayBetweenMs: BULK_APPROVE_DELAY_MS,
    timeoutMs: BULK_APPROVE_TIMEOUT_MS,
    mapError: mapBulkApproveError,
    onComplete: onBulkSequenceComplete,
  });

  const bulkApproveProgress: BulkApproveProgress = useMemo(
    () => ({
      isOpen: bulkProgress.isOpen,
      isProcessing: bulkProgress.isProcessing,
      total: bulkProgress.total,
      processed: bulkProgress.processed,
      approvedCount: bulkProgress.successCount,
      errorCount: bulkProgress.errorCount,
      dataError: bulkProgress.errors,
    }),
    [bulkProgress]
  );

  const runBulkApprove = useCallback(
    async (rows: ICampaignRegisterTable[]) => {
      await runBulkSequence(rows, async (row) => {
        const request_item_ids = (row.items ?? []).map((i) => i.id);
        if (request_item_ids.length === 0) {
          throw new Error("Không có sản phẩm để duyệt");
        }

        const response = await approveSampleRequest({
          variables: {
            id: row.id,
            request_item_ids,
          },
        });

        const result = response?.data?.affApproveCampaignSampleRequest;
        if (!result?.success) {
          throw new Error(result?.message || "Duyệt thất bại");
        }
      });
    },
    [approveSampleRequest, runBulkSequence]
  );

  const approveRowItems = useCallback(
    async (requestId: number, requestItemIds: number[], shouldCheckStock?: number) => {
      const ids = (requestItemIds ?? []).filter((x) => typeof x === "number");
      if (!ids.length) {
        showAlert.warn("Vui lòng chọn ít nhất 1 sản phẩm để chấp nhận");
        return;
      }
      try {
        const response = await approveSampleRequest({
          variables: {
            id: requestId,
            request_item_ids: ids,
            ...(shouldCheckStock != null && { should_check_stock: shouldCheckStock }),
          },
        });

        const result = response?.data?.affApproveCampaignSampleRequest;
        if (result?.success) {
          showAlert.success(result?.message || "Chấp nhận thành công");
        } else {
          showAlert.error(result?.message || "Chấp nhận thất bại");
        }
      } catch (e: any) {
        showAlert.error(e?.message || "Chấp nhận thất bại");
      } finally {
        await refetch();
      }
    },
    [approveSampleRequest, refetch]
  );

  const runBulkReject = useCallback(
    async (rows: ICampaignRegisterTable[], rejectMessage: string) => {
      const ids = (rows ?? [])
        .filter(
          (r) => String(r.status ?? '').toLowerCase() === "pending"
        )
        .map((r) => r.id);

      if (!ids.length) {
        showAlert.warn("Không có lượt đăng ký phù hợp để từ chối");
        return;
      }

      try {
        const response = await rejectCampaignSampleRequest({
          variables: {
            ids,
            reject_message: rejectMessage,
          },
        });

        const result = response?.data?.affRejectCampaignSampleRequest;
        if (result?.success) {
          showAlert.success(result?.message || "Từ chối thành công");
        } else {
          showAlert.error(result?.message || "Từ chối thất bại");
        }

        await refetch();
      } catch (e: any) {
        showAlert.error(e?.message || "Từ chối thất bại");
        await refetch();
      }
    },
    [refetch, rejectCampaignSampleRequest]
  );

  const [checkStockQuery] = useLazyQuery(
    query_affCheckCampaignSampleRequestItemsStock,
    { fetchPolicy: "network-only" }
  );

  const checkItemsStock = useCallback(
    async (ids: number[]): Promise<number[]> => {
      const result = await checkStockQuery({ variables: { ids } });
      return result?.data?.affCheckCampaignSampleRequestItemsStock?.data?.errorItemIds ?? [];
    },
    [checkStockQuery]
  );

  return {
    tableData,
    paginationData,
    loading: loading || performancesLoading || ScGetSmeProductsLoading,
    error,
    refetch,
    runBulkApprove,
    cancelBulkApprove,
    closeBulkApproveModal,
    bulkApproveProgress,
    runBulkReject,
    bulkRejectLoading,
    approveRowItems,
    approveRowLoading,
    checkItemsStock,
    totalItems,
    productImageByScProductId,
  };
};
