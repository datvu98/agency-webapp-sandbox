import gql from "graphql-tag";

export default gql`
	query workSessionWithPagination($orderBy: WorkSessionOrderByInput, $limit: Int, $offset: Int, $where: WorkSessionWhereInput) {
		workSessionWithPagination(limit: $limit, offset: $offset, orderBy: $orderBy, where: $where) {
			message
			success
			data {
				agencyId
				createdAt
				deletedAt
				endedAt
				id
				picId
				picType
				startedAt
				status
				updatedAt
				workId
				devices {
					id
					storageEquipmentId
					updatedAt
					usedAt
					workSessionId
					createdAt
					deletedAt
					removedAt
					totalQuantity
					totalVariants
				}
				items {
					action
					expiredAt
					id
					lotNumber
					manufactureAt
					productId
					quantity
					remainingQuantity
					status
					storageEquipmentId
					variantId
					warehouseBillId
				}
				totalQuantity
				totalVariants
			}
		}
	}
`;
