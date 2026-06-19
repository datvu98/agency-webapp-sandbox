import { useApolloClient, useLazyQuery, useMutation } from "@apollo/client";
import mutate_affApproveDemoJobSubmission from "graphql/mutations/mutate_affApproveDemoJobSubmission";
import query_affGetCampaignJobDetailByApproveAsset from "graphql/queries/query_affGetCampaignJobDetailByApproveAsset";
import query_affGetPreviousSubmissionAssets from "graphql/queries/query_affGetPreviousSubmissionAssets";
import query_affGetPreviousSubmissions from "graphql/queries/query_affGetPreviousSubmissions";
import { useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { PreviousSubmissionAssetHistoryItem, SubmitApproveDemoJobSubmissionParams } from "../../types/CampaignJobDetail.type";


export const useApprovedAssets = (jobIdProp?: number) => {
  const client = useApolloClient();
  const { id } = useParams();
  const jobId = jobIdProp ?? Number(id);

  const [getApprovedAssets, { data: approvedAssetsResponse, loading: approvedAssetsLoading }] = useLazyQuery(
    query_affGetCampaignJobDetailByApproveAsset,
    {
      variables: { id: jobId },
      fetchPolicy: "network-only",
    }
  );

  const approvedAssetsData = useMemo(
    () => approvedAssetsResponse?.affGetCampaignJobDetail?.data?.job ?? null,
    [approvedAssetsResponse]
  );

  const [approveDemoJobSubmission, { loading: approveDemoJobSubmissionLoading }] = useMutation(mutate_affApproveDemoJobSubmission);

  const submitApproveDemoJobSubmission = async ({
    submissionId,
    approvedAssetIds = [],
    rejectedAssets = [],
    extendTime,
    jobId,
  }: SubmitApproveDemoJobSubmissionParams) => {
    const input = {
      submissionId,
      assetApprovedIds: approvedAssetIds,
      assetRejects: rejectedAssets,
      ...(extendTime ? { extendTime } : {}),
      jobId: Number(jobId),
    };

    const result = await approveDemoJobSubmission({
      variables: { input },
    });

    const graphQlMessages = (result.errors ?? [])
      .map((err) => err.message)
      .filter(Boolean);
    if (graphQlMessages.length) {
      throw new Error(graphQlMessages.join("\n"));
    }

    const mutationResult = result.data?.affApproveDemoJobSubmission;
    if (mutationResult?.success === false) {
      throw new Error(mutationResult.message || "Duyệt demo thất bại.");
    }

    await client.refetchQueries({
      include: "active",
    });

    return result;
  };

  const [getPreviousSubmissions, { data: previousSubmissionsResponse, loading: previousSubmissionsLoading }] = useLazyQuery(query_affGetPreviousSubmissions,
    {
      variables: { jobId, type: 'demo' },
      fetchPolicy: 'network-only',
    }
  );

  const previousSubmissionsData = useMemo(
    () => previousSubmissionsResponse?.affGetPreviousSubmissions?.data?.items ?? null,
    [previousSubmissionsResponse]
  );

  const previousSubmissionsTotalVideoCount = useMemo(
    () => {
      return previousSubmissionsResponse?.affGetPreviousSubmissions?.data?.videoCount ?? 0;
    },
    [previousSubmissionsResponse]
  );

  const previousSubmissionsApprovedVideoCount = useMemo(
    () => previousSubmissionsResponse?.affGetPreviousSubmissions?.data?.approvedDemoCount ?? 0,
    [previousSubmissionsResponse]
  );

  const [getPreviousSubmissionAssetsRaw, { data: previousSubmissionAssetsResponse, loading: previousSubmissionAssetsLoading }] = useLazyQuery(
    query_affGetPreviousSubmissionAssets,
    {
      fetchPolicy: 'network-only',
    }
  );

  const getPreviousSubmissionAssets = useCallback(async (index: number, type: "video" | "live" = "video") => {
    if (!jobId) return null;
    return getPreviousSubmissionAssetsRaw({
      variables: {
        input: {
          jobId,
          index,
          type,
        },
      },
    });
  }, [getPreviousSubmissionAssetsRaw, jobId]);

  const previousSubmissionAssetsData = useMemo<PreviousSubmissionAssetHistoryItem[]>(() => previousSubmissionAssetsResponse?.affGetPreviousSubmissionAssets?.data?.items ?? [], [previousSubmissionAssetsResponse]);


  return {
    getApprovedAssets,
    approvedAssetsData,
    approvedAssetsLoading,
    approveDemoJobSubmission,
    approveDemoJobSubmissionLoading,
    submitApproveDemoJobSubmission,
    getPreviousSubmissions,
    previousSubmissionsResponse,
    previousSubmissionsData,
    previousSubmissionsLoading,
    getPreviousSubmissionAssets,
    previousSubmissionAssetsData,
    previousSubmissionAssetsLoading,

    // Số liệu popup lịch sử demo
    previousSubmissionsTotalVideoCount,
    previousSubmissionsApprovedVideoCount,
  };
};