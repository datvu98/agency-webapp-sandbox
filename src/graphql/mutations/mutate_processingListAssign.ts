import gql from "graphql-tag";

export default gql`
	mutation processingListAssign($picId: Int!, $id: Int!, $picType: Int!) {
		processingListAssign(id: $id, picId: $picId, picType: $picType) {
			message
			success
		}
	}
`;
