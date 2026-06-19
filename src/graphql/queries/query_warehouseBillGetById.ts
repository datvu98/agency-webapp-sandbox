import gql from "graphql-tag";

export default gql`
	query warehouseBillGetById($id: Int!) {
		warehouseBillGetById(id: $id) {
			message
			success
			data {
				warehouseId
				warehouseBillOrId
				vat
				updatedAt
				type
				brandId
				channelCode
				code
				createdAt
				customerAddress
				customerName
				estimatedDeliveryAt
				id
				note
				orderAt
				orderCode
				processedAt
				protocol
				purchaseOrderId
        productVariantStatus
        productType
				smeId
				relatedWarehouseBillId
				shipExpiredAt
				shippingCode
				shippingCarrier
				status
				storeName
				storeId
				totalQuantity
				totalQuantityPlan
				totalVariants
				smeWarehouseTransferId
				evidenceUrl
			}
		}
	}
`;
