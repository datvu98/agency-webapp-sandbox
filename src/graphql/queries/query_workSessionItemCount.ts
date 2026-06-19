import gql from "graphql-tag";

export default gql`
	query workSessionItemCount($where: WorkSessionItemWhereInput) {
		workSessionItemCount(where: $where) {
			data
			message
			success
		}
	}
`;
