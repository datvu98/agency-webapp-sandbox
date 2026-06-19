import { useMutation, useQuery } from "@apollo/client"
import query_affGetCampaignJobDetail from "graphql/queries/query_affGetCampaignJobDetail";
import query_affGetCreatorChannelPerformances from "graphql/queries/query_affGetCreatorChannelPerformances";
import query_affGetJobProductsApprovedVideoMedia from "graphql/queries/query_affGetJobProductsApprovedVideoMedia";
import query_findOrderDetail from "graphql/queries/query_findOrderDetail";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
// import { ASSET_STATUS } from "../constants/constants";
import mutate_affUpdateCampaignJobOrderInfo from "graphql/mutations/mutate_affUpdateCampaignJobOrderInfo";
import { showAlert } from "utils/helper";

export const useJobDetail = () => {

  const { id } = useParams();

  const { data: jobDetail, loading: jobDetailLoading, refetch: refetchJobDetail } = useQuery(
    query_affGetCampaignJobDetail,
    {
      variables: { id: Number(id) },
      skip: !id,
      fetchPolicy: "network-only",
    }
  );

  const jobDetailData = useMemo(() => jobDetail?.affGetCampaignJobDetail?.data?.job ?? null, [jobDetail]);

  const creatorChannelId = jobDetailData?.creatorChannelId ?? 0;

  const { data: performancesData, loading: performancesLoading } = useQuery(
    query_affGetCreatorChannelPerformances,
    {
      variables: { ids: [creatorChannelId] },
      skip: !creatorChannelId,
      fetchPolicy: "network-only",
    }
  );

  const orderId = Number(jobDetailData?.campaignSampleRequest?.orderId);
  const smeId = Number(jobDetailData?.campaignStore?.smeId);

  const {
    data: orderDetailData,
    loading: orderDetailLoading,
    refetch: refetchOrderDetail,
    startPolling: startOrderDetailPolling,
    stopPolling: stopOrderDetailPolling,
  } = useQuery(
    query_findOrderDetail,
    {
      variables: { ids: [orderId], sme_id: smeId },
      skip: !orderId || !smeId,
      fetchPolicy: "network-only",
      notifyOnNetworkStatusChange: true,
    }
  );
  const [isOrderDetailPolling, setIsOrderDetailPolling] = useState(false);

  const hasOrderDetail = Boolean(orderDetailData?.findOrderByIds?.[0]);

  useEffect(() => {
    if (!orderId || !smeId || hasOrderDetail) {
      stopOrderDetailPolling();
      setIsOrderDetailPolling(false);
      return;
    }

    setIsOrderDetailPolling(true);
    startOrderDetailPolling(3000);

    const timeoutId = window.setTimeout(() => {
      stopOrderDetailPolling();
      setIsOrderDetailPolling(false);
    }, 60000);

    return () => {
      window.clearTimeout(timeoutId);
      stopOrderDetailPolling();
      setIsOrderDetailPolling(false);
    };
  }, [orderId, smeId, hasOrderDetail, startOrderDetailPolling, stopOrderDetailPolling]);

  const orderDetailLoadingWithPolling =
    orderDetailLoading || (isOrderDetailPolling && !hasOrderDetail);

  const { data: approvedVideoMedia, loading: approvedVideoMediaLoading } = useQuery(
    query_affGetJobProductsApprovedVideoMedia,
    {
      // variables: { jobId: Number(id), statusAsset: 'approved_demo' },
      variables: { jobId: Number(id) }, 
      skip: !id,
      fetchPolicy: "network-only",
    }
  );

  const approvedVideoMediaData = useMemo(() => approvedVideoMedia?.affGetJobProductsApprovedVideoMedia?.data?.items ?? null, [approvedVideoMedia]);

  const [updateCampaignJobOrderInfoMutation, { loading: updateCampaignJobOrderInfoLoading }] =
    useMutation(mutate_affUpdateCampaignJobOrderInfo);

  const saveCampaignJobOrderInfo = useCallback(
    async (refOrderId: string) => {
      const jobId = Number(id);
      const smeIdValue = Number(jobDetailData?.campaignStore?.smeId);
      const trimmedRefOrderId = refOrderId.trim();

      if (!jobId) {
        showAlert.warn("Không xác định được job");
        return false;
      }
      if (!smeIdValue) {
        showAlert.warn("Không xác định được SME");
        return false;
      }
      if (!trimmedRefOrderId) {
        showAlert.warn("Vui lòng nhập mã đơn hàng");
        return false;
      }

      try {
        const { data } = await updateCampaignJobOrderInfoMutation({
          variables: {
            input: {
              jobId,
              refOrderId: trimmedRefOrderId,
              smeId: smeIdValue,
            },
          },
        });

        const result = data?.affUpdateCampaignJobOrderInfo;
        if (result?.success) {
          showAlert.success(result?.message || "Cập nhật mã đơn hàng thành công");
          await Promise.all([refetchJobDetail(), refetchOrderDetail()]);
          return true;
        }

        showAlert.error(result?.message || "Cập nhật mã đơn hàng thất bại");
        return false;
      } catch (error: any) {
        showAlert.error(error?.message || "Cập nhật mã đơn hàng thất bại");
        return false;
      }
    },
    [
      id,
      jobDetailData?.campaignStore?.smeId,
      refetchJobDetail,
      refetchOrderDetail,
      updateCampaignJobOrderInfoMutation,
    ],
  );

  return {
    jobDetailData,
    jobDetailLoading,
    refetchJobDetail,
    performancesData,
    performancesLoading,
    orderDetailData,
    orderDetailLoading: orderDetailLoadingWithPolling,
    refetchOrderDetail,
    approvedVideoMediaData,
    approvedVideoMediaLoading,
    saveCampaignJobOrderInfo,
    updateCampaignJobOrderInfoLoading,
  };
};
