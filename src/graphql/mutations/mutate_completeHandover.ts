import gql from "graphql-tag";

export default gql`
	mutation completeHandover($workSessionId: Int!) {
		completeHandover(workSessionId: $workSessionId) {
			message
			success
		}
	}
`;
