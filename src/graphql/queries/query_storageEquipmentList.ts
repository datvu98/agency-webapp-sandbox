import gql from "graphql-tag";

export default gql`
	query storageEquipmentList(
		$warehouseId: Int
		$searchs: [String!]
		$searchFields: [String!]
		$pageSize: Int
		$pageNumber: Int
		$isActive: Boolean
		$containerType_in: [String!]
		$deviceType_in: [String!]
		$ids: [Int]
	) {
		storageEquipmentList(
			containerType_in: $containerType_in
			deviceType_in: $deviceType_in
			isActive: $isActive
			pageNumber: $pageNumber
			pageSize: $pageSize
			searchFields: $searchFields
			searchs: $searchs
			warehouseId: $warehouseId
			ids: $ids
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
				code
				containerType
				createdAt
				deletedAt
				deviceType
				height
				id
				isActive
				length
				maxCapacity
				name
				updatedAt
				usageCapacity
				usageCapacityRatio
				warehouseId
				width
				locationScore
			}
		}
	}
`;
