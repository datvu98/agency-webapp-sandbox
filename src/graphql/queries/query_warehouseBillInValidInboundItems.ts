import gql from "graphql-tag";

export default gql`
	query warehouseBillInValidInboundItems($id: Int!) {
		warehouseBillInValidInboundItems(id: $id) {
			data {
				quantityActual
				quantityExpected
				variantId
			}
		}
	}
`;
