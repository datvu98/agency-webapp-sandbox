import gql from "graphql-tag";

export default gql`
	mutation agencyRequestExportInventoryItems(
		$warehouseIds: [Int]
		$types: [String]
		$status: String
		$sort: String
		$smeIds: [Int]
		$search: String
		$productStatusIds: [Int]
		$orderBy: String
		$isProductStatus: Int
		$brandIds: [Int]
	) {
		agencyRequestExportInventoryItems(
			brandIds: $brandIds
			isProductStatus: $isProductStatus
			orderBy: $orderBy
			productStatusIds: $productStatusIds
			search: $search
			smeIds: $smeIds
			sort: $sort
			status: $status
			types: $types
			warehouseIds: $warehouseIds
		) {
			data
			message
			success
		}
	}
`;
