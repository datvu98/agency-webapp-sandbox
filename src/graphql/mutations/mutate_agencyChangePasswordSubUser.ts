import gql from 'graphql-tag';

export default gql`
  mutation agencyChangePasswordSubUser($agencyChangePasswordSubUserInput: AgencyChangePasswordSubUserInputInput!) {
    agencyChangePasswordSubUser(agencyChangePasswordSubUserInput: $agencyChangePasswordSubUserInput) {
      message
      success
    }
}
`;
