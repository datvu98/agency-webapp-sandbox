import gql from "graphql-tag";

export default gql`
  query pickingListShowLocationVariant($variantId: String!, $id: Int!) {
  pickingListShowLocationVariant(id: $id, variantId: $variantId) {
    data {
      expiredAt
      lotNumber
      quantity
      storageEquipmentCode
      storageEquipmentId
    }
  }
}

`;
