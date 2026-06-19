import gql from "graphql-tag";

export default gql`
	query warehouseBillCount($where: SmeWarehouseBillWhereInput) {
		warehouseBillCount(where: $where) {
			message
			success
			data {
				checkedIn
				complete
				end
				gap
				new
				noGap
				notCheckedIn
				poCompleted
				poNotCompleted
				store
				waiting
			}
		}
	}
`;
