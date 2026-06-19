import gql from "graphql-tag";

export default gql`
  mutation inventoryCountingAddByVariant(
    $input: InventoryCountingAddByVariantInput!
  ) {
    inventoryCountingAddByVariant(input: $input) {
      success
      message
      data {
        addedCount
      }
    }
  }
`;
