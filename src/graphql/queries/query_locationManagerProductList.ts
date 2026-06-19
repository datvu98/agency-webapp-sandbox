import gql from "graphql-tag";
export default gql`
	query locationManagerProductList($id: Int!) {
		locationManagerProductList(id: $id) {
			data {
				expiredAt
				stockActual
				variantId
			}
			message
			success
			meta {
				pageNumber
				pageSize
				totalItems
				totalPages
			}
		}
	}
`;
