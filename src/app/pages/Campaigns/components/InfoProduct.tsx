import { Flex, Tag, Typography } from 'antd'
import React from 'react'
import { CampaignSampleRequestItem } from '../types/CampaignRegister.type'

const { Text } = Typography

const InfoProduct = ({ productDetail }: { productDetail: CampaignSampleRequestItem }) => {
    return (
        <Flex align='flex-start' gap={12}>
            <img src={productDetail?.variantImage} alt="product" width={60} height={60} style={{ borderRadius: 8, objectFit: 'cover', boxShadow: '0 4px 10px rgba(97, 97, 97, 0.1)', display: 'flexing-shrink: 0' }} />
            <Flex vertical gap={4} align='flex-start' justify='flex-start'>
                <Flex align='center' gap={20}>
                    <Text>{productDetail?.productName}</Text>
                    {productDetail?.quantityPurchased && <Text type="secondary" style={{ whiteSpace: "nowrap", fontSize: 13 }}>x{productDetail?.quantityPurchased}</Text>}
                </Flex>
                {productDetail?.variantName && <Tag> {productDetail?.variantName} </Tag>}
                {productDetail?.variantSku && <Text type="secondary" style={{ whiteSpace: "nowrap", fontSize: 13 }}>SKU: {productDetail?.variantSku}</Text>}
            </Flex>
        </Flex>
    )
}

export default InfoProduct