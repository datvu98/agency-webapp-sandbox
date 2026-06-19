import gql from "graphql-tag";

export default gql`
  query affGetPreviousSubmissionAssetsAir($input: JobSubmissionAssetListInput!) {
    affGetPreviousSubmissionAssets(input: $input) {
      data {
      items {
        advertisingCode
        approvedAt
        createdAt
        id
        linkDrive
        note
        rejectReason
        rejectedAt
        status
        type
        submissionMedias {
          url
          type
          fullAirUrl
          }
        }
      }
    }
}
`
