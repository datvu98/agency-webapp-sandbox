import gql from "graphql-tag";

export default gql`
	mutation userSetDefaultWarehouseByAgency($id: Int!) {
		userSetDefaultWarehouseByAgency(id: $id) {
			message
			success
		}
	}
`;
