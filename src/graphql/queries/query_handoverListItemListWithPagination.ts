import gql from "graphql-tag";

export default gql`
	query handoverListItemListWithPagination($where: HandoverListItemWhereInput, $orderBy: HandoverListItemOrderByInput, $limit: Int, $offset: Int) {
		handoverListItemListWithPagination(limit: $limit, offset: $offset, where: $where, orderBy: $orderBy) {
			data {
				warehouseBillId
				agencyId
				createdAt
				deletedAt
				handoverListId
				id
				status
				updatedAt
			}
			meta {
				totalItems
				totalPages
				pageNumber
				pageSize
			}
		}
	}
`;
