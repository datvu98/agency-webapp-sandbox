import gql from "graphql-tag";

export default gql`
	query warehouseBillPrintLabel($id: Int!) {
		warehouseBillPrintLabel(id: $id) {
			data
			message
			success
		}
	}
`;
