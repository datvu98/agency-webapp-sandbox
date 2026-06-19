import gql from 'graphql-tag';

export default gql`
  query agencyGetSme {
    agencyGetSme {
      avatar_url
      business_model
      email
      full_name
      id
      phone
      sme_id
      status
  }
}
`;
