import gql from "graphql-tag";

export default gql`
	query listReturnReceipts($limit: Int, $offset: Int, $orderBy: ReturnReceiptOrderByInput, $where: ReturnReceiptWhereInput) {
		listReturnReceipts(limit: $limit, offset: $offset, orderBy: $orderBy, where: $where) {
			message
			success
			data {
				agencyId
				code
				createdAt
				deletedAt
				id
				shippingCarrier
				shippingCarrierCode
				totalItems
				status
				updatedAt
				warehouseId
			}
			meta {
				pageNumber
				pageSize
				totalItems
				totalPages
			}
		}
	}
`;
