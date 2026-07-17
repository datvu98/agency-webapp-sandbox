/*
 * Created by duydatpham@gmail.com on 29/05/2023
 * Copyright (c) 2023 duydatpham@gmail.com
 */
import moment from "moment";
import React, { Fragment, memo, useCallback, useContext, useEffect, useMemo, useState } from "react";
import ChatItem from 'app/components/ChatItem';
import { IChatItemProps } from 'app/components/types';
import logo from '../../../../assets/avtDf.png';
import { selectConversations, selectCurrentConverstation, selectCurrentPageId, selectNeedReloadConversation } from "../slice/selectors";
import { useDispatch, useSelector } from "react-redux";
import { useChatSliceSlice } from "../slice";
import { Button, Checkbox, Col, Collapse, Empty, Flex, List, Row, Select, Space, Spin, Tooltip, Typography, Popover } from "antd";
import type { SearchProps } from "antd/es/input";
import { SocketContext } from "app/contexts/SocketContext";
import { useMutation, useQuery } from "@apollo/client";
import query_conversationList from "graphql/queries/query_conversationList";
import { DownOutlined, TagsOutlined, FilterOutlined } from "@ant-design/icons";
import classNames from "classnames";
import ModalActionLabel from "../components/ModalActionLabel";
import ModalAddConversationLabel from "../components/ModalAddConversationLabel";
import queryString from 'querystring';
import mutate_conversationLabelAdd from "graphql/mutations/mutate_conversationLabelAdd";
import { showAlert } from "utils/helper";
import { useNavigate } from "react-router-dom";
import LoadingConversation from "./components/LoadingConversation";
import { Helmet } from "react-helmet-async";
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import dayjs from "dayjs";
import mutate_conversationMarkRead from "graphql/mutations/mutate_conversationMarkRead";
import ModalResult from "../components/ModalResult";
import { useLayoutContext } from "app/contexts/LayoutContext";
import VirtualList from 'rc-virtual-list';
import client from "apollo";
import { omit } from "lodash";
import Search from "antd/es/input/Search";
import ChatFilters from "./components/ChatFilters";
import type { RadioChangeEvent } from 'antd';
import { Radio } from "antd";
import sortIcon from '../../../../assets/sort-icon.svg'
import { usePostHog } from '@posthog/react';

dayjs.extend(relativeTime);
dayjs.extend(updateLocale)
dayjs.updateLocale('en', {
    relativeTime: {
        future: "%s",
        past: "%s",
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
        yy: "%d năm"
    }
})
interface IOptionsFilter {
    value: number,
    label: string
}

const OPTIONS_SORT: IOptionsFilter[] = [
    { value: 0, label: 'Thời gian nhận' },
    { value: 1, label: 'Hạn phản hồi' },
];

const MAX_CONVERSATION_ACTION = 50;

