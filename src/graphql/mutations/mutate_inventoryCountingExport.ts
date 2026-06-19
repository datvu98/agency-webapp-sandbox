import gql from "graphql-tag";

export default gql`
	mutation inventoryCountingExport($input: InventoryCountingExportInput!) {
		inventoryCountingExport(input: $input) {
			message
			success
			data {
				url
			}
		}
	}
`;
