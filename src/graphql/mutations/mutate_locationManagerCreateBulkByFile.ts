import gql from "graphql-tag";

export default gql`
	mutation locationManagerCreateBulkByFile($created: LocationManageBulkCreateByFileInput!) {
		locationManagerCreateBulkByFile(created: $created) {
			message
			success
			data {
				code
				error
				name
				type
			}
			meta {
				failed
				success
				total
			}
		}
	}
`;
