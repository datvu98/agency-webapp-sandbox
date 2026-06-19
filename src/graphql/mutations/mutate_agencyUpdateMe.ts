import gql from 'graphql-tag';

export default gql`
  mutation agencyUpdateMe($agencyUpdateMeInput: AgencyUpdateMeInput!) {
  agencyUpdateMe(agencyUpdateMeInput: $agencyUpdateMeInput) {
    message
    success
  }
}
`;
