import gql from "graphql-tag";

export default gql`
	query getLastWorkStationByCurrentUser {
		getLastWorkStationByCurrentUser {
			data {
				agencyId
				createdAt
				deletedAt
				id
				name
				updatedAt
				warehouseId
			}
		}
	}
`;
