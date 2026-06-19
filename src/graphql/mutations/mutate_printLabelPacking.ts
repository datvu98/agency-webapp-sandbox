import gql from "graphql-tag";

export default gql`
	mutation printLabelPacking($warehouseBillId: Int!, $workSessionId: Int!) {
		printLabelPacking(warehouseBillId: $warehouseBillId, workSessionId: $workSessionId) {
			message
			success
			data
		}
	}
`;
