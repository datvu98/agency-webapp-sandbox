import gql from "graphql-tag";

export default gql`
	query processingListListWithPagination($limit: Int, $offset: Int, $where: ProcessingListWhereInput) {
		processingListListWithPagination(limit: $limit, offset: $offset, where: $where) {
			data {
				agencyId
				code
				createdAt
				createdById
				deletedAt
				id
				items {
					agencyId
					createdAt
					deletedAt
					id
					processingListId
					updatedAt
					warehouseBillId
				}
				note
				picId
				picType
				smeIds
				status
				totalItems
				type
				updatedAt
				warehouseId
			}
			meta {
				pageNumber
				pageSize
				totalItems
				totalPages
			}
			message
			success
		}
	}
`;
