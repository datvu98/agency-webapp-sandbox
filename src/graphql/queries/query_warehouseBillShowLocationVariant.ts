import gql from "graphql-tag";

export default gql`
	query warehouseBillShowLocationVariant($variantId: String!, $warehouseBillId: Int!, $warehouseBillItemId: Int!) {
		warehouseBillShowLocationVariant(variantId: $variantId, warehouseBillId: $warehouseBillId, warehouseBillItemId: $warehouseBillItemId) {
			data {
				expiredAt
				lotNumber
				quantity
			}
		}
	}
`;
