import gql from "graphql-tag";

export default gql`
	mutation printLabelPackingTemp($warehouseBillId: Int!, $workSessionId: Int!) {
		printLabelPackingTemp(warehouseBillId: $warehouseBillId, workSessionId: $workSessionId) {
			data
			message
			success
		}
	}
`;
