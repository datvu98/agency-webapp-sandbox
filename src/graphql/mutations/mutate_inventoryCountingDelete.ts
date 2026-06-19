import gql from "graphql-tag";

export default gql`
  mutation inventoryCountingDelete($input: InventoryCountingDeleteInput!) {
    inventoryCountingDelete(input: $input) {
      success
      message
    }
  }
`;
