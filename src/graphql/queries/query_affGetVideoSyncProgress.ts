import gql from 'graphql-tag';

export default gql`
  query affGetVideoSyncProgressOfChannel(
    $syncTaskId: String
    $creatorId: Int!
  ) {
    affGetVideoSyncProgressOfChannel(
      syncTaskId: $syncTaskId
      creatorId: $creatorId
    ) {
      message
      success
      data {
        completedCount
        error
        failedCount
        percentage
        status
        syncTaskId
        totalCount
        username
      }
    }
  }
`;