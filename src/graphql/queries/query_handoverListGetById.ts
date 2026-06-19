import gql from "graphql-tag";

export default gql`
	query handoverListGetById($id: Int!) {
		handoverListGetById(id: $id) {
			data {
				warehouseId
				updatedAt
				totalItems
				status
				shippingCarrierCode
				shippingCarrier
				picType
				picId
				note
				id
				handoverAt
				deletedAt
				createdAt
				code
				agencyId
			}
		}
	}
`;
