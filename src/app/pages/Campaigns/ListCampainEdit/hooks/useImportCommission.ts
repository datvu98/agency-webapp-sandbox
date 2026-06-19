import { Upload, UploadProps } from "antd";
import { useCallback, useState } from "react";
import { showAlert } from "utils/helper";
import { useUploadFile } from "./useUploadFile";
import { IListCommission } from "app/pages/Campaigns/types";
import { useLazyQuery } from "@apollo/client";
import { GET_CAMPAIGN_PRODUCTS_EXCEL } from "graphql/queries/query_affGetCampaignProductsFromExcel";

const useImportCommission = (campaignId?: number) => {
  const [getCampaignProducts] = useLazyQuery(GET_CAMPAIGN_PRODUCTS_EXCEL);
  const { uploadFile, loading: uploadLoading } = useUploadFile();

  const [visibleModal, setVisibleModal] = useState(false);
  const [visibleGuide, setVisibleGuide] = useState(false);

  const [excelUrl, setExcelUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const [listCommission, setListCommission] = useState<IListCommission[]>([]);
  const [listErrorCommission, setListErrorCommission] = useState<
    IListCommission[]
  >([]);

  const [confirmLoading, setConfirmLoading] = useState(false);

  const resetGuideState = () => {
    setExcelUrl(null);
    setFileName("");
  };

  // ===== Modal =====
  const openModal = () => setVisibleModal(true);
  const closeModal = () => setVisibleModal(false);

  const openGuide = () => {
    resetGuideState();
    setVisibleGuide(true);
  };

  const closeGuide = () => {
    setVisibleGuide(false);
    resetGuideState();
  };

  // ===== Upload =====
  const beforeUpload = useCallback(
    async (file: File) => {
      const isExcel = /\.(xls|xlsx)$/.test(file.name);

      if (!isExcel) {
        showAlert.error("Tệp không đúng định dạng");
        return Upload.LIST_IGNORE;
      }

      if (!campaignId) {
        showAlert.error("ID chiến dịch không tồn tại");
        return Upload.LIST_IGNORE;
      }

      try {
        const url = await uploadFile(file);
        setExcelUrl(url);
        setFileName(file.name);
      } catch {
        resetGuideState();
      }

      return Upload.LIST_IGNORE;
    },
    [campaignId, uploadFile]
  );

  // ===== Confirm =====
  const confirmImport = useCallback(async () => {
    if (!excelUrl || !campaignId) return;

    setConfirmLoading(true);

    try {
      const { data } = await getCampaignProducts({
        variables: {
          excelUrl,
          campaignStoreId: null,
          campaignId,
        },
      });

      const result = data?.affGetCampaignProductsFromExcel;

      if (!result?.success) {
        showAlert.error(result?.message || "Tải tệp thất bại");
        return;
      }

      setListCommission(result.data?.passedItems ?? []);
      setListErrorCommission(result.data?.errorItems ?? []);

      openModal();
      closeGuide();
    } catch {
      showAlert.error("Tải tệp thất bại");
    } finally {
      setConfirmLoading(false);
    }
  }, [excelUrl, campaignId, getCampaignProducts]);

  // ===== Upload props =====
  const uploadProps: UploadProps = {
    maxCount: 1,
    beforeUpload,
    showUploadList: false,
    accept: ".xls,.xlsx",
  };

  return {
    // state
    visibleModal,
    visibleGuide,
    listCommission,
    listErrorCommission,
    confirmLoading,
    uploadLoading,
    fileName,
    canConfirm: Boolean(excelUrl),

    // actions
    openModal,
    closeModal,
    openGuide,
    closeGuide,
    confirmImport,

    // upload
    uploadProps,
  };
};

export { useImportCommission };
