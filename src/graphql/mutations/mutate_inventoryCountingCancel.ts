import gql from "graphql-tag";

export default gql`
  mutation inventoryCountingCancel($input: InventoryCountingCancelInput!) {
    inventoryCountingCancel(input: $input) {
      success
      message
    }
  }
`;
