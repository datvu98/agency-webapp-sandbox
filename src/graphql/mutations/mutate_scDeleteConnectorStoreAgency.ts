import gql from "graphql-tag";

export default gql`
    mutation scDeleteConnectorStoreAgency($id: Int!) {
        scDeleteConnectorStoreAgency(id: $id) {
            message
            success
        }
    }
`;
