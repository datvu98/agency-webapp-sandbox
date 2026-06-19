import gql from "graphql-tag";

export default gql`
	query warehouseBillIsSioCount($where: SmeWarehouseBillWhereInput) {
		warehouseBillIsSioCount(where: $where) {
			message
			success
			data {
				mio
				pst
				sio
			}
		}
	}
`;
