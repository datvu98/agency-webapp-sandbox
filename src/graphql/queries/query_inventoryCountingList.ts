import gql from "graphql-tag";

export default gql`
	query inventoryCountingList($input: InventoryCountingListInput) {
		inventoryCountingList(input: $input) {
			success
			message
			data {
				createdById
				assignedToId
				avgDiff
				code
				createdAt
				deletedAt
				id
				sessionCount
				status
				totalLocationCounted
				totalLocationRequest
				totalSkuCounted
				totalSkuRequest
				warehouseId
				warehouseName
			}
		}
	}
`;
