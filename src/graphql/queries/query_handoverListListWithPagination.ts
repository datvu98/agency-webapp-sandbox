import gql from "graphql-tag";

export default gql`
	query handoverListListWithPagination($limit: Int, $offset: Int, $orderBy: HandoverListOrderByInput, $where: HandoverListWhereInput) {
		handoverListListWithPagination(limit: $limit, offset: $offset, orderBy: $orderBy, where: $where) {
			data {
				agencyId
				code
				createdAt
				deletedAt
				handoverAt
				id
				note
				picId
				picType
				shippingCarrier
				shippingCarrierCode
				status
				totalItems
				updatedAt
				warehouseId
				isAbnormal
			}
			meta {
				pageNumber
				pageSize
				totalItems
				totalPages
			}
		}
	}
`;
