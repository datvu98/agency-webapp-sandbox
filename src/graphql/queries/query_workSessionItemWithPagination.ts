import gql from "graphql-tag";

export default gql`
	query workSessionItemWithPagination($orderBy: WorkSessionItemOrderByInput, $where: WorkSessionItemWhereInput, $limit: Int, $offset: Int) {
		workSessionItemWithPagination(limit: $limit, offset: $offset, orderBy: $orderBy, where: $where) {
			data {
				action
				expiredAt
				id
				lotNumber
				manufactureAt
				productId
				quantity
				storageEquipmentId
				variantId
				workId
				workSessionId
        remainingQuantity
        warehouseBillId
        status
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
