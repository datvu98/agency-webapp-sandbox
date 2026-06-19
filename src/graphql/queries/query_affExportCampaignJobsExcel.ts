import gql from "graphql-tag";

export default gql`
  query affExportCampaignJobsExcel($input: CampaignJobExportExcelInput!) {
    affExportCampaignJobsExcel(input: $input) {
      success
      message
      data {
        uuid
        isReady
      }
    }
  }
`;