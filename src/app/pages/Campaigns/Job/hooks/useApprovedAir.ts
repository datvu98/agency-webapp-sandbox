import { useLazyQuery, useMutation, useQuery } from "@apollo/client"
import query_affGetJobProductsApprovedVideoMedia from "graphql/queries/query_affGetJobProductsApprovedVideoMedia";
import { useParams } from "react-router-dom";
import { useCallback, useMemo } from "react";
import query_affGetJobAssetsLiveMedia from "graphql/queries/query_affGetJobAssetsLiveMedia";
import query_affGetCampaignJobDetailByApproveAir from "graphql/queries/query_affGetCampaignJobDetailByApproveAir";
import mutate_affApproveAirJobSubmission from "graphql/mutations/mutate_affApproveAirJobSubmission";
import query_affGetCampaignJobDetailApproveAirLive from "graphql/queries/query_affGetCampaignJobDetailApproveAirLive";
import {
  PreviousSubmissionAssetHistoryItem,
} from "../../types/CampaignJobDetail.type";
import query_affGetPreviousSubmissionsAir from "graphql/queries/query_affGetPreviousSubmissionsAir";
import query_affGetPreviousSubmissionAssetsAir from "graphql/queries/query_affGetPreviousSubmissionAssetsAir";
import query_affCheckAddShowcaseCampaignProductsByAgency from "graphql/queries/query_affCheckAddShowcaseCampaignProductsByAgency";

