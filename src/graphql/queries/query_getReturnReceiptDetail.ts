import gql from "graphql-tag";

export default gql`
	query getReturnReceiptDetail($id: Int!) {
		getReturnReceiptDetail(id: $id) {
			data {
				code
				createdAt
				deletedAt
				id
				shippingCarrier
				shippingCarrierCode
				status
				totalItems
				warehouseId
				updatedAt
				items {
					condition
					createdAt
					deletedAt
					handoverListId
					id
					note
					returnType
					status
					updatedAt
					warehouseBillId
				}
			}
		}
	}
`;
