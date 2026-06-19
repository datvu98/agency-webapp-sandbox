import gql from "graphql-tag";

export default gql`
  mutation inventoryCountingApprove($input: InventoryCountingApproveInput!) {
    inventoryCountingApprove(input: $input) {
      success
      message
    }
  }
`;
