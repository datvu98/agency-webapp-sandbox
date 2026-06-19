import gql from 'graphql-tag';

export default gql`
    mutation chatNotificationUnregisterDevice($deviceId: String!) {
        chatNotificationUnregisterDevice(deviceId: $deviceId) {
            message
            success
        }
    }
`;
