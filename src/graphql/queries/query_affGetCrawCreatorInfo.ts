import gql from 'graphql-tag';

export default gql`
  query affGetCrawCreatorInfo($creatorId: Int!) {
    affGetCrawCreatorInfo(creatorId: $creatorId) {
      message
      success
      data {
        avatarThumb
        createdAt
        deletedAt
        followerCount
        followingCount
        heartCount
        id
        nickname
        refCreatorChannelId
        secUid
        uniqueId
        updatedAt
        videoCount
      }
    }
  }
`;