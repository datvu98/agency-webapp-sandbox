import gql from "graphql-tag";

export default gql`
	mutation agencyRetryExportInventoryItems($id: Int!) {
		agencyRetryExportInventoryItems(id: $id) {
			data
			message
			success
		}
	}
`;
