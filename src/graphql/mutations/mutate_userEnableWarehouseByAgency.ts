import gql from "graphql-tag";

export default gql`
	mutation userEnableWarehouseByAgency($id: Int!, $isEnable: Boolean!) {
		userEnableWarehouseByAgency(id: $id, isEnable: $isEnable) {
			message
			success
		}
	}
`;
