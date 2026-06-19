import gql from "graphql-tag";

export default gql`
	mutation locationManagerUpdate($updated: LocationManageUpdateInput!) {
		locationManagerUpdate(updated: $updated) {
			message
			success
		}
	}
`;
