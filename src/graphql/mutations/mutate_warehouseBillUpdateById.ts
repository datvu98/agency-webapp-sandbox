import gql from "graphql-tag";

export default gql`
	mutation warehouseBillUpdateById($updated: SmeWarehouseBillUpdateInput!, $id: Int!) {
		warehouseBillUpdateById(id: $id, updated: $updated) {
			message
			success
		}
	}
`;
