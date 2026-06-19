import gql from "graphql-tag";

export default gql`
	mutation inventoryCountingCreate($input: InventoryCountingCreateInput!) {
		inventoryCountingCreate(input: $input) {
			success
			message
			data {
				id
				code
				totalRows
				successCount
				failCount
				errors {
					row
					code
					reason
				}
			}
		}
	}
`;
