import gql from "graphql-tag";

export default gql`
	mutation processingListCreatePickStep($id: Int!) {
		processingListCreatePickStep(id: $id) {
			message
			success
		}
	}
`;
