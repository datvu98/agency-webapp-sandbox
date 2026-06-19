import { Affix, Button, Checkbox, Col, Divider, Empty, Flex, Image, Input, List, Row, Spin, Tooltip, Typography } from "antd";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import VirtualList from 'rc-virtual-list';
import client from "apollo";
import mutation_conversationSendMessage from "graphql/mutations/mutation_conversationSendMessage";
import { formatNumberToCurrency, showAlert } from "utils/helper";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentConverstation } from "../slice/selectors";
import { useChatSliceSlice } from "../slice";
import { useMutation, useQuery } from "@apollo/client";
import query_scProducts from "graphql/queries/query_scProducts";
import { minBy, sortBy } from "lodash";
import SkuIcon from 'assets/ic_sku.svg';
import mutate_conversationSendMessageV2 from "graphql/mutations/mutate_conversationSendMessageV2";
import { useLayoutContext } from "app/contexts/LayoutContext";
import { ReloadOutlined } from "@ant-design/icons";
import mutate_scProductReload from "graphql/mutations/mutate_scProductReload";
import { hasPermissionAction } from "utils/helper";

const InfoProductWrapper = styled(Flex)`
    padding-bottom: 0px;

    .content-wrapper {
    }

    .input-wrapper {
        margin: 20px;        

        .ant-input-affix-wrapper {
            height: 32px;
        }

        .ant-btn {
            display: flex;
            justify-content: center;
            align-items: center;
            background: #fef6f0;
        }
    }

    .image-product {        
        border-radius: 8px;
        object-fit: contain;
    }

    .ant-divider {
        margin: 10px 0px;
    }    

    .ant-typography-ellipsis {
        margin-bottom: 4px;
    }

    .virtual-list-product {
        .rc-virtual-list-holder-inner {
            padding: 0px 20px;
        }
    }

    .affix-action {
        position: fixed;
        bottom: 0;        
        width: 100%;        
        border-top: 1px solid #F0F0F0;
    }

    .product-bottom {
        margin: 20px;
    }
`;

interface IContentHeight {
    headerHeight: number,
    titleHeight: number,
    searchHeight: number,
    bottomHeight: number,
};

const { Search } = Input;
const { Text, Paragraph } = Typography;
const PER_PAGE_PRODUCT = 10;
const MAX_PRODUCTS = 50;

