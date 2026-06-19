import gql from "graphql-tag";

export default gql`
    query op_smes {
        op_smes {
            email
            id
            name
            owner_id
            phone
            status
        }
    }
`;
