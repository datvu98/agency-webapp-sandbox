import gql from "graphql-tag";

export default gql`
	mutation warehouseBillComplete($id: Int!) {
		warehouseBillComplete(id: $id) {
			message
			success
		}
	}
`;
