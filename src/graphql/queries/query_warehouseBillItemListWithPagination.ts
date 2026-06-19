import gql from "graphql-tag";

export default gql`
	query warehouseBillItemListWithPagination($limit: Int, $offset: Int, $orderBy: SmeWarehouseBillOrderByInput, $where: SmeWarehouseBillItemWhereInput) {
		warehouseBillItemListWithPagination(limit: $limit, offset: $offset, orderBy: $orderBy, where: $where) {
			message
			success
			meta {
				pageNumber
				pageSize
				totalItems
				totalPages
			}
			data {
				createdAt
				discountType
				discountValue
				id
				expiredInfo {
					expiredDate
					lotSerial
					manufactureDate
				}
				isIncludeStockPreallocate
				keyUnique
				maxQuantity
				note
				orderItemTransactionId
				parentVariantId
				price
				priority
				productId
				quantity
				quantityPlan
				variantId
				warehouseBillId
				updatedAt
				smeId
			}
		}
	}
`;
