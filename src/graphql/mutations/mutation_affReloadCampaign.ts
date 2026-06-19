import gql from "graphql-tag";

export default gql`
  mutation affReloadCampaign($campaignId: Int!) {
    affReloadCampaign(campaignId: $campaignId) {
      message
      success
    }
  }
`;
