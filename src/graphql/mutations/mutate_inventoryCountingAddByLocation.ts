import gql from "graphql-tag";

export default gql`
  mutation inventoryCountingAddByLocation($input: InventoryCountingAddByLocationInput!) {
    inventoryCountingAddByLocation(input: $input) {
      success
      message
      data {
        addedCount
      }
    }
  }
`;
