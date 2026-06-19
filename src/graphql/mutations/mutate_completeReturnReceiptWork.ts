import gql from "graphql-tag";

export default gql`
	mutation completeReturnReceiptWork($handoverListId: Int!, $workId: Int!) {
		completeReturnReceiptWork(workId: $workId, handoverListId: $handoverListId) {
			message
			success
		}
	}
`;
