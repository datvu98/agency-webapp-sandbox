import gql from "graphql-tag";

export default gql`
  query inventoryCountingStockDelta(
    $recordId: Int!
    $locationCode: String!
    $sku: String!
  ) {
    inventoryCountingStockDelta(
      recordId: $recordId
      locationCode: $locationCode
      sku: $sku
    ) {
      success
      message
      data {
        locationCode
        sku
        gtin
        transactions {
          type
          qty
          relatedCode
        }
      }
    }
  }
`;
