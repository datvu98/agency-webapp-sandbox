import { Flex, Skeleton } from "antd";
import React from "react";
import styled from "styled-components";

const LoadingConversationWrapper = styled(Flex)`
    .loading-item {
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        padding: 15px 20px;
    }
`

const LoadingConversation = () => {
    return (
        <LoadingConversationWrapper vertical>
            {Array.from({ length: 6 }).map((_item, index: number) => <div className="loading-item" key={index}>
                <Skeleton
                    avatar
                    active
                    title={false}
                    paragraph={{ rows: 2 }}
                />
            </div>)}
        </LoadingConversationWrapper>
    )
}

export default LoadingConversation;