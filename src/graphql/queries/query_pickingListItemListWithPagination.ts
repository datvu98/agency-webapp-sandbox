import gql from "graphql-tag";

export default gql`
	query pickingListItemListWithPagination($limit: Int, $offset: Int, $where: PickingListItemWhereInput) {
		pickingListItemListWithPagination(limit: $limit, offset: $offset, where: $where) {
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
				id
				pickingListId
				quantityNeeded
				quantityPicked
				status
				updatedAt
				variantId
			}
		}
	}
`;
