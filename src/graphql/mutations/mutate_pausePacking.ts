import gql from "graphql-tag";

export default gql`
	mutation pausePacking($workSessionId: Int!) {
		pausePacking(workSessionId: $workSessionId) {
			message
			success
		}
	}
`;
