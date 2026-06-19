import gql from "graphql-tag";

export const GET_CAMPAIGN_REPORT = gql`
  query affGetCampaignJobPostsReportByStore(
    $input: CampaignJobPostsReportInput!
  ) {
    affGetCampaignJobPostsReportByStore(input: $input) {
      success
      message
      data {
        totalCommittedPosts
        totalCompletedPosts
        totalExpectedPosts
      }
    }
  }
`;
