import gql from "graphql-tag";

export default gql`
	mutation inventoryCountingReassignStaff($input: InventoryCountingReassignStaffInput!) {
		inventoryCountingReassignStaff(input: $input) {
			success
			message
		}
	}
`;
