import gql from "graphql-tag";

export default gql`
	query agencyListInventoryItems(
		$brandIds: [Int]
		$isProductStatus: Int
		$limit: Int
		$offset: Int
		$orderBy: String
		$productStatusIds: [Int]
		$search: String
		$smeIds: [Int]
		$sort: String
		$status: String
		$types: [String]
		$warehouseIds: [Int]
	) {
		agencyListInventoryItems(
			brandIds: $brandIds
			isProductStatus: $isProductStatus
			limit: $limit
			offset: $offset
			orderBy: $orderBy
			productStatusIds: $productStatusIds
			search: $search
			smeIds: $smeIds
			sort: $sort
			status: $status
			types: $types
			warehouseIds: $warehouseIds
		) {
			message
			success
			meta {
				near_out_stock
				out_stock
				preallocate
				stocking
				total
				total_inventory_quantity
				total_inventory_value
			}
			data {
				product_id
				sme_store_id
				stock_actual
				stock_allocated
				stock_available
				stock_preallocate
				stock_reserve
				stock_shipping
				variant_id
				sme_id
			}
		}
	}
`;
