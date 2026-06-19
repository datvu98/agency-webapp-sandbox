import gql from "graphql-tag";

export default gql`
  query sfFindPackageReceive($keyword: String!) {
    sfFindPackageReceive(keyword: $keyword) {
      total
      list_record {
        keyword
        object_id
        object_type
        object_ref_id
        object_tracking_number
        store_id
        has_import_history
        sf_received_code
        ref_order_id
        source
        sme_id
      }
    }
  }
`;
