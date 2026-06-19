import gql from "graphql-tag";

export default gql`
	query locationManagerList(
		$areaId_in: [Int]
		$isActive: Boolean
		$levelId_in: [Int]
		$pageNumber: Int
		$pageSize: Int
		$rackId_in: [Int]
		$searchs: [String]
		$searchFields: [String!]
		$type: String
		$warehouseId: Int
		$priority: Int
		$usageCapacityRatio_gte: Int
		$usageCapacityRatio_lt: Int
		$priority_in: [Int!]
	) {
		locationManagerList(
			areaId_in: $areaId_in
			priority: $priority
			isActive: $isActive
			levelId_in: $levelId_in
			pageNumber: $pageNumber
			pageSize: $pageSize
			rackId_in: $rackId_in
			searchs: $searchs
			searchFields: $searchFields
			type: $type
			warehouseId: $warehouseId
			usageCapacityRatio_lt: $usageCapacityRatio_lt
			usageCapacityRatio_gte: $usageCapacityRatio_gte
			priority_in: $priority_in
		) {
			message
			success
			meta {
				pageNumber
				pageSize
				totalItems
				totalPages
			}
			data {
				area {
					code
					createdAt
					deletedAt
					id
					isActive
					name
					priority
					type
					updatedAt
					warehouseId
				}
				code
				createdAt
				deletedAt
				id
				isActive
				name
				priority
				storageEquipment {
					usageCapacityRatio
					length
					width
					height
					maxCapacity
				}
				level {
					code
					createdAt
					deletedAt
					id
					isActive
					name
					priority
					type
					updatedAt
					warehouseId
				}
				rack {
					code
					createdAt
					deletedAt
					id
					isActive
					name
					priority
					type
					updatedAt
					warehouseId
				}
				aisle {
					code
					createdAt
					deletedAt
					id
					isActive
					name
					priority
					type
					updatedAt
					warehouseId
				}
				type
				updatedAt
				warehouseId
			}
		}
	}
`;
