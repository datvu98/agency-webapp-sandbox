import gql from "graphql-tag";

export default gql`
	mutation inventoryCountingUpdateNote($input: InventoryCountingUpdateNoteInput!) {
		inventoryCountingUpdateNote(input: $input) {
			message
			success
		}
	}
`;
