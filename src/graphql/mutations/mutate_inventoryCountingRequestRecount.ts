import gql from "graphql-tag";

export default gql`
  mutation inventoryCountingRequestRecount($input: InventoryCountingRequestRecountInput!) {
    inventoryCountingRequestRecount(input: $input) {
      success
      message
      data {
        sessionId
        sessionCode
        sessionNumber
      }
    }
  }
`;
