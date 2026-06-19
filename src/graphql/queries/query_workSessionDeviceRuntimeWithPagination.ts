import gql from "graphql-tag";

export default gql`
	query workSessionDeviceRuntimeWithPagination($where: WorkSessionDeviceRuntimeWhereInput, $limit: Int, $offset: Int) {
		workSessionDeviceRuntimeWithPagination(where: $where, limit: $limit, offset: $offset) {
			data {
				agencyId
				createdAt
				deletedAt
				id
				storageEquipmentId
				updatedAt
				workId
				workSessionId
			}
		}
	}
`;
