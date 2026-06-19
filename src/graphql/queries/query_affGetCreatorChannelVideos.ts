import gql from 'graphql-tag';

export default gql`
  query affGetCreatorChannelVideos($input: CreatorChannelVideosInput!) {
    affGetCreatorChannelVideos(input: $input) {
      code
      message
      success
      meta {
        pageNumber
        pageSize
        totalItems
        totalPages
      }
      data {
        collectCount
        commentCount
        coverUrl
        desc
        diggCount
        dynamicCoverUrl
        hashtags
        id
        isAd
        music
        playCount
        products
        refVideoId
        shareCount
        title
        videoUrl
      }
    }
  }
`;