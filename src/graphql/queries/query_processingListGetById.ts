import gql from "graphql-tag";

export default gql`
	query processingListGetById($id: Int!) {
		processingListGetById(id: $id) {
			message
			success
			data {
				agencyId
				code
				createdAt
				createdById
				deletedAt
				id
				note
				picId
				picType
				smeIds
				status
				totalItems
				totalVariants
				totalRequestedQuantity
				totalPickedQuantity
				type
				updatedAt
				warehouseId
				items {
					agencyId
					createdAt
					deletedAt
					id
					processingListId
					updatedAt
					warehouseBillId
				}
			}
		}
	}
`;
