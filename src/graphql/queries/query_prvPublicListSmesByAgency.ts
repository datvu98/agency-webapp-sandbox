import gql from 'graphql-tag';

export default gql`
  query prvPublicListSmesByAgency($page: Int!, $per_page: Int!) {
  prvPublicListSmesByAgency(page: $page, per_page: $per_page) {
    data {
      id
      sme_id
      status
      last_connected_at
    }
    message
    total
  }
}


`;
