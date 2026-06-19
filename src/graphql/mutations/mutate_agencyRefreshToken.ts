import gql from 'graphql-tag';

export default gql`
    mutation agencyRefreshToken($token: String!) {
        agencyRefreshToken(token: $token) {
            accessToken  
            refreshToken          
            message
            success            
        }
    }
`