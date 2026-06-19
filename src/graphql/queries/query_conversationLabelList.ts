import gql from 'graphql-tag';

export default gql`
    query conversationLabelList($page: Int, $pageSize: Int, $smeId: Int!) {
        conversationLabelList(page: $page, pageSize: $pageSize, smeId: $smeId) {
            items {
                color
                id
                title
                smeId
            }
            message
            page
            pageSize
            success
            totalPages        
        } 
    }
`;