const InfoProduct = () => {
    const { actions } = useChatSliceSlice();
    const { messageListReferance } = useLayoutContext();
    const dispatch = useDispatch();
    const currentConversation = useSelector(selectCurrentConverstation);
    const [contentHeight,] = useState<IContentHeight>({
        headerHeight: 64,
        titleHeight: 120,
        searchHeight: 72,
        bottomHeight: 50,
    });

    const [products, setProducts] = useState<any>([]);
    const [ids, setIds] = useState<number[]>([]);
    const [page, setPage] = useState<number>(1);
    const [search, setSearch] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [currentLoadProduct, setCurrentLoadProduct] = useState<number | null>(null);

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
            q: search,
            status: 10,
            store_id: currentConversation?.storeId,
            per_page: PER_PAGE_PRODUCT
        }
    }, [search, currentConversation]);

    const { data: dataProducts, loading: loadingProduct } = useQuery(query_scProducts, {
        variables: {
            ...variables,
            order_by: {
                column: 'created_at',
                direction: 'desc'
            },
            page: 1,
        },
        skip: !currentConversation?.storeId,
        fetchPolicy: 'cache-and-network',
    });

    const [scProductReload] = useMutation(mutate_scProductReload, {
        awaitRefetchQueries: true,
        refetchQueries: ['ScGetSmeProducts']
    });

    const [sendProduct, { loading: loadingSendProduct }] = useMutation(mutate_conversationSendMessageV2, {
        awaitRefetchQueries: true,
        refetchQueries: ['messageList']
    });

    useMemo(() => {
        if (!dataProducts || dataProducts?.ScGetSmeProducts?.products?.length == 0) return;

        setHasMore(true);
        setProducts(dataProducts?.ScGetSmeProducts?.products);
    }, [dataProducts]);


    const contentMessHeight = useMemo(() => {
        return window.innerHeight - contentHeight?.headerHeight - contentHeight?.titleHeight - contentHeight?.searchHeight - contentHeight?.bottomHeight
    }, [contentHeight, window.innerHeight]);

    const onSendProduct = useCallback(async (productIds) => {
        const { data } = await sendProduct({
            variables: {
                conversationId: currentConversation?.id,
                medias: [],
                message: "",
                items: productIds?.map(item => ({
                    id: item,
                    shopId: String(currentConversation?.storeId),
                    type: 'item'
                }))
            }
        })

        setIds([]);
        if (data?.conversationSendMessageV2?.success) {
            const newConversation = {
                ...currentConversation,
                lastMessageType: "product",
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
    }, [ids, currentConversation]);

    const onLoadMoreProduct = useCallback(async (e: React.UIEvent<HTMLElement, UIEvent>) => {
        if (Math.abs(e.currentTarget.scrollHeight - e.currentTarget.scrollTop - contentMessHeight) <= 1 && hasMore) {
            setHasMore(false);
            setLoading(true);

            const { data } = await client.query({
                query: query_scProducts,
                variables: {
                    ...variables,
                    order_by: {
                        column: 'created_at',
                        direction: 'desc'
                    },
                    page: page + 1,
                },
                fetchPolicy: 'no-cache'
            })
            setLoading(false);
            setPage(prev => prev + 1);

            if (data?.ScGetSmeProducts?.products?.length == 0) {
                setHasMore(false);
            } else {
                setHasMore(true);
                setProducts(prev => prev.concat(data?.ScGetSmeProducts?.products || []))
            }
        }
    }, [hasMore, page, contentMessHeight, variables]);

    const onReloadProduct = useCallback(async (product_id: number) => {
        try {
            setCurrentLoadProduct(product_id);
            const { data } = await scProductReload({
                variables: {
                    products: [product_id]
                }
            });

            setCurrentLoadProduct(null);
            if (data?.scProductReLoad?.success) {
                showAlert.success('Tải lại sản phẩm thành công');
            } else {
                showAlert.error(data?.scProductReLoad?.message || 'Tải lại sản phẩm thất bại');
            }
        } catch (error) {
            showAlert.error('Tải lại sản phẩm thất bại');
        }
    }, []);

    return (
        <InfoProductWrapper vertical justify="space-between">
            <div className="content-wrapper">
                <Flex justify="center">
                    <Search
                        className="input-wrapper"
                        placeholder="Tìm kiếm sản phẩm sàn"
                        allowClear
                        width="60%"
                        onSearch={(value) => {
                            setSearch(value);
                            setPage(1);
                            setHasMore(true);
                        }}
                    />
                </Flex>
                {!loadingProduct && (!dataProducts || dataProducts?.ScGetSmeProducts?.products?.length == 0) && <Flex style={{ marginTop: 150 }} justify="center" align="center">
                    <Empty description="Chưa có sản phẩm" />
                </Flex>}
                <Spin spinning={loadingProduct}>
                    {dataProducts?.ScGetSmeProducts?.products?.length > 0 && (
                        <VirtualList
                            className="virtual-list-product"
                            data={products?.map((product, index) => ({ ...product, newId: `${product?.id}-${index}` }))}
                            height={contentMessHeight}
                            itemHeight={contentMessHeight / 6}
                            itemKey="newId"
                            onScroll={onLoadMoreProduct}
                        >
                            {(item: any) => {
                                let imgProduct = "";
                                const isProductChecked = ids?.some(id => id == item?.ref_id);
                                let imgOrigin = (item?.productAssets || []).find(_asset => _asset.type == 4)

                                if (!!imgOrigin && !!imgOrigin.template_image_url) {
                                    imgProduct = imgOrigin?.sme_url || imgOrigin?.ref_url
                                } else {
                                    let _asset = minBy(item?.productAssets?.filter(_asset => _asset.type == 1), 'position') as any;
                                    if (!!_asset) {
                                        imgProduct = _asset?.sme_url || _asset?.ref_url
                                    }
                                }

                                const sortPriceVariants = sortBy(item?.productVariants || [], 'price')?.map(variant => `${formatNumberToCurrency(variant?.price)}đ`);
                                const variantsRemoveDuplicate = sortPriceVariants.filter((item, index) => sortPriceVariants.indexOf(item) === index);
                                const priceVariant = item?.productVariantAttributes?.length > 0
                                    ? (variantsRemoveDuplicate?.length > 1 ? [sortPriceVariants[0], sortPriceVariants[sortPriceVariants?.length - 1]]?.join(' - ') : sortPriceVariants[0])
                                    : `${formatNumberToCurrency(item?.price)}đ`

                                return (
                                    <List.Item key={item.id}>
                                        <Spin spinning={item.id == currentLoadProduct}>
                                            <Row align="middle">
                                                <Col span={2}>
                                                    <Checkbox
                                                        checked={isProductChecked}
                                                        disabled={!isProductChecked && ids?.length > (MAX_PRODUCTS - 1)}
                                                        onChange={() => {
                                                            setIds(prev => isProductChecked
                                                                ? prev.filter(id => id != item?.ref_id)
                                                                : prev.concat(item?.ref_id)
                                                            )
                                                        }}
                                                    />
                                                </Col>
                                                <Col span={17} style={{ paddingRight: 10 }}>
                                                    <Row gutter={8} align="middle">
                                                        <Col span={5}>
                                                            <Image
                                                                className="image-product cursor-pointer"
                                                                preview={false}
                                                                onClick={() => window.open(item?.ref_url || '', '_blank')}
                                                                src={imgProduct}
                                                            />
                                                        </Col>
                                                        <Col span={19}>
                                                            <Flex vertical className="text-wrapper">
                                                                <Tooltip title={item?.name} placement="bottom">
                                                                    <Paragraph
                                                                        className="cursor-pointer"
                                                                        ellipsis={{ rows: 2 }}
                                                                        onClick={() => window.open(item?.ref_url || '', '_blank')}
                                                                    >
                                                                        {item?.name}
                                                                    </Paragraph>
                                                                </Tooltip>
                                                                {!!item?.sku && <Flex align="center" gap={4}>
                                                                    <img
                                                                        className="icon-sku"
                                                                        src={SkuIcon}
                                                                    />
                                                                    <Paragraph type="secondary" className="text-sub" style={{ margin: 0 }} ellipsis={{ rows: 2 }}>
                                                                        {item?.sku}
                                                                    </Paragraph>
                                                                </Flex>}
                                                                <Text className="color-base">{priceVariant}</Text>
                                                            </Flex>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                <Col span={5}>
                                                    <Flex vertical gap={10} align="center">
                                                        <Button
                                                            type="primary"
                                                            className="w-100"
                                                            onClick={() => onSendProduct([item?.ref_id])}
                                                            disabled={!hasPermissionAction(['customer_service_chat_action'])}
                                                        >
                                                            Gửi
                                                        </Button>
                                                        <Flex gap={6}>
                                                            <Tooltip placement="bottom" title="Tải lại sản phẩm">
                                                                <ReloadOutlined
                                                                    onClick={() => onReloadProduct(item?.id)}
                                                                    className="color-base cursor-pointer"
                                                                />
                                                            </Tooltip>
                                                            <Text className="text-small">Tồn: {formatNumberToCurrency(item?.sum_stock_on_hand)}</Text>
                                                        </Flex>
                                                    </Flex>
                                                </Col>
                                            </Row>
                                        </Spin>
                                        <Divider />
                                    </List.Item>
                                )
                            }}
                        </VirtualList>
                    )}
                    {loading && <Flex justify="center">
                        <Spin style={{ position: 'fixed', bottom: 60 }} />
                    </Flex>}
                </Spin>
            </div>
            {dataProducts?.ScGetSmeProducts?.products?.length > 0 && (
                <Flex justify="space-between" align="center" className="product-bottom">
                    <Text><Text type="danger">{ids?.length}</Text>/{MAX_PRODUCTS} sản phẩm đã chọn</Text>
                    <Flex gap={10}>
                        <Button onClick={() => setIds([])}>Hủy</Button>
                        <Button
                            type="primary"
                            disabled={ids?.length == 0}
                            onClick={() => onSendProduct(ids)}
                        >
                            Gửi
                        </Button>
                    </Flex>
                </Flex>
            )}
        </InfoProductWrapper>
    )
};

export default memo(InfoProduct);