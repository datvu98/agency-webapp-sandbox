import gql from "graphql-tag";

export default gql`
	query quantityProgressPacking($workSessionId: Int!) {
		quantityProgressPacking(workSessionId: $workSessionId) {
			data {
				totalQuantityPacked
				totalQuantityPacking
			}
		}
	}
`;
