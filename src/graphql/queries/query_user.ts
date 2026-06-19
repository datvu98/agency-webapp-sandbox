import gql from 'graphql-tag';

export default gql`
  query agencyMe {
    agencyMe {
      agencyId
      avatar_url
      business_model
      email
      full_name
      id
      is_subuser
      permissions
      phone
      roles
      sme_id
      smes
      category_code
    }
  }
`;
