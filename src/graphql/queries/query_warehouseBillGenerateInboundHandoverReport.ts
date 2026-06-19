import gql from "graphql-tag";

export default gql`
	query warehouseBillGenerateInboundHandoverReport($id: Int!) {
		warehouseBillGenerateInboundHandoverReport(id: $id) {
			data
			message
			success
		}
	}
`;
