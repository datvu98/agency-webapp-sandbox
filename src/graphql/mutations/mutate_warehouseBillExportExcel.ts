import gql from "graphql-tag";

export default gql`
	mutation warehouseBillExportExcel($where: SmeWarehouseBillWhereInput, $orderBy: SmeWarehouseBillOrderByInput) {
		warehouseBillExportExcel(where: $where, orderBy: $orderBy) {
			data
			message
			success
		}
	}
`;
