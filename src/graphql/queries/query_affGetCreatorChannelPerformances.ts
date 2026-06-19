import gql from 'graphql-tag';

export default gql`
    query affGetCreatorChannelPerformances($ids: [Int!]!) {
        affGetCreatorChannelPerformances(ids: $ids) {
            message
            success
            data {
                items {
                    age18_24FollowerRate
                    age25_34FollowerRate
                    age35_44FollowerRate
                    age45_54FollowerRate
                    age55PlusFollowerRate
                    id
                    isGmvHiddenByCreator
                    avgEcVideoViewCount
                    avgEcVideoPlayCount
                    avgEcLiveViewCount
                    ecLiveCount
                    ecVideoCount
                    creatorChannelId
                    ecVideoEngagementRate
                    followerCount
                    followerGenderFemale
                    followerGenderMale
                    gmvAmount
                    gmvRange
                    unitsSold
                    creatorChannel {
                        id
                        ref_url
                    }
                    listCategories {
                        display_name
                        id
                        ref_id
                    }
                }
            }
        }
    }
`