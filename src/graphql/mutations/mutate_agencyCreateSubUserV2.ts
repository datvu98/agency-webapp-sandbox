import gql from 'graphql-tag';

export default gql`
    mutation agencyCreateSubUserV2($userCreateSubUserInput: UserCreateSubUserInput = {}) {
        agencyCreateSubUserV2(userCreateSubUserInput: $userCreateSubUserInput) {
            accessToken
            id
            message
            success            
        }
    }
`