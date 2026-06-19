import gql from "graphql-tag";

export default gql`
    mutation vrDeleteCmsContract($id: Int!, $sme_id: Int!) {
        vrDeleteCmsContract(id: $id, sme_id: $sme_id) {
            message
            success
        }
    }
`;
