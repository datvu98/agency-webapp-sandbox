import gql from "graphql-tag";

export default gql`
  query scGetExportOrderDirectStatus(
    $job_id: String!
  ) {
    scGetExportOrderDirectStatus(
      job_id: $job_id
    ) {
      link_export
      status
    }
  }
`;
