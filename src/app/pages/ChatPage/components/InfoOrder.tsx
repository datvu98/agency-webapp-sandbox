import { useMutation, useQuery } from "@apollo/client";
import { Badge, Button, Card, Col, Collapse, ConfigProvider, Divider, Empty, Flex, Image, List, Row, Space, Spin, Timeline, Tooltip, Typography } from "antd";
import { SocketContext } from "app/contexts/SocketContext";
import dayjs from "dayjs";
import mutation_conversationSendMessage from "graphql/mutations/mutation_conversationSendMessage";
import query_scGetOrders from "graphql/queries/query_scGetOrders";
import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { formatNumberToCurrency, renderStatusName, showAlert } from "utils/helper";
import VirtualList from 'rc-virtual-list';
import client from "apollo";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentConverstation } from "../slice/selectors";
import { useChatSliceSlice } from "../slice";
import mutate_coUpdateOrderNote from "graphql/mutations/mutate_coUpdateOrderNote";
import SkuIcon from 'assets/ic_sku.svg';
import { FieldTimeOutlined, RocketOutlined } from "@ant-design/icons";
import mutate_conversationSendMessageV2 from "graphql/mutations/mutate_conversationSendMessageV2";
import { useLayoutContext } from "app/contexts/LayoutContext";
import { hasPermissionAction } from "utils/helper";

const InfoOrderWrapper = styled.div`    
    padding-top: 20px;
    padding-bottom: 20px;

    .ant-card {
        border-color: #fff6f0;

        .ant-card-body {
            padding: 8px 12px;
            background-color: #fff6f0;
            border-radius: 8px;
        }
    }

    .text-sub {
        font-size: 12px;
    }
    
    .text-more {
        font-size: 12px;
        color: #1677ff;
    }

    .image-order {
        aspectRatio: 1;
        object-fit: contain;
        border-radius: 8px;
    }

    .badge-order {
        .ant-badge-status-text {
            font-weight: bold;
        }
    }

    .virtual-list-order {
        .rc-virtual-list-holder-inner {
            padding: 0px 20px;
        }
    }

    .icon-manual {
        font-size: 16px;
    }

    .collapse-order {        
        &.ant-collapse {
            width: 100%;
        }

        .ant-collapse-header {
            padding: 0px;
            display: flex;
            align-items: center;

            .ant-collapse-expand-icon {
                padding-inline-start: 4px !important;
                color: #1677ff;
            }
        }

        .ant-collapse-content {
            background: #eff2f5;
            padding: 10px;            
            border-radius: 8px;
            margin-top: 4px;

            .ant-collapse-content-box {
                padding: 4px !important;
            }
        }        

        .content-order {
            padding-left: 8px;
        }
    }
`;

interface IContentHeight {
    headerHeight: number,
    titleHeight: number,
};

const { Text, Paragraph } = Typography;

const PER_PAGE_ORDER = 10;

