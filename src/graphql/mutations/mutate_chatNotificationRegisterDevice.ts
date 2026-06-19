import gql from 'graphql-tag';

export default gql`
    mutation chatNotificationRegisterDevice($deviceId: String!) {
        chatNotificationRegisterDevice(deviceId: $deviceId) {
            message
            success
        }
    }
`;
