import gql from "graphql-tag";

export default gql`
	mutation processingListCreatePickStepBulk($ids: [Int!]!) {
		processingListCreatePickStepBulk(ids: $ids) {
			data {
				success
				message
				errors {
					id
					message
				}
			}
		}
	}
`;
