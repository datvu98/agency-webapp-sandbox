import { useLazyQuery } from "@apollo/client";
import { CampaignJobExportExcelInput } from "app/pages/Campaigns/CampaignRegister/types";
import dayjs from "dayjs";
import query_affExportCampaignJobsExcel from "graphql/queries/query_affExportCampaignJobsExcel";
import query_affGetCampaignJobsExcelExportStatus from "graphql/queries/query_affGetCampaignJobsExcelExportStatus";
import { useCallback, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { showAlert } from "utils/helper";

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 60;

export type CampaignJobsExcelExportOptions = {
  includeCreatorInfo: boolean;
  includeVideoLivestreamInfo: boolean;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const buildExportByFilterInput = (
  filter: CampaignJobExportExcelInput,
): CampaignJobExportExcelInput => {
  const input: CampaignJobExportExcelInput = {
    campaignStoreId: filter.campaignStoreId,
    q: filter.q,
    rangeTime: filter.rangeTime,
    key_time: filter.key_time,
    registeredProductCountType: filter.registeredProductCountType,
    cancelBy: filter.cancelBy,
  };

  if (filter.isPreShippingCancel) {
    input.isPreShippingCancel = true;
  } else if (filter.listStatus?.length) {
    input.listStatus = filter.listStatus;
  }

  return input;
};

export const useCampaignJobsExcelExport = (
  filter: CampaignJobExportExcelInput,
) => {
  const { id } = useParams<{ id: string }>();
  const campaignStoreId = filter.campaignStoreId ?? (id ? Number(id) : undefined);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [exporting, setExporting] = useState(false);

  const [exportExcel] = useLazyQuery(query_affExportCampaignJobsExcel, {
    fetchPolicy: "no-cache",
  });

  const [getExportStatus] = useLazyQuery(
    query_affGetCampaignJobsExcelExportStatus,
    { fetchPolicy: "no-cache" },
  );

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const pollExportStatus = useCallback(
    async (uuid: string, attempt = 0): Promise<boolean> => {
      if (attempt >= MAX_POLL_ATTEMPTS) {
        showAlert.error("Xuất file quá thời gian chờ. Vui lòng thử lại");
        return false;
      }

      try {
        const { data } = await getExportStatus({
          variables: { input: { uuid } },
        });
        const result = data?.affGetCampaignJobsExcelExportStatus;

        if (!result?.success) {
          showAlert.error(result?.message || "Lấy trạng thái xuất file thất bại");
          return false;
        }

        const fileUrl = result?.data?.fileUrl;
        if (fileUrl) {
          const response = await fetch(fileUrl);
          const blob = await response.blob();

          const url = window.URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = url;

          const fileName = `${dayjs().format("DD-MM-YYYY")}_ThongTinNST.xlsx`;

          link.setAttribute("download", fileName);

          document.body.appendChild(link);
          link.click();

          link.remove();
          window.URL.revokeObjectURL(url);

          showAlert.success("Xuất file thành công");
          return true;
        }

        await delay(POLL_INTERVAL_MS);
        return pollExportStatus(uuid, attempt + 1);
      } catch (e: any) {
        showAlert.error(e?.message || "Xuất file thất bại");
        return false;
      }
    },
    [getExportStatus],
  );

  const runExport = useCallback(
    async (input: CampaignJobExportExcelInput) => {
      if (!campaignStoreId) {
        showAlert.warn("Không xác định được chiến dịch");
        return false;
      }

      stopPolling();
      setExporting(true);

      try {
        const { data } = await exportExcel({
          variables: {
            input: {
              ...input,
              campaignStoreId,
            },
          },
        });

        const result = data?.affExportCampaignJobsExcel;
        if (!result?.success) {
          showAlert.error(result?.message || "Xuất file thất bại");
          return false;
        }

        const uuid = result?.data?.uuid;
        if (!uuid) {
          showAlert.error("Không nhận được mã xử lý xuất file");
          return false;
        }

        return await pollExportStatus(uuid);
      } catch (e: any) {
        showAlert.error(e?.message || "Xuất file thất bại");
        return false;
      } finally {
        setExporting(false);
      }
    },
    [campaignStoreId, exportExcel, pollExportStatus, stopPolling],
  );

  const exportByFilter = useCallback(
    () => runExport(buildExportByFilterInput({ ...filter, campaignStoreId })),
    [filter, campaignStoreId, runExport],
  );

  const exportByOptions = useCallback(
    (
      options: CampaignJobsExcelExportOptions,
      campaignJobIds: number[],
    ) => {
      if (!options.includeCreatorInfo && !options.includeVideoLivestreamInfo) {
        showAlert.warn("Vui lòng chọn ít nhất một loại thông tin để xuất");
        return false;
      }

      if (!campaignJobIds.length) {
        showAlert.warn("Vui lòng chọn ít nhất một dòng");
        return false;
      }

      if (options.includeCreatorInfo) {
        return runExport({
          campaignStoreId,
          campaignJobIds,
        });
      }

      return false;
    },
    [campaignStoreId, runExport],
  );

  return {
    exporting,
    exportByFilter,
    exportByOptions,
    stopPolling,
  };
};
