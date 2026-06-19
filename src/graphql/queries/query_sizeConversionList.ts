import gql from "graphql-tag";

export default gql`
	query sizeConversionList($warehouseId: Int) {
		sizeConversionList(warehouseId: $warehouseId) {
			message
			success
			data {
				code
				createdAt
				deletedAt
				id
				radio
				updatedAt
				warehouseId
			}
		}
	}
`;