export const useApprovedAir = () => {

  const { id } = useParams();
  const { data: approvedVideoMediaAir, loading: approvedVideoMediaAirLoading } = useQuery(
    query_affGetJobProductsApprovedVideoMedia,
    {
      variables: { jobId: Number(id), statusAsset: "approved_air" },
      skip: !id,
      fetchPolicy: "network-only",
    }
  );

  const approvedVideoMediaDataAir = useMemo(() => approvedVideoMediaAir?.affGetJobProductsApprovedVideoMedia?.data?.items ?? null, [approvedVideoMediaAir]);
  const creatorChannelId = useMemo(() => approvedVideoMediaDataAir?.[0]?.creatorChannelId, [approvedVideoMediaDataAir]);
  const campaignProductIds = useMemo(() => approvedVideoMediaDataAir?.flatMap((item) => item?.campaignProductId) ?? [], [approvedVideoMediaDataAir]);
 
  const { data: checkAddShowcaseCampaignProductsByAgencyResponse, loading: checkAddShowcaseCampaignProductsByAgencyLoading } = useQuery(
    query_affCheckAddShowcaseCampaignProductsByAgency,
    {
      variables: { input: { creatorChannelId, campaignProductIds } },
      skip: !creatorChannelId || !campaignProductIds,
      fetchPolicy: "network-only",
    }
  );

  const checkAddShowcase = useMemo(() => checkAddShowcaseCampaignProductsByAgencyResponse?.affCheckAddShowcaseCampaignProductsByAgency?.data?.items ?? [], [checkAddShowcaseCampaignProductsByAgencyResponse]);

  const { data: approvedAirMedia, loading: approvedAirMediaLoading } = useQuery(
    query_affGetJobAssetsLiveMedia,
    {
      variables: { jobId: Number(id), statusAsset: "approved_air" },
      skip: !id,
      fetchPolicy: "network-only",
    }
  );

  const approvedLiveMediaData = useMemo(() => approvedAirMedia?.affGetJobAssetsLiveMedia?.data?.items ?? null, [approvedAirMedia]);
  const [getApprovedAirData, { data: approvedAirResponse, loading: approvedAirDataLoading }] = useLazyQuery(
    query_affGetCampaignJobDetailByApproveAir,
    {
      variables: { id: Number(id) },
      fetchPolicy: "network-only",
    }
  );

  const approvedAirData = useMemo(() => approvedAirResponse?.affGetCampaignJobDetail?.data?.job ?? null, [approvedAirResponse]);

  const [approveAirJobSubmission, { loading: approveAirJobSubmissionLoading }] = useMutation(
    mutate_affApproveAirJobSubmission,
    {
      refetchQueries: ["affGetCampaignJobs", "affGetCampaignJobDetail", "affGetJobAssetsLiveMedia"],
    }
  );

  const submitApproveAirJobSubmission = async ({
    submissionId,
    approvedAssetIds = [],
    rejectedAssets = [],
    extendTime,
    jobId,
  }: {
    submissionId: number;
    approvedAssetIds?: number[];
    rejectedAssets?: { id: number; reason: string }[];
    extendTime?: string;
    jobId?: number;
  }) => {
    const input = {
      submissionId,
      assetApprovedIds: approvedAssetIds,
      assetRejects: rejectedAssets,
      ...(extendTime ? { extendTime } : {}),
      jobId: Number(jobId),
    };

    const result = await approveAirJobSubmission({
      variables: { input },
    });

    const graphQlMessages = (result.errors ?? [])
      .map((err) => err.message)
      .filter(Boolean);
    if (graphQlMessages.length) {
      throw new Error(graphQlMessages.join("\n"));
    }

    const mutationResult = result.data?.affApproveAirJobSubmission;
    if (mutationResult?.success === false) {
      throw new Error(mutationResult.message || "Duyệt nghiệm thu thất bại.");
    }

    return result;
  };

  const { data: jobDetailApproveAirLiveResponse, loading: jobDetailApproveAirLiveLoading } = useQuery(
    query_affGetCampaignJobDetailApproveAirLive,
    {
      variables: { id: Number(id) },
      skip: !id,
      fetchPolicy: "network-only",
    }
  );

  const [getPreviousSubmissions, { data: previousSubmissionsResponse, loading: previousSubmissionsLoading }] = useLazyQuery(
    query_affGetPreviousSubmissionsAir,
    {
      fetchPolicy: 'network-only',
    }
  );

  const previousSubmissionsData = useMemo(
    () => previousSubmissionsResponse?.affGetPreviousSubmissions?.data?.items ?? null,
    [previousSubmissionsResponse]
  );

  const previousSubmissionsJobProducts = useMemo(
    () =>
      jobDetailApproveAirLiveResponse?.affGetCampaignJobDetail?.data?.job?.jobProducts
      ?? approvedAirData?.jobProducts
      ?? [],
    [approvedAirData?.jobProducts, jobDetailApproveAirLiveResponse]
  );

  const [getPreviousSubmissionAssetsRaw, { data: previousSubmissionAssetsResponse, loading: previousSubmissionAssetsLoading }] = useLazyQuery(
    query_affGetPreviousSubmissionAssetsAir,
    {
      fetchPolicy: 'network-only',
    }
  );

  const getPreviousSubmissionAssets = useCallback(async (
    index: number,
    type: "video" | "live" = "video",
    submission_type = "air",
    jobIdOverride?: number | null,
  ) => {
    const jobId = Number(jobIdOverride ?? id);
    if (!jobId || Number.isNaN(jobId)) return null;
    return getPreviousSubmissionAssetsRaw({
      variables: {
        input: {
          jobId,
          index,
          type,
          submission_type,
        },
      },
    });
  }, [getPreviousSubmissionAssetsRaw, id]);

  const previousSubmissionAssetsData = useMemo<PreviousSubmissionAssetHistoryItem[]>(() => previousSubmissionAssetsResponse?.affGetPreviousSubmissionAssets?.data?.items ?? [], [previousSubmissionAssetsResponse]);

  const jobDetailApproveAirLive = useMemo(() => jobDetailApproveAirLiveResponse?.affGetCampaignJobDetail?.data?.job ?? null, [jobDetailApproveAirLiveResponse]);

  return {
    approvedVideoMediaDataAir,
    approvedVideoMediaAirLoading,
    approvedLiveMediaData,
    approvedAirMediaLoading,
    approvedAirData,
    approvedAirDataLoading,
    getApprovedAirData,
    approveAirJobSubmissionLoading,
    submitApproveAirJobSubmission,
    jobDetailApproveAirLive,
    jobDetailApproveAirLiveLoading,
    getPreviousSubmissions,
    previousSubmissionsResponse,
    previousSubmissionsData,
    previousSubmissionsJobProducts,
    previousSubmissionsLoading,
    getPreviousSubmissionAssets,
    previousSubmissionAssetsData,
    previousSubmissionAssetsLoading,
    checkAddShowcase,
  }
}