import gql from "graphql-tag";

export default gql`
	mutation reportMissingItemPacking($workSessionId: Int!, $workSessionItemId: Int) {
		reportMissingItemPacking(workSessionId: $workSessionId, workSessionItemId: $workSessionItemId) {
			message
			success
		}
	}
`;
