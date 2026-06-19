import { useQuery } from "@apollo/client";
import { Card, Col, Divider, Flex, Image, Row, Skeleton, Typography } from "antd";
import query_scGetDetailOrder from "graphql/queries/query_scGetDetailOrder";
import query_scProductsByListId from "graphql/queries/query_scProductsByListId";
import { minBy, sortBy } from "lodash";
import React, { Fragment, memo, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { formatNumberToCurrency, renderStatusName } from "utils/helper";

const ProductMessageWrapper = styled.div`
    .ant-card-head {
        min-height: unset;
        padding: 8px 16px;
    }

    .ant-card-body {        
        padding: 8px 16px;
    }

    .ant-card-bordered {
        border: none;
    }

    .ant-card-head-title {
        font-size: 15px;
    }

    .image-product {
        object-fit: contain;
        border-radius: 8px;

        &.ant-skeleton-image {
            width: 100%;
            height: 50px;
        }
    }

    .order-body {
        width: 350px;
    }

    .ant-divider {
        margin: 10px 0px;
    }
`;

const { Text, Paragraph } = Typography;

const ProductMessage = ({ product }) => {
    const { loading: loadingProduct, data: dataProducts } = useQuery(query_scProductsByListId, {
        variables: {
            list_ref_product_id: product?.map(_product => _product?.info?.item_id)
        },
        skip: product?.length == 0,
        fetchPolicy: 'cache-and-network'
    });

    return <ProductMessageWrapper>
        <Card title="Sản phẩm">
            {dataProducts?.scGetSmeProductByListId?.map((product, index) => {
                let imgProduct = "";
                let imgOrigin = (product?.productAssets || []).find(_asset => _asset.type == 4)

                if (!!imgOrigin && !!imgOrigin.template_image_url) {
                    imgProduct = imgOrigin?.sme_url || imgOrigin?.ref_url
                } else {
                    let _asset = minBy(product?.productAssets?.filter(_asset => _asset.type == 1), 'position') as any;
                    if (!!_asset) {
                        imgProduct = _asset?.sme_url || _asset?.ref_url
                    }
                }

                const sortPriceVariants = sortBy(product?.productVariants || [], 'price')?.map(variant => `${formatNumberToCurrency(variant?.price)}đ`);
                const variantsRemoveDuplicate = sortPriceVariants.filter((item, index) => sortPriceVariants.indexOf(item) === index);
                const priceVariant = product?.productVariantAttributes?.length > 0
                    ? (variantsRemoveDuplicate?.length > 1 ? [sortPriceVariants[0], sortPriceVariants[sortPriceVariants?.length - 1]]?.join(' - ') : sortPriceVariants[0])
                    : `${formatNumberToCurrency(product?.price)}đ`

                return (
                    <Fragment>
                        <Row gutter={20} className={loadingProduct ? "order-body" : ""}>
                            <Col span={5}>
                                {loadingProduct && <Skeleton.Image className="image-product" active />}
                                {!loadingProduct && <Image
                                    className="image-product cursor-pointer"
                                    preview={false}
                                    src={imgProduct}
                                    fallback={!imgProduct ? "data:image/png;base64,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" : ""}
                                    onClick={() => window.open(product?.ref_url || '', '_blank')}
                                />}
                            </Col>
                            <Col span={19} className="order-right">
                                {loadingProduct && <Skeleton title={false} paragraph active />}
                                {!loadingProduct && <Fragment>
                                    <Flex vertical gap={2}>
                                        <Paragraph
                                            className="cursor-pointer"
                                            style={{ margin: 0 }}
                                            ellipsis={{ rows: 2 }}
                                            onClick={() => window.open(product?.ref_url || '', '_blank')}
                                        >
                                            {product?.name}
                                        </Paragraph>
                                        <Text className="color-base" style={{ fontWeight: 'bold' }}>{priceVariant}</Text>
                                    </Flex>
                                </Fragment>}
                            </Col>
                        </Row>
                        {index != dataProducts?.scGetSmeProductByListId?.length - 1 && <Divider />}
                    </Fragment>
                )
            })}
        </Card>
    </ProductMessageWrapper>
};

export default memo(ProductMessage);