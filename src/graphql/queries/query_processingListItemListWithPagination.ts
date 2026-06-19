import gql from "graphql-tag";

export default gql`
	query processingListItemListWithPagination($where: ProcessingListItemWhereInput, $limit: Int, $offset: Int, $orderBy: ProcessingListItemOrderInput) {
		processingListItemListWithPagination(limit: $limit, offset: $offset, where: $where, orderBy: $orderBy) {
			message
			success
			meta {
				pageNumber
				pageSize
				totalItems
				totalPages
			}
			data {
				agencyId
				createdAt
				deletedAt
				packedAt
				id
				processingListId
				updatedAt
				warehouseBillId
			}
		}
	}
`;
