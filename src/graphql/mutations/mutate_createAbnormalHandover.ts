import { gql } from "@apollo/client";

export default gql`
  mutation createAbnormalHandover($input: CreateAbnormalHandoverInput!) {
    createAbnormalHandover(input: $input) {
      success
      message
      data {
        totalItems
        successCount
        failedItems {
          warehouseBillId
          code
          error
        }
        createdHandoverLists {
          id
          code
          shippingCarrier
          shippingCarrierCode
          totalItems
          handoverAt
        }
      }
    }
  }
`;
