import gql from 'graphql-tag';

export default gql`
  mutation startHandover($warehouseBillId: Int!) {
    startHandover(warehouseBillId: $warehouseBillId) {
      data {
        id
        workId
        work {
          targetId
        }
      }
      message
      success
    }
  }
`;
