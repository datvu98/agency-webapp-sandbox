import gql from "graphql-tag";

export default gql`
    mutation vrStopCmsContract(
        $id: Int!
        $note: String!
        $sme_id: Int!
    ) {
        vrStopCmsContract(
            id: $id
            note: $note
            sme_id: $sme_id
        ) {
            message
            success
            data {
                id
                title
                note
                status
                sme_id
                description
                begin_at
                end_at
                store_ids
                created_at
                updated_at
            }
        }
    }
`;
