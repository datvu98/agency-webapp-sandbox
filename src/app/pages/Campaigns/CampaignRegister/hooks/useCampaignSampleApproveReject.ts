import { useLazyQuery, useMutation } from "@apollo/client";
import query_affCheckCampaignSampleRequestItemsStock from "graphql/queries/query_affCheckCampaignSampleRequestItemsStock";
import mutate_affApproveCampaignSampleRequest from "graphql/mutations/mutate_affApproveCampaignSampleRequest";
import mutate_affRejectCampaignSampleRequest from "graphql/mutations/mutate_affRejectCampaignSampleRequest";
import { useCallback, useMemo } from "react";
import { showAlert } from "utils/helper";
import { useSequentialBulkRunner } from "app/pages/Campaigns/CampaignRegister/hooks/useSequentialBulkRunner";
import { ICampaignJob } from "../types/CampaignRegisterTable.types";
import { REGISTER_SAMPLE_STATUS } from "app/pages/Campaigns/CampaignRegister/constants/constant";

const BULK_APPROVE_DELAY_MS = 350;
const BULK_APPROVE_TIMEOUT_MS = 12000;

type RefetchCampaignSample = () => Promise<unknown>;

/** Lỗi trả về khi duyệt bulk thất bại — dùng plain object thay vì custom Error class */
type BulkApproveFailure = {
  message: string;
  error_code?: string;
};

interface BulkSampleApproveErrorItem {
  key: string;
  creatorChannelName: string;
  creatorChannelUsername: string;
  createdAt: string;
  errorMessage: string;
  error_code?: string;
  row: ICampaignJob;
}

interface BulkSampleApproveProgress {
  isOpen: boolean;
  isProcessing: boolean;
  total: number;
  processed: number;
  approvedCount: number;
  errorCount: number;
  dataError: BulkSampleApproveErrorItem[];
}

const isBulkApproveFailure = (err: unknown): err is BulkApproveFailure =>
  typeof err === "object" &&
  err != null &&
  "message" in err &&
  typeof (err as BulkApproveFailure).message === "string";

const parseBulkApproveError = (
  err: unknown,
): Pick<BulkSampleApproveErrorItem, "errorMessage" | "error_code"> => {
  if (isBulkApproveFailure(err)) {
    return {
      errorMessage: err.message || "Duyệt thất bại",
      error_code: err.error_code,
    };
  }

  if (err instanceof Error) {
    return { errorMessage: err.message };
  }

  return { errorMessage: "Duyệt thất bại" };
};

const buildBulkApproveErrorItem = (
  row: ICampaignJob,
  index: number,
  err: unknown,
): BulkSampleApproveErrorItem => ({
  key: `${row.id}-${index}`,
  creatorChannelName: row.creatorChannelName || "--",
  creatorChannelUsername: row.creatorChannelUsername || "--",
  createdAt: row.createdAt,
  ...parseBulkApproveError(err),
  row,
});

export const useCampaignSampleApproveReject = (
  refetch: RefetchCampaignSample
) => {
  const [approveSampleRequest, { loading: approveRowLoading }] = useMutation(
    mutate_affApproveCampaignSampleRequest,
    {
      refetchQueries: ["affGetCampaignJobs", "affCountCampaignJobsByStatus"],
    }
  );

  const [rejectCampaignSampleRequest, { loading: bulkRejectLoading }] =
    useMutation(mutate_affRejectCampaignSampleRequest, {
      refetchQueries: ["affGetCampaignJobs", "affCountCampaignJobsByStatus"],
    });

  const mapBulkApproveError = useCallback(
    (row: ICampaignJob, index: number, err: unknown) =>
      buildBulkApproveErrorItem(row, index, err),
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
  } = useSequentialBulkRunner<ICampaignJob, BulkSampleApproveErrorItem>({
    delayBetweenMs: BULK_APPROVE_DELAY_MS,
    timeoutMs: BULK_APPROVE_TIMEOUT_MS,
    mapError: mapBulkApproveError,
    onComplete: onBulkSequenceComplete,
  });

  const bulkApproveProgress: BulkSampleApproveProgress = useMemo(
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
    async (rows: ICampaignJob[]) => {
      await runBulkSequence(rows, async (row) => {
        const requestId = row.campaignSampleRequest?.id ?? row.id;
        const request_item_ids = (row.campaignSampleRequest?.items ?? []).map(
          (i) => i.id
        );
        if (request_item_ids.length === 0) {
          throw new Error("Không có sản phẩm để duyệt");
        }

        const response = await approveSampleRequest({
          variables: {
            id: requestId,
            request_item_ids,
          },
        });

        const result = response?.data?.affApproveCampaignSampleRequest;
        if (!result?.success) {
          const failure: BulkApproveFailure = {
            message: result?.message || "Duyệt thất bại",
            error_code: result?.error_code,
          };
          throw failure;
        }
      });
    },
    [approveSampleRequest, runBulkSequence]
  );

  const approveRowItems = useCallback(
    async (
      requestId: number,
      requestItemIds: number[],
      shouldCheckStock?: number
    ) => {
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
            ...(shouldCheckStock != null && {
              should_check_stock: shouldCheckStock,
            }),
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
    async (rows: ICampaignJob[], rejectMessage: string) => {
      const ids = (rows ?? [])
        .filter(
          (r) =>
            String(
              r.campaignSampleRequest?.status ?? r.status ?? ""
            ).toLowerCase() === REGISTER_SAMPLE_STATUS.pending
        )
        .map((r) => r.campaignSampleRequest?.id ?? r.id);

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
      return (
        result?.data?.affCheckCampaignSampleRequestItemsStock?.data
          ?.errorItemIds ?? []
      );
    },
    [checkStockQuery]
  );

  return {
    runBulkApprove,
    cancelBulkApprove,
    closeBulkApproveModal,
    bulkApproveProgress,
    runBulkReject,
    bulkRejectLoading,
    approveRowItems,
    approveRowLoading,
    checkItemsStock,
  };
};
