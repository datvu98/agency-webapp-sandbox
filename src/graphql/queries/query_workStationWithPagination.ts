import gql from "graphql-tag";

export default gql`
	query workStationWithPagination($where: WorkStationWhereInput, $limit: Int, $offset: Int) {
		workStationWithPagination(where: $where, limit: $limit, offset: $offset) {
			data {
				id
				name
				warehouseId
				agencyId
			}
		}
	}
`;
