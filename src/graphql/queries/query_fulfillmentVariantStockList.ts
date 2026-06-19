import gql from "graphql-tag";

export default gql`
	query fulfillmentVariantStockList(
		$brandId: Int
		$fulfillmentWarehouseId: Int!
		$isExpiredDate: Boolean
		$pageNumber: Int
		$pageSize: Int
		$productStatusCode: String
		$search: String
		$variantName: String
		$smeId: Int
	) {
		fulfillmentVariantStockList(
			fulfillmentWarehouseId: $fulfillmentWarehouseId
			brandId: $brandId
			isExpiredDate: $isExpiredDate
			pageNumber: $pageNumber
			pageSize: $pageSize
			productStatusCode: $productStatusCode
			search: $search
			variantName: $variantName
			smeId: $smeId
		) {
			data {
				assetUrl
				brandId
				gtin
				isExpiredDate
				productId
				productStatusCode
				sku
				stockActual
				stockAllocated
				stockAvailable
				stockFloating
				stockPrePurchaseOrder
				stockPreallocate
				stockReserve
				stockReturning
				stockShipping
				stockSync
				unit
				variantId
				variantName
			}
		}
	}
`;