const InfoOrder = () => {
    const { actions } = useChatSliceSlice();
    const { messageListReferance } = useLayoutContext();
    const dispatch = useDispatch();
    const currentConversation = useSelector(selectCurrentConverstation);

    const [contentHeight,] = useState<IContentHeight>({
        headerHeight: 64,
        titleHeight: 120,
    });
    const [orders, setOrders] = useState<any>([]);
    const [activeCollapses, setActiveCollapses] = useState<string[]>([]);
    const [page, setPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(false);

    // Handle resize height
    const [_, setWindowSize] = useState(window.innerHeight);

    const handleWindowResize = useCallback(event => {
        setWindowSize(window.innerHeight);
    }, []);

    useEffect(() => {
        window.addEventListener('resize', handleWindowResize);
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, [handleWindowResize]);

    const variables = useMemo(() => {
        return {
            ref_customer_id: currentConversation?.customer?.ref_id,
            list_store: [currentConversation?.storeId],
            per_page: PER_PAGE_ORDER
        }
    }, [currentConversation]);

    const { data: dataOrders, loading: loadingOrder } = useQuery(query_scGetOrders, {
        variables: {
            ...variables,
            page: 1,
        },
        fetchPolicy: 'cache-and-network',
    });

    const [sendOrder, { loading: loadingSendOrder }] = useMutation(mutate_conversationSendMessageV2, {
        awaitRefetchQueries: true,
        refetchQueries: ['messageList']
    });

    const [updateOrderNote, { loading: loadingUpdateOrderNote }] = useMutation(mutate_coUpdateOrderNote, {
        awaitRefetchQueries: true,
        refetchQueries: ['scGetOrders']
    });

    useMemo(() => {
        if (!dataOrders || dataOrders?.scGetOrders?.length == 0) return;

        setHasMore(true);
        setOrders(dataOrders?.scGetOrders);
    }, [dataOrders]);

    const contentMessHeight = useMemo(() => {
        return window.innerHeight - contentHeight?.headerHeight - contentHeight?.titleHeight
    }, [contentHeight, window.innerHeight]);

    const onSendOrder = useCallback(async (ref_order_id) => {
        const { data } = await sendOrder({
            variables: {
                conversationId: currentConversation?.id,
                medias: [],
                message: "",
                items: [{
                    id: String(ref_order_id),
                    type: 'order',
                    shopId: String(currentConversation?.storeId)
                }],
            }
        })

        if (data?.conversationSendMessageV2?.success) {
            const newConversation = {
                ...currentConversation,
                lastMessageType: "order",
                lastMessage: ""
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
    }, [currentConversation]);

    const onUpdateOrderNote = useCallback(async (orderId, note) => {
        try {
            const { data } = await updateOrderNote({
                variables: {
                    list_order_id: [orderId],
                    sme_note: note
                }
            })

            if (data?.coUpdateOrderNote?.success) {
                showAlert.success('Cập nhật ghi chú thành công');
            } else {
                showAlert.error(data?.coUpdateOrderNote?.message || 'Cập nhật ghi chú thất bại');
            }
        } catch (error) {
            showAlert.error('Đã có lỗi xảy ra, xin vui lòng thử lại');
        }
    }, []);


    const onLoadMoreOrder = useCallback(async (e: React.UIEvent<HTMLElement, UIEvent>) => {
        if (Math.abs(e.currentTarget.scrollHeight - e.currentTarget.scrollTop - contentMessHeight) <= 1 && hasMore) {
            setHasMore(false);
            setLoading(true);

            const { data } = await client.query({
                query: query_scGetOrders,
                variables: {
                    ...variables,
                    page: page + 1,
                },
                fetchPolicy: 'no-cache'
            })
            setLoading(false);
            setPage(prev => prev + 1);

            if (data?.scGetOrders?.length == 0) {
                setHasMore(false);
            } else {
                setHasMore(true);
                setOrders(prev => [...prev, ...data?.scGetOrders])
            }
        }
    }, [hasMore, page, contentMessHeight, variables]);

    const renderOrderTime = useCallback((order) => {
        let [title, time] = ['', ''];
        let order_status = order?.status;
        if (order_status == 'READY_TO_SHIP' && order?.logisticsPackages?.filter(item => item.pack_status == 'pending').length > 0) {
            order_status = 'pending'
        }

        if (order_status == 'READY_TO_SHIP' && order?.logisticsPackages?.filter(item => item.pack_status == 'pack_error').length > 0) {
            order_status = 'pack_error'
        }

        if (order_status == 'PROCESSED' && order?.logisticsPackages?.filter(item => item.pack_status == 'creating').length > 0) {
            order_status = 'creating'
        }

        if (order_status == 'PROCESSED' && order?.logisticsPackages?.filter(item => item.pack_status == 'packing').length > 0) {
            order_status = 'packing'
        }

        if (order_status == 'PROCESSED' && order?.logisticsPackages?.filter(item => item.pack_status == 'packed').length > 0) {
            order_status = 'packed'
        }

        if (order_status == 'READY_TO_SHIP' && order?.logisticsPackages?.filter(item => item.pack_status == 'pack_lack').length > 0) {
            order_status = 'pack_lack'
        }

        if (order_status == 'COMPLETED') {
            title = 'Thời gian hoàn thành';
            time = !!order?.completed_at ? dayjs.unix(order?.completed_at).format('DD/MM/YYYY HH:mm') : '--'
        } else if (order_status == 'SHIPPED' || order_status == 'TO_CONFIRM_RECEIVE') {
            title = 'Thời gian giao hàng';
            time = !!order?.shipped_at ? dayjs.unix(order?.shipped_at).format('DD/MM/YYYY HH:mm') : '--'
        } else if (order_status == 'PENDING' || order_status == 'pending' || order_status == 'packed' || order_status == 'packing' || order_status == 'creating') {
            title = 'Thời gian đặt hàng';
            time = !!order?.order_at ? dayjs.unix(order?.order_at).format('DD/MM/YYYY HH:mm') : '--'
        } else if (order_status == 'CANCELLED') {
            title = 'Thời gian huỷ';
            time = !!order?.cancel_at ? dayjs.unix(order?.cancel_at).format('DD/MM/YYYY HH:mm') : '--'
        } else {
            title = 'Thời gian cập nhật';
            time = !!order?.updated_at ? dayjs(order?.updated_at).format('DD/MM/YYYY HH:mm') : '--'
        }

        if (order?.returnOrder) {
            title = 'Thời gian yêu cầu hoàn';
            time = !!order?.returnOrder?.reverse_request_time ? dayjs.unix(order?.returnOrder?.reverse_request_time).format('DD/MM/YYYY HH:mm') : '--'
        }

        return { title, time }
    }, []);

    return (
        <InfoOrderWrapper>
            {!loadingOrder && (!dataOrders || dataOrders?.scGetOrders?.length == 0) && <Flex style={{ marginTop: 150 }} justify="center" align="center">
                <Empty description="Chưa có đơn hàng" />
            </Flex>}
            <Spin spinning={loadingOrder}>
                {dataOrders?.scGetOrders?.length > 0 && (
                    <VirtualList
                        className="virtual-list-order"
                        data={orders?.map((order, index) => ({ ...order, newId: `${order?.id}-${index}` }))}
                        height={contentMessHeight}
                        itemKey="newId"
                        itemHeight={contentMessHeight / 6}
                        onScroll={onLoadMoreOrder}
                    >
                        {(item: any) => (
                            <List.Item key={item?.newId}>
                                <Card style={{ marginBottom: 20 }}>
                                    <Flex vertical gap={4}>
                                        <Flex align="center" justify="space-between">
                                            <Flex align="center" gap={10}>
                                                <Badge
                                                    className="badge-order"
                                                    color={item?.status == 'COMPLETED' ? '#22D829' : "#FF4D4F"}
                                                    text={!!item?.returnOrder
                                                        ? <Space align="center">
                                                            <Text type="secondary">Hoàn thành</Text>
                                                            <Text type="danger">{` -> Đơn hoàn`}</Text>
                                                        </Space>
                                                        : <Text>{renderStatusName(item)?.status}</Text>}
                                                />
                                                {item?.source == 'manual' && <Tooltip title="Đơn thủ công" placement="bottom">
                                                    <RocketOutlined className="icon-manual color-base" />
                                                </Tooltip>}
                                            </Flex>
                                            <Button
                                                type="primary"
                                                loading={false}
                                                disabled={item?.source == 'manual' || !hasPermissionAction(['customer_service_chat_action'])}
                                                onClick={() => onSendOrder(item?.ref_id)}
                                            >
                                                Gửi
                                            </Button>
                                        </Flex>
                                        <Flex align="center" justify="space-between">
                                            <Text type="danger" copyable>{item?.ref_id}</Text>
                                            <Text>{!!item?.order_at ? dayjs.unix(item?.order_at).format('DD/MM/YYYY HH:mm') : '--'}</Text>
                                        </Flex>
                                        <Flex align="center" justify="space-between">
                                            <Collapse
                                                ghost
                                                expandIconPosition="end"
                                                collapsible="header"
                                                className="collapse-order"
                                                activeKey={activeCollapses}
                                                key={item?.newId}
                                                items={[{
                                                    key: item?.newId,
                                                    label: <Flex justify="space-between" align="center">
                                                        <Text className="text-sub" type="secondary">
                                                            {`[${item?.payment_method}]`}
                                                        </Text>
                                                        <Text
                                                            className="text-more"
                                                            onClick={() => {
                                                                const isCollapse = activeCollapses?.includes(item?.newId);

                                                                setActiveCollapses(prev => isCollapse
                                                                    ? prev.filter(_item => _item != item?.newId)
                                                                    : prev.concat(item?.newId))
                                                            }}
                                                        >
                                                            {activeCollapses?.includes(item?.newId) ? 'Ẩn bớt' : 'Xem thêm'}
                                                        </Text>
                                                    </Flex>,
                                                    children: <Flex vertical>
                                                        <Flex vertical gap={20}>
                                                            {item?.orderItems.map((orderItem) => (
                                                                <Row key={`order-item-${orderItem?.id}`}>
                                                                    <Col span={4}>
                                                                        <Image
                                                                            className="image-order"
                                                                            preview={false}
                                                                            src={orderItem?.variant_image}
                                                                            style={!orderItem?.variant_image ? { border: '1px solid #c4c4c4' } : {}}
                                                                            fallback={!orderItem?.variant_image ? "data:image/png;base64,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" : ""}
                                                                        />
                                                                    </Col>
                                                                    <Col span={15} className="content-order">
                                                                        <Flex vertical gap={4}>
                                                                            <Tooltip title={orderItem?.product_name} placement="bottom">
                                                                                <Paragraph className="text-sub" style={{ margin: 0 }} ellipsis={{ rows: 2 }}>
                                                                                    {orderItem?.product_name}
                                                                                </Paragraph>
                                                                            </Tooltip>
                                                                            {!!orderItem?.variant_name && <Paragraph className="text-sub" style={{ margin: 0 }} ellipsis={{ rows: 2 }}>
                                                                                {orderItem?.variant_name}
                                                                            </Paragraph>}
                                                                            {!!orderItem?.variant_sku && <Flex align="center" gap={4}>
                                                                                <img
                                                                                    className="icon-sku"
                                                                                    src={SkuIcon}
                                                                                />
                                                                                <Paragraph type="secondary" className="text-sub" style={{ margin: 0 }} ellipsis={{ rows: 2 }}>
                                                                                    {orderItem?.variant_sku}
                                                                                </Paragraph>
                                                                            </Flex>}
                                                                        </Flex>
                                                                    </Col>
                                                                    <Col span={5}>
                                                                        <Flex vertical gap={10} align="end">
                                                                            <Text className="text-sub color-base">{formatNumberToCurrency(orderItem?.original_price / orderItem?.quantity_purchased)}đ</Text>
                                                                            <Text className="text-sub">x{orderItem?.quantity_purchased}</Text>
                                                                        </Flex>
                                                                    </Col>
                                                                </Row>
                                                            ))}
                                                        </Flex>
                                                        <Divider style={{ margin: '10px 0px' }} />
                                                        <Flex vertical gap={10}>
                                                            <Flex justify="space-between" align="center">
                                                                <Text className="text-sub">Tổng giá trị thanh toán từ người mua</Text>
                                                                <Text className="text-sub color-base">{formatNumberToCurrency(item?.paid_price)}đ</Text>
                                                            </Flex>
                                                            <Flex justify="space-between" align="center">
                                                                <Flex align="center" gap={4}>
                                                                    <Text className="text-sub">Thông tin vận chuyển</Text>
                                                                    <ConfigProvider
                                                                        theme={{
                                                                            components: {
                                                                                Timeline: {
                                                                                    tailColor: '#fff'
                                                                                },
                                                                            },
                                                                        }}
                                                                    >
                                                                        <Tooltip
                                                                            placement="bottom"
                                                                            title={item?.logisticsPackages?.[0]?.logisticsTrackingInfo?.length > 0 ? <Timeline
                                                                                style={{ color: '#fff', maxHeight: 400, overflowY: 'auto', paddingRight: 10, paddingTop: 20 }}
                                                                                items={item?.logisticsPackages?.[0]?.logisticsTrackingInfo?.map(lg => ({
                                                                                    children: <Flex vertical>
                                                                                        <div className="text-white" dangerouslySetInnerHTML={{ __html: lg?.description }} />
                                                                                        <Text className="text-white">{dayjs.unix(lg?.tracking_update_time).format('HH:mm:ss DD/MM/YYYY')}</Text>
                                                                                    </Flex>
                                                                                }))}
                                                                            /> : <Text className="text-white">Chưa có thông tin vận chuyển</Text>}
                                                                        >
                                                                            <FieldTimeOutlined />
                                                                        </Tooltip>
                                                                    </ConfigProvider>
                                                                </Flex>
                                                                <Text className="text-sub">{item?.logisticsPackages?.[0]?.shipping_carrier || '--'}</Text>
                                                            </Flex>
                                                            <Flex justify="space-between" align="center">
                                                                <Text className="text-sub">{renderOrderTime(item).title}</Text>
                                                                <Text className="text-sub">{renderOrderTime(item).time}</Text>
                                                            </Flex>
                                                            <Flex justify="space-between" align="center">
                                                                <Text className="text-sub">Ghi chú</Text>
                                                                <Spin spinning={loadingUpdateOrderNote}>
                                                                    <Text
                                                                        className="text-sub"
                                                                        editable={item?.status == 'PENDING' || (item?.status == 'READY_TO_SHIP' && item?.logisticsPackages?.filter(pkg => pkg.pack_status == 'pending').length > 0) ? {
                                                                            onChange: (value) => onUpdateOrderNote(item?.id, value),
                                                                            maxLength: 250
                                                                        } : false}
                                                                    >
                                                                        {item?.sme_note}
                                                                    </Text>
                                                                </Spin>
                                                            </Flex>
                                                        </Flex>
                                                    </Flex>
                                                }]}
                                            />
                                        </Flex>
                                    </Flex>
                                </Card>
                            </List.Item>
                        )}
                    </VirtualList>
                )}
                {loading && <Flex justify="center">
                    <Spin style={{ position: 'fixed', bottom: 20 }} />
                </Flex>}
            </Spin>
        </InfoOrderWrapper >
    )
};

export default memo(InfoOrder);