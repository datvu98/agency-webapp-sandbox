import gql from "graphql-tag";

export const GET_COUNT_CAMPAIGN_JOBS = gql`
  query affCountCampaignJobsByStatus(
    $filter: CampaignJobStatusCountFilterInput
  ) {
    affCountCampaignJobsByStatus(filter: $filter) {
      success
      message
      data {
        status
        count
      }
    }
  }
`;
