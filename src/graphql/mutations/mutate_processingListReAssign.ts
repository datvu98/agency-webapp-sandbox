import gql from "graphql-tag";

export default gql`
	mutation processingListReAssign($id: Int!, $picId: Int!, $picType: Int!) {
		processingListReAssign(id: $id, picId: $picId, picType: $picType) {
			message
			success
		}
	}
`;
