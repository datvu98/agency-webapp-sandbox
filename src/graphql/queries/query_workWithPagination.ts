import gql from "graphql-tag";

export default gql`
	query workWithPagination($limit: Int, $offset: Int, $orderBy: WorkOrderByInput, $where: WorkWhereInput) {
		workWithPagination(limit: $limit, offset: $offset, orderBy: $orderBy, where: $where) {
			message
			success
			data {
				id
				code
				createdAt
				deletedAt
				status
				target
				targetId
				type
				agencyId
				checkInAt
				checkOutAt
			}
		}
	}
`;
