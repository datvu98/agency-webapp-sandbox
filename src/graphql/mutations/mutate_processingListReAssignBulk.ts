import gql from "graphql-tag";

export default gql`
	mutation processingListReAssignBulk($ids: [Int!]!, $picId: Int!, $picType: Int!) {
		processingListReAssignBulk(ids: $ids, picId: $picId, picType: $picType) {
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
