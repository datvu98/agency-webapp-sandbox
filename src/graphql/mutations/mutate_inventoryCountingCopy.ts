import gql from "graphql-tag";

export default gql`
  mutation inventoryCountingCopy($input: InventoryCountingCopyInput!) {
    inventoryCountingCopy(input: $input) {
      success
      message
      data {
        id
        code
      }
    }
  }
`;
