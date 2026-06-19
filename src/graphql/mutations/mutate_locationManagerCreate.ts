import gql from "graphql-tag";

export default gql`
	mutation locationManagerCreate($created: LocationManageCreateInput!) {
		locationManagerCreate(created: $created) {
			message
			success
		}
	}
`;
