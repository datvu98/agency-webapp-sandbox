import gql from "graphql-tag";

export default gql`
  mutation inventoryCountingRemoveItems($input: InventoryCountingRemoveItemsInput!) {
    inventoryCountingRemoveItems(input: $input) {
      success
      message
    }
  }
`;
