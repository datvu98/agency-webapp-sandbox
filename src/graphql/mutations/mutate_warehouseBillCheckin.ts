import gql from "graphql-tag";

export default gql`
	mutation warehouseBillCheckin($where: SmeWarehouseBillWhereInput) {
		warehouseBillCheckin(where: $where) {
			message
			success
			data {
				errors {
					code
					message
				}
			}
		}
	}
`;
