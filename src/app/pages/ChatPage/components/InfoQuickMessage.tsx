import { useMutation, useQuery } from "@apollo/client";
import { Button, Col, Divider, Empty, Flex, Input, Row, Select, Spin, Tooltip, Typography } from "antd";
import mutation_conversationSendMessage from "graphql/mutations/mutation_conversationSendMessage";
import React, { Fragment, memo, useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { selectCurrentConverstation } from "../slice/selectors";
import { useChatSliceSlice } from "../slice";
import { showAlert } from "utils/helper";
import query_chatTplMessageGroups from "graphql/queries/query_chatTplMessageGroups";
import mutate_conversationSendMessageV2 from "graphql/mutations/mutate_conversationSendMessageV2";
import { useLayoutContext } from "app/contexts/LayoutContext";
import { hasPermissionAction } from "utils/helper";

const InfoQuickMessageWrapper = styled(Flex)`
    .search-wrapper {
        margin: 20px;        

        .input-wrapper {
            padding-left: 20px;

            .ant-input {
                height: 35px;
            }
        }

        .ant-btn {
            height: 35px;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #fef6f0;
        }
    }

    .ant-divider-horizontal {
        margin: 15px 0px;
    }

    .virtual-list-message {
        .rc-virtual-list-holder-inner {
            padding: 0px 20px;
        }
    }
`;

const { Search } = Input;
const { Paragraph } = Typography;

const MAX_GROUP_MESSAGES = 25;
const MAX_MESSAGE_IN_GROUP = 10;

const InfoQuickMessage = () => {
    const { actions } = useChatSliceSlice();
    const dispatch = useDispatch();
    const currentConversation = useSelector(selectCurrentConverstation);
    const { messageListReferance } = useLayoutContext();
    const [search, setSearch] = useState<any>({
        group: null,
        text: ''
    });
    const [optionsGroup, setOptionsGroup] = useState<any>(null);
    const [messagesFiltered, setMessagesFiltered] = useState<any>([]);

    const { data: dataChatTplMessage, loading: loadingChatTplMessage } = useQuery(query_chatTplMessageGroups, {
        variables: {
            page: 1,
            pageSize: MAX_GROUP_MESSAGES,
            storeId: currentConversation?.conversationStoreId
        }
    });

    const [sendProduct] = useMutation(mutate_conversationSendMessageV2, {
        awaitRefetchQueries: true,
        refetchQueries: ['messageList']
    });

    useMemo(() => {
        setOptionsGroup(dataChatTplMessage?.chatTplMessageGroups?.items?.map(item => ({
            value: item?.id,
            label: item?.name
        })))

        setMessagesFiltered(dataChatTplMessage?.chatTplMessageGroups?.items?.flatMap(item => item?.messages));
    }, [dataChatTplMessage]);

    useMemo(() => {
        const messagesOrigin = dataChatTplMessage?.chatTplMessageGroups?.items?.flatMap(item => item?.messages);

        if (search?.group) {
            const messageGroup = dataChatTplMessage?.chatTplMessageGroups?.items?.find(item => item?.id == search?.group);
            setMessagesFiltered(messageGroup?.messages?.filter(item => item?.includes(search?.text)))
        } else {
            setMessagesFiltered(messagesOrigin?.filter(item => item?.includes(search?.text)))
        }
    }, [dataChatTplMessage, search]);

    const onSendProduct = useCallback(async (value) => {
        try {
            const { data } = await sendProduct({
                variables: {
                    conversationId: currentConversation?.id,
                    medias: [],
                    message: value || "",
                    items: []
                }
            })

            if (data?.conversationSendMessageV2?.success) {
                const newConversation = {
                    ...currentConversation,
                    lastMessageType: "text",
                    lastMessage: value
                }
                messageListReferance.current?.scrollTo({
                    index: 9999,
                    behavior: 'smooth',
                });
                dispatch(actions.updateConversation(newConversation));
                dispatch(actions.appendMessage(data?.conversationSendMessageV2?.items))
            } else {
                showAlert.error("Phản hồi tin nhắn thất bại")
            }
        } catch (error) {
            showAlert.error('Có lỗi xảy ra, xin vui lòng thử lại')
        }
    }, [currentConversation]);

    return <InfoQuickMessageWrapper vertical>
        <Flex className="search-wrapper">
            <Row className="w-100" justify="space-between" align="middle">
                <Col span={8}>
                    <Select
                        className="select-base w-100"
                        placeholder="Chọn nhóm"
                        options={optionsGroup}
                        onChange={(value) => {
                            setSearch(prev => ({
                                ...prev,
                                group: value || null
                            }))
                        }}
                        allowClear
                    />
                </Col>
                <Col span={16}>
                    <Search
                        className="input-wrapper"
                        placeholder="Tìm kiếm tin nhắn nhanh"
                        onBlur={(e) => {
                            setSearch(prev => ({
                                ...prev,
                                text: e?.target?.value || ''
                            }))
                        }}
                        onSearch={(value) => {
                            setSearch(prev => ({
                                ...prev,
                                text: value || ''
                            }))
                        }}
                    />
                </Col>
            </Row>
        </Flex>
        <Spin spinning={loadingChatTplMessage}>
            {messagesFiltered?.length > 0 && <Flex
                vertical
                style={{ maxHeight: 'calc(100vh - 250px)', overflow: 'scroll' }}
            >
                {messagesFiltered?.map(mess => {
                    return <div style={{ margin: '0px 20px' }}>
                        <Flex justify="space-between" align="center" gap={10}>
                            {/* <div dangerouslySetInnerHTML={{
                                __html: mess?.replaceAll('\n', '<br />')
                            }}></div> */}
                            <Tooltip placement="bottom" title={mess}>
                                <Paragraph className="text-paragraph" ellipsis={{ rows: 2 }}>
                                    {mess}
                                </Paragraph>
                            </Tooltip>
                            <Button
                                type="primary"
                                onClick={() => onSendProduct(mess)}
                                disabled={!hasPermissionAction(['customer_service_chat_action'])}
                            >
                                Gửi
                            </Button>
                        </Flex>
                        <Divider />
                    </div>
                })}
            </Flex>}
            {messagesFiltered?.length == 0 && <Flex style={{ marginTop: '30%' }} justify="center">
                <Empty description="Chưa có tin nhắn nhanh" />
            </Flex>}
        </Spin>
    </InfoQuickMessageWrapper>
};

export default memo(InfoQuickMessage);