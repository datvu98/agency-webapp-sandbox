import gql from "graphql-tag";

export default gql`
	mutation processingListAssignBulk($ids: [Int!]!, $picId: Int!, $picType: Int!) {
		processingListAssignBulk(ids: $ids, picId: $picId, picType: $picType) {
			data {
				message
				success
				errors {
					id
					message
				}
			}
		}
	}
`;
