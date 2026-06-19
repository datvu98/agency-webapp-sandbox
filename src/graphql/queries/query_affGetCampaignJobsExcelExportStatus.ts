import gql from "graphql-tag";

export default gql`
  query affGetCampaignJobsExcelExportStatus($input: CampaignJobExportExcelStatusInput!) {
    affGetCampaignJobsExcelExportStatus(input: $input) {
      success
      message
      data {
        uuid
        fileUrl
      }
    }
  }
`;