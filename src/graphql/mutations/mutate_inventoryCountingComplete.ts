import gql from "graphql-tag";

export default gql`
  mutation inventoryCountingComplete($input: InventoryCountingCompleteInput!) {
    inventoryCountingComplete(input: $input) {
      success
      message
    }
  }
`;
