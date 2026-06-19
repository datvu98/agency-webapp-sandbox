import gql from "graphql-tag";

export default gql`
	mutation userUpdateWarehouseByAgency($userUpdateWarehouseInput: UserUpdateWarehouseInput!) {
		userUpdateWarehouseByAgency(userUpdateWarehouseInput: $userUpdateWarehouseInput) {
			message
			success
		}
	}
`;
