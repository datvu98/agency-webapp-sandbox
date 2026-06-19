import gql from "graphql-tag";

export default gql`
	mutation processingListCancel($id: Int!) {
		processingListCancel(id: $id) {
			message
			success
		}
	}
`;