export default (({ onShowExpand }) => {
    const { actions } = useChatSliceSlice();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const posthog = usePostHog();
    const currentConversation = useSelector(selectCurrentConverstation);
    const conversations = useSelector(selectConversations);
    const params = queryString.parse(location.search.slice(1, 100000)) as any;

    const { refConversation, setRefCurrentUserId, setCurrentSegmented, setCurrentTab } = useContext(SocketContext);
    const { optionsStore } = useLayoutContext();

    const [idsConversation, setIdsConversation] = useState<String[]>([]);
    // const [openAddLabelConversation, setOpenAddLabelConversation] = useState<boolean>(false);
    const [activeCollapse, setActiveCollapse] = useState<string>('');
    const [sortValue, setSortValue] = useState<number>(0);
    const [searchText, setSearchText] = useState<string>('');
    const [dataResults, setDataResults] = useState<any>(null);
    const [page, setPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [sortFilter, setSortFilter] = useState<boolean>(false);
    const [isFilter, setIsFilter] = useState<boolean>(false);
    console.log(conversations)
    const [addConversationLabel, { loading: loadingAddConversation }] = useMutation(mutate_conversationLabelAdd, {
        awaitRefetchQueries: true,
        refetchQueries: ['conversationList']
    });

    const [conversationMarkRead] = useMutation(mutate_conversationMarkRead);

    const isActive = useMemo(() => {
        if (params?.filterStatus?.length || params?.filterReplyExpired?.length || params?.filterConversationStores || params?.filterLabels?.length || params?.filterSmes?.length) {
            return true
        }
        return false
    }, [params?.filterStatus, params?.filterReplyExpired, params?.filterConversationStores, params?.filterLabels, params?.filterSmes])

    useMemo(() => {
        if (!params?.sort) return;
        setSortValue(Number(params?.sort));
    }, [params?.sort]);

    useMemo(() => {
        if (!params?.q) return;
        setSearchText(params?.q);
    }, [params?.q]);

    const sort = useMemo(() => {
        try {
            return {
                sort: !params?.sort ? OPTIONS_SORT[0].value : Number(params?.sort)
            };
        } catch (err) {
            return {};
        }
    }, [params?.sort]);

    const filterReplyExpired = useMemo(() => {
        try {
            if (!params?.filterReplyExpired) return {};

            return {
                filterReplyExpired: params?.filterReplyExpired?.split(',')?.map(item => +item) || []
            };
        } catch (err) {
            return {};
        }
    }, [params?.filterReplyExpired]);

    const filterStatus = useMemo(() => {
        try {
            if (!params?.filterStatus) return {};

            return {
                filterStatus: params?.filterStatus?.split(',')?.map(item => +item) || []
            };
        } catch (err) {
            return {};
        }
    }, [params?.filterStatus]);

    const filterConversationStores = useMemo(() => {
        try {
            if (!params?.filterConversationStores && !params?.filterSme) return {};

            return {
                filterConversationStores: params?.filterConversationStores?.split(',')?.map(item => +item) || []
            };
        } catch (err) {
            return {};
        }
    }, [params?.filterConversationStores, params?.filterSme]);

    const filterLabels = useMemo(() => {
        try {
            if (!params?.filterLabels) return {};

            return {
                filterLabels: params?.filterLabels?.split(',')?.map(item => +item) || []
            };
        } catch (err) {
            return {};
        }
    }, [params?.filterLabels]);

    const variables = useMemo(() => {
        setPage(1);

        return {
            ...sort,
            ...filterReplyExpired,
            ...filterStatus,
            ...filterConversationStores,
            ...filterLabels,
            textSearch: params?.q || '',
            page: 1, pageSize: 10
        }
    }, [sort, filterReplyExpired, filterStatus, filterConversationStores, filterLabels, params?.q]);

    const { data: dataConversationList, loading: loadingConversationList } = useQuery(query_conversationList, {
        variables,
        fetchPolicy: 'cache-and-network',
        onCompleted: ({ conversationList }) => {
            if (conversationList?.items?.length > 0) {
                if (conversationList?.items?.length > 9) setHasMore(true);
                onShowExpand(true);
            }

            dispatch(actions.initConversations(conversationList?.items));
            const defaultConversation = conversationList?.items?.[0];
            dispatch(actions.selectConversation(defaultConversation));
            dispatch(actions.markReadConversation(defaultConversation));
        }
    });

    const contentConversationHeight = useMemo(() => {
        return window.innerHeight - (!!activeCollapse ? 172 : 112)
    }, [activeCollapse, window.innerHeight]);

    const conversationsVirtual = useMemo(() => {
        return conversations?.map((conversation, index: number) => {
            return {
                ...conversation,
                idVirtual: `${conversation?.id}-${index}`,
                id: conversation.id,
                className: currentConversation?.id == conversation.id ? 'selected' : '',
                avatar: logo,
                title: conversation.id,
                subtitle: conversation.lastMessage,
                dateString: !!conversation.lastUpdated ? moment.unix(+conversation.lastUpdated / 1000).fromNow() : "",
                unread: conversation.countUnread,
            }
        }) || []
    }, [conversations, currentConversation]);

    useMemo(() => {
        if (!!params?.filterConversation && conversationsVirtual?.length > 0 && conversationsVirtual?.length < 11) {
            const findedConversation = conversationsVirtual?.find(item => item?.id == params?.filterConversation);

            if (findedConversation) {
                dispatch(actions.selectConversation(findedConversation))
                dispatch(actions.markReadConversation(findedConversation))
            }
            navigate(`/chats?${queryString.stringify(omit({
                ...params,
            }, ['filterConversation']))}`)
        }
    }, [params?.filterConversation, conversations]);

    const onLoadMoreConversation = useCallback(async (e: React.UIEvent<HTMLElement, UIEvent>) => {
        if (Math.abs(e.currentTarget.scrollHeight - e.currentTarget.scrollTop - contentConversationHeight) <= 1 && hasMore) {
            setHasMore(false);
            setLoading(true);

            const { data } = await client.query({
                query: query_conversationList,
                variables: {
                    ...variables,
                    page: page + 1,
                },
                fetchPolicy: 'no-cache'
            })
            setLoading(false);

            if (data?.conversationList?.items?.length == 0) {
                setHasMore(false);
            } else {
                setHasMore(true);
                setPage(prev => prev + 1);
                dispatch(actions.appendMoreConversation(data?.conversationList?.items));
            }
        }
    }, [hasMore, page, contentConversationHeight, variables]);

    const onSearch: SearchProps['onSearch'] = (value) => {
        posthog?.capture('conversation_searched');
        navigate(`/chats?${queryString.stringify({
            ...params,
            q: value,
        })}`);
    };

    const onSelectConversation = useCallback(async (item: any) => {
        await conversationMarkRead({
            variables: { conversationIds: [item?.id] }
        });
        if (currentConversation?.id != item?.id) {
            posthog?.capture('conversation_selected');
            setCurrentTab('1');
            setRefCurrentUserId(item?.customer?.ref_id);
            setCurrentSegmented('customer');
            dispatch(actions.selectConversation(item))
        }
    }, [currentConversation])

    // const onAddConversationLabel = useCallback(async (ids) => {
    //     try {
    //         const { data } = await addConversationLabel({
    //             variables: {
    //                 ids,
    //                 conversationIds: idsConversation
    //             }
    //         });

    //         setOpenAddLabelConversation(false);
    //         setIdsConversation([]);
    //         setActiveCollapse('');
    //         setDataResults(data?.conversationLabelAdd?.data);
    //     } catch (error) {
    //         showAlert.error('Gắn nhãn hội thoại thất bại');
    //     }
    // }, [idsConversation]);

    const onChangeFilter = (e: RadioChangeEvent) => {
        setSortValue(e.target.value);
        navigate(`/chats?${queryString.stringify({
            ...params,
            sort: e.target.value,
        })}`);
    };

    return <Fragment>
        <div className="container-chat-wrapper">
            {/* {openAddLabelConversation && <ModalAddConversationLabel
                show={openAddLabelConversation}
                loading={loadingAddConversation}
                onAdd={onAddConversationLabel}
                onHide={() => setOpenAddLabelConversation(false)}
            />} */}

            <ModalResult
                dataResults={dataResults}
                onHide={() => setDataResults(null)}
            />
            <Flex onClick={e => e.stopPropagation()} className="container-chat-action" align="center" justify="space-between">
                <Popover
                    title="Sắp xếp"
                    className={classNames('chat-filter-item', { active: sortFilter })}
                    placement="bottom"
                    trigger="click"
                    content={
                        <Radio.Group onChange={onChangeFilter} value={sortValue} >
                            <Space className="w-100" direction="vertical" size={15}>
                                {OPTIONS_SORT?.map(option => {
                                    return <Radio value={option?.value}>{option?.label}</Radio>
                                })}
                            </Space>
                        </Radio.Group>
                    }
                    open={sortFilter}
                    onOpenChange={() => setSortFilter(prev => !prev)}
                >
                    <div className="chat-filter-icon">
                        <img src={sortIcon} width={24} height={24} />
                    </div>
                </Popover>
                <Search
                    placeholder="Tìm tên khách hàng"
                    style={{ maxWidth: '65%' }}
                    onSearch={onSearch}
                    onChange={e => {
                        setSearchText(e.target.value)
                    }}
                    value={searchText}
                />
                <Space
                    align="end"
                    onClick={() => {
                        setIsFilter(prev => !prev)
                    }}
                >
                    <Typography.Text className={classNames(`container-chat-filter--text ${isFilter || isActive ? 'active' : ''}`, { 'cursor-not-allowed': loadingConversationList })}>
                        <span style={{ marginRight: 5 }}>Lọc</span>
                        <FilterOutlined />
                    </Typography.Text>
                </Space>
                {/* <Space
                                align="end"
                                onClick={() => {
                                    if (loadingConversationList || conversationsVirtual?.length == 0) return;
                                    setIdsConversation([]);
                                    setActiveCollapse(prev => !prev ? 'action' : '')
                                }}
                            >
                                <Typography.Text className={classNames("container-chat-collapse--text", { 'cursor-not-allowed': loadingConversationList || conversationsVirtual?.length == 0 })}>
                                    Thao tác
                                </Typography.Text>
                            </Space> */}
            </Flex>
            <Flex>
                {isFilter && <ChatFilters />}
            </Flex>
            <div className="container-chat-list">
                {loadingConversationList && !dataConversationList && <LoadingConversation />}
                {(!loadingConversationList || dataConversationList) && <Fragment>
                    {conversationsVirtual?.length == 0 && (
                        <Flex align="center" justify="center">
                            <Empty
                                style={{ marginTop: '50%' }}
                                description={'Chưa có cuộc hội thoại nào'}
                            />
                        </Flex>
                    )}
                    {conversationsVirtual?.length > 0 && (
                        <VirtualList
                            ref={refConversation}
                            className="virtual-list-conversation"
                            data={conversationsVirtual}
                            height={contentConversationHeight}
                            itemKey="idVirtual"
                            itemHeight={contentConversationHeight / 7}
                            onScroll={onLoadMoreConversation}
                        >
                            {(item: any) => {
                                let expiredTime, colorExpiredTime;
                                const isChecked = idsConversation?.some(id => id == item?.id);
                                const timeUpdate = dayjs.unix(+item?.lastUpdated / 1000).fromNow();
                                const diffTime = +item?.replyExpiredAt / 1000 - dayjs().unix();

                                if (diffTime < 0 || diffTime == 0) {
                                    expiredTime = `Quá hạn`;
                                    colorExpiredTime = '#FF4D4F';
                                } else if (diffTime < 3600) {
                                    const diffTimeMinutes = dayjs(+item?.replyExpiredAt).diff(dayjs(), 'm');
                                    expiredTime = `Còn lại: ${diffTimeMinutes || 1} phút`;
                                    colorExpiredTime = '#FF4D4F';
                                } else {
                                    const diffTimeHours = dayjs(+item?.replyExpiredAt).diff(dayjs(), 'h');
                                    expiredTime = `Còn lại: ${diffTimeHours}h`;
                                    colorExpiredTime = '#000000';
                                }

                                return (
                                    <List.Item key={item?.idVirtual}>
                                        <ChatItem
                                            avatar={item?.customer?.logo}
                                            alt="kursat_avatar"
                                            id={item?.idVirtual}
                                            isSelected={currentConversation?.id == item?.id}
                                            isChecked={isChecked}
                                            isDisable={!isChecked && idsConversation?.length == MAX_CONVERSATION_ACTION}
                                            onCheck={() => setIdsConversation(prev => isChecked
                                                ? prev.filter(id => id != item?.id)
                                                : prev.concat(item?.id)
                                            )}
                                            store={optionsStore?.find(store => store?.id == item?.conversationStoreId)}
                                            tags={item?.labels?.slice(0, 2) || []}
                                            isShowCheckbox={!!activeCollapse}
                                            isReplied={item?.isReplied}
                                            title={item?.customer?.name}
                                            subtitle={item?.lastMessage}
                                            date={new Date()}
                                            lastMessageType={item?.lastMessageType}
                                            dateString={timeUpdate}
                                            expiredTime={!!item?.isReplied ? null : expiredTime}
                                            colorExpiredTime={colorExpiredTime}
                                            onClick={() => onSelectConversation(item)}
                                            unread={item?.unreadCount}
                                        />
                                    </List.Item>
                                )
                            }}
                        </VirtualList>
                    )}
                    {loading && <Flex justify="center">
                        <Spin style={{ position: 'fixed', bottom: 20 }} />
                    </Flex>}
                </Fragment>}
            </div>
        </div>
    </Fragment>
})