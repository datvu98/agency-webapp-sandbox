/*
 * Created by duydatpham@gmail.com on 29/05/2023
 * Copyright (c) 2023 duydatpham@gmail.com
 */
import {
    MenuUnfoldOutlined, PlusOutlined,
    UserOutlined
} from '@ant-design/icons';
import { useMutation } from '@apollo/client';
import { Avatar, Button, Col, Divider, Empty, Flex, List, Row, Spin, Tag, Tooltip, Typography } from "antd";
import client from 'apollo';
import ChatInput from 'app/components/ChatInput';
import MessageBox from 'app/components/MessageBox/MessageBox';
import { SocketContext } from 'app/contexts/SocketContext';
import { selectGlobalSlice } from 'app/slice/selectors';
import dayjs from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import mutate_conversationLabelAdd from 'graphql/mutations/mutate_conversationLabelAdd';
import mutate_conversationLabelRemove from 'graphql/mutations/mutate_conversationLabelRemove';
import mutate_conversationSendMessageV2 from 'graphql/mutations/mutate_conversationSendMessageV2';
import query_messageList from 'graphql/queries/query_messageList';
import VirtualList from 'rc-virtual-list';
import React, { Fragment, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showAlert } from 'utils/helper';
import ModalAddConversationLabel from '../components/ModalAddConversationLabel';
import { useChatSliceSlice } from '../slice';
import { selectCurrentConverstation, selectMessages } from "../slice/selectors";
import { useLayoutContext } from 'app/contexts/LayoutContext';
import { hasPermissionAction } from 'utils/helper';

dayjs.locale('vi');
dayjs.extend(updateLocale)
dayjs.updateLocale('en', {
    relativeTime: {
        future: "%s",
        past: "%s trước",
        s: 'vài giây',
        m: "1 phút",
        mm: "%d phút",
        h: "1 giờ",
        hh: "%d giờ",
        d: "1 ngày",
        dd: "%d ngày",
        M: "1 tháng",
        MM: "%d tháng",
        y: "1 năm",
        yy: "%d năm",
    }
});

interface IContentHeight {
    viewPort: number,
    headerHeight: number,
    titleHeight: number,
    toolbarHeight: number
};

const MAX_LABEL_IN_CONVERSATION = 5;

