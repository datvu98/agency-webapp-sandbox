import gql from "graphql-tag";

export default gql`
	mutation completePacking($workSessionId: Int!) {
		completePacking(workSessionId: $workSessionId) {
			message
			success
		}
	}
`;
