import gql from 'graphql-tag';

export default gql`
  mutation agencyChangePassword($newPassword: String!, $oldPassword: String!) {
    agencyChangePassword(newPassword: $newPassword, oldPassword: $oldPassword) {
      message
      success
    }
}
`;
