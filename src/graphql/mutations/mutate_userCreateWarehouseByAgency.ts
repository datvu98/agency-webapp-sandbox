import gql from "graphql-tag";

export default gql`
	mutation userCreateWarehouseByAgency($userCreateWarehouseInput: UserCreateWarehouseInput!) {
		userCreateWarehouseByAgency(userCreateWarehouseInput: $userCreateWarehouseInput) {
			message
			success
		}
	}
`;
