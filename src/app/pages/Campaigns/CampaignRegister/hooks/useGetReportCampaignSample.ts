import { useQuery } from "@apollo/client";
import { CampaignJobReport, CampaignSampleFilterValues } from "../types";
import { GET_CAMPAIGN_REPORT } from "graphql/queries/query_affGetCampaignJobsReport";

interface useGetReportCampaignSampleProps {
  filter: CampaignSampleFilterValues & { campaignStoreId: number | undefined };
}
const useGetReportCampaignSample = ({
  filter,
}: useGetReportCampaignSampleProps) => {
  const { data, loading } = useQuery(GET_CAMPAIGN_REPORT, {
    variables: {
      input: {
        rangeTime: filter.rangeTime,
        key_time: filter.key_time,
        campaignStoreId: filter.campaignStoreId,
      },
    },
    skip: !filter.campaignStoreId,
    fetchPolicy: "network-only",
  });

  const dataReport: CampaignJobReport =
    data?.affGetCampaignJobPostsReportByStore.data;

  return { data: dataReport, loading };
};

export { useGetReportCampaignSample };