export default memo(({ expandInfo, onExpandInfo }: { expandInfo: boolean, onExpandInfo: () => void }) => {
    const dispatch = useDispatch();
    const { actions } = useChatSliceSlice()
    const { messageListReferance } = useLayoutContext();
    const editorChatRef = useRef<any>(null);
    const refDivBottom = useRef<any>(null);

    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [openAddLabelConversation, setOpenAddLabelConversation] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [contentHeight, setContentHeight] = useState<IContentHeight>({
        viewPort: 100,
        headerHeight: 64,
        titleHeight: 56,
        toolbarHeight: 0
    });
    const [isRefSet, setIsRefSet] = useState<boolean>(true);
    const [smeId, setSmeId] = useState()
    const currentConversation = useSelector(selectCurrentConverstation)
    const messages = useSelector(selectMessages);
    const { dataConversationLabel } = useLayoutContext();

    const [mutate] = useMutation(mutate_conversationSendMessageV2, {
        awaitRefetchQueries: true,
        refetchQueries: ['messageList']
    });

    const [mutateRemoveTag, { loading: loadingRemoveTag }] = useMutation(mutate_conversationLabelRemove);

    const [addConversationLabel, { loading: loadingAddConversation }] = useMutation(mutate_conversationLabelAdd);

    // Reset when select conversation
    useMemo(() => {
        setPage(1);
        setHasMore(true);
        setIsRefSet(true);
    }, [currentConversation]);

    // Auto loading to bottom when first render
    useEffect(() => {
        if (isRefSet) {
            messageListReferance.current?.scrollTo(Infinity);
        }

        let _timeout = setTimeout(() => {
            if (isRefSet) {
                messageListReferance.current?.scrollTo({
                    index: 9999,
                    behavior: 'smooth',
                });
            }
        }, 200);

        return () => {
            clearTimeout(_timeout)
        }
    }, [isRefSet, messageListReferance.current]);

    useMemo(() => {
        if (editorChatRef?.current) {
            setContentHeight((prev: IContentHeight) => ({
                ...prev, toolbarHeight: editorChatRef?.current?.clientHeight > 121 ? 121 : editorChatRef?.current?.clientHeight
            }));
        }
    }, [editorChatRef?.current]);

    const contentMessHeight = useMemo(() => {
        return window.innerHeight - contentHeight?.headerHeight - contentHeight?.titleHeight - (contentHeight?.toolbarHeight || 0) - 23
    }, [contentHeight, window.innerHeight]);

    const onAddConversationLabel = useCallback(async (ids) => {
        try {
            const { data } = await addConversationLabel({
                variables: {
                    ids,
                    conversationIds: [currentConversation?.id]
                }
            });

            const labelIdsPass = ids?.filter(id => !data?.conversationLabelAdd?.data?.errors?.includes(id));
            const labelPass = dataConversationLabel?.conversationLabelList?.items?.filter(item => labelIdsPass?.includes(item?.id));

            if (labelPass?.length > 0) {
                const newConversation = {
                    ...currentConversation,
                    labels: labelPass?.concat(currentConversation?.labels)
                }
                dispatch(actions.updateConversation(newConversation))
                dispatch(actions.updateCurrentConversation(newConversation))
            }

            setOpenAddLabelConversation(false);
            if (data?.conversationLabelAdd?.data?.errors?.length == 0) {
                showAlert.success('Gắn nhãn hội thoại thành công');
            } else {
                showAlert.error(data?.conversationLabelAdd?.data?.errors?.[0]?.message || 'Gắn nhãn hội thoại thất bại');
            }
        } catch (error) {
            showAlert.error('Gắn nhãn hội thoại thất bại');
        }
    }, [currentConversation, dataConversationLabel]);

    const onRemoveTag = useCallback(async (id) => {
        const { data } = await mutateRemoveTag({
            variables: {
                ids: [id],
                conversationId: currentConversation?.id
            }
        });

        if (data?.conversationLabelRemove?.success) {
            const newConversation = {
                ...currentConversation,
                labels: currentConversation?.labels?.filter(label => label?.id != id)
            }
            dispatch(actions.updateConversation(newConversation))
            dispatch(actions.updateCurrentConversation(newConversation));

            showAlert.success('Xóa nhãn hội thoại thành công');
        } else {
            showAlert.error(data?.conversationLabelRemove?.message || 'Xóa nhãn hội thoại thất bại');
        }
    }, [currentConversation, dataConversationLabel]);

    const onSendMessage = useCallback(async ({ message, medias }) => {
        if (message?.trim()?.length > 0 || medias?.length > 0) {
            const { data } = await mutate({
                variables: {
                    conversationId: currentConversation?.id,
                    medias,
                    message,
                    items: []
                }
            });

            if (data?.conversationSendMessageV2?.success) {
                const newConversation = {
                    ...currentConversation,
                    lastMessageType: message?.length > 0 ? 'text' : 'image',
                    lastMessage: message
                }
                dispatch(actions.updateConversation(newConversation));
                dispatch(actions.appendMessage(data?.conversationSendMessageV2?.items))
                messageListReferance.current?.scrollTo({
                    index: 9999,
                    behavior: 'smooth',
                });
            } else {
                showAlert.error("Phản hồi tin nhắn thất bại")
            }
        }
    }, [currentConversation])

    const onScrollVirtualList = useCallback(async (e: any) => {
        // Stop scroll bottom when re-render virtual dom
        setTimeout(() => {
            if (isRefSet)
                setIsRefSet(false)
        }, 350);

        // Loading more when scroll top
        if (e.target.scrollTop === 0 && !loading && hasMore) {
            setLoading(true);
            const { data } = await client.query({
                query: query_messageList,
                variables: {
                    conversationId: currentConversation?.id,
                    page: page + 1,
                    pageSize: 20
                },
                fetchPolicy: 'no-cache'
            });
            setPage(prev => prev + 1);
            setLoading(false);

            dispatch(actions.appendMoreMessage(data?.messageList?.items))

            if (data?.messageList?.page == data?.messageList?.totalPages || data?.messageList?.page > data?.messageList?.totalPages) {
                setHasMore(false);
            } else {
                messageListReferance.current.scrollTo(1500);
            }
        }
    }, [currentConversation, loading, hasMore, messageListReferance.current, page]);

    if (!currentConversation) {
        return <Col span={24} style={{
            height: "100%",
            display: "flex", flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center'
        }} >
            <Empty
                imageStyle={{ height: 100 }}
                description={
                    <span>
                        Vui lòng chọn một cuộc hội thoại
                    </span>
                }
            >
            </Empty>
        </Col>
    }

    return <Fragment>
        {openAddLabelConversation && <ModalAddConversationLabel
            sme={smeId}
            show={openAddLabelConversation}
            loading={loadingAddConversation}
            onAdd={onAddConversationLabel}
            onHide={() => setOpenAddLabelConversation(false)}
        />}
        <Col span={24} style={{ height: "100%" }} >
            <Row style={{ height: "100%", width: '100%' }}>
                <Col span={24} style={{
                    height: "100%",
                    display: "flex", flexDirection: 'column',
                }} >
                    <div style={{
                        background: 'white',
                        display: 'flex', alignItems: 'center', padding: '8px 16px',
                        minHeight: 40
                    }} >
                        {!!currentConversation?.customer?.logo ? (
                            <Avatar
                                className="header-avatar"
                                alt="avatar"
                                style={{ width: 40, height: 40 }}
                                src={currentConversation?.customer?.logo}
                            />
                        ) : (
                            <Avatar
                                className="header-avatar"
                                alt="avatar"
                                icon={!currentConversation?.customer?.name ? <UserOutlined /> : null}
                                style={{ width: 40, height: 40 }}
                            >
                                {currentConversation?.customer?.name?.slice(0, 1).toUpperCase()}
                            </Avatar>
                        )}
                        <Typography.Title level={5} style={{ margin: 0, marginLeft: 8 }}>
                            {currentConversation?.customer?.name}
                        </Typography.Title>
                        <div style={{ flex: 1 }} />
                        <Button
                            style={{ paddingBottom: 4, color: expandInfo ? '#ff5629' : '' }}
                            icon={<MenuUnfoldOutlined />}
                            type={expandInfo ? "link" : "text"}
                            size="large"
                            onClick={onExpandInfo}
                        />
                    </div>
                    <Divider style={{ marginBottom: 0, marginTop: 0 }} />
                    {loading && <div style={{ zIndex: 9, position: 'fixed', left: '50%', top: 125 }}>
                        <Spin />
                    </div>}
                    <VirtualList
                        className='message-list'
                        ref={messageListReferance}
                        data={messages?.map((mess, index: number) => ({
                            ...mess,
                            idVirtualList: `${mess?.id}-${index + 1}`
                        }))}
                        height={contentMessHeight}
                        itemHeight={65}
                        style={{ paddingBottom: 20 }}
                        itemKey="idVirtualList"
                        onScroll={onScrollVirtualList}
                    >
                        {(item, index) => {
                            return (
                                <List.Item key={`${item.idVirtualList}`}>
                                    <MessageBox
                                        key={`${item.idVirtualList}`}
                                        styles={{ marginTop: 12, padding: 12, maxWidth: '60%' }}
                                        {...item}
                                    />
                                </List.Item>
                            )
                        }}
                    </VirtualList>
                    <div ref={editorChatRef}>
                        <Spin spinning={loadingRemoveTag}>
                            <Flex align='center' justify="flex-end" gap={8}>
                                {currentConversation?.labels?.length < MAX_LABEL_IN_CONVERSATION && <Button
                                    type="dashed"
                                    className='btn-tag'
                                    disabled={!hasPermissionAction(['customer_service_chat_action'])}
                                    icon={<PlusOutlined className='icon-add-tag' />}
                                    onClick={() => {
                                        setSmeId(currentConversation?.smeId)
                                        setOpenAddLabelConversation(true)
                                    }}
                                />}
                                {currentConversation?.labels?.map(tag => {
                                    if (tag?.title?.length > 12) {
                                        return <Tag
                                            closable={hasPermissionAction(['customer_service_chat_action'])}
                                            className='tag-message'
                                            color={tag?.color}
                                            onClose={e => {
                                                if (!hasPermissionAction(['customer_service_chat_action'])) {
                                                    return
                                                }
                                                e.preventDefault();
                                                onRemoveTag(tag?.id);
                                            }}
                                        >
                                            <Tooltip placement="bottom" title={tag?.title}>
                                                {tag?.title?.slice(0, 12)}...
                                            </Tooltip>
                                        </Tag>
                                    }

                                    return <Tag
                                        closable={hasPermissionAction(['customer_service_chat_action'])}
                                        className='tag-message'
                                        color={tag?.color}
                                        onClose={e => {
                                            if (!hasPermissionAction(['customer_service_chat_action'])) {
                                                return
                                            }
                                            e.preventDefault();
                                            onRemoveTag(tag?.id);
                                        }}
                                    >
                                        {tag?.title?.slice(0, 12)}
                                    </Tag>
                                })}
                            </Flex>
                        </Spin>

                        <ChatInput
                            onSendMessage={onSendMessage}
                            onShowBlockImage={(height: number) => setContentHeight(prev => ({
                                ...prev,
                                toolbarHeight: prev?.toolbarHeight + height
                            }))} />
                    </div>
                </Col>
            </Row >
        </Col >
    </Fragment>
})