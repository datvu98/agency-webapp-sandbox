import gql from "graphql-tag";

export default gql`
    mutation affTriggerSingleVideoSyncByRefId($creatorId: Int!) {
        affTriggerSingleVideoSyncByRefId(creatorId: $creatorId) {
            message
            success
            data {
              status
              syncTaskId
              totalCount
            }
        }
    }
`;
