import gql from "graphql-tag";

export default gql`
	query warehouseBillListWithPagination($where: SmeWarehouseBillWhereInput, $limit: Int, $offset: Int, $orderBy: SmeWarehouseBillOrderByInput) {
		warehouseBillListWithPagination(where: $where, limit: $limit, offset: $offset, orderBy: $orderBy) {
			message
			success
			meta {
				pageNumber
				pageSize
				totalItems
				totalPages
			}
			data {
				approvedBy
				approvedByName
				cancelAt
				canceledBy
				canceledByName
				channelCode
				code
				completedBy
				completedByName
				createdAt
				createdBy
				createdByName
				customerAddress
				customerName
				estimatedDeliveryAt
				fulfillmentStatus
				fulfillmentActorName
				id
				isSIO
				logisticCode
				note
				orderChangeDetail
				orderCode
				orderId
				orderStatus
				packStatus
				vat
				warehouseBillOrId
				labelUrl
				warehouseId
				updatedAt
				type
				trackingNumber
				totalQuantityPlan
				totalQuantity
				totalVariants
				systemPackageNumber
				storeName
				storeId
				status
				smeWarehouseTransferId
				purchaseOrderId
				smeId
				brandId
				shippingCode
				shippedAt
				shippingCarrier
				shipExpiredAt
				relatedWarehouseBillId
				providerStatusCode
				providerSourceId
				protocol
				productVariantStatus
				productType
				processedAt
				printedDate
				packageNumber
				orderSource
				warehouseBillItems {
					inventoryLocations {
						storageEquipmentId
					}
				}
			}
		}
	}
`;
