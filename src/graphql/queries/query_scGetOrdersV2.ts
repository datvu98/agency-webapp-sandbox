import { gql } from "@apollo/client";

export const QUERY_SC_GET_ORDERS_V2 = gql`
  query findOrderByIds($ids: [Int!]!, $sme_id: Int!) {
    findOrderByIds(ids: $ids, sme_id: $sme_id) {
      status
      id
      ref_id
      platform_status_text
      logisticsPackages {
        id
        tracking_number
        package_number
        shipping_carrier
        pack_status
      }
    }
  }
`;
