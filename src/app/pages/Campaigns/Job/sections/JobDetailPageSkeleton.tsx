import { Col, Flex, Row } from 'antd'
import React from 'react'
import AdvertisingFormat from './AdvertisingFormat'
import CampaignInfo from './CampaignInfo'
import CreatorPerformance from './CreatorPerformance'
import OrderInfo from './OrderInfo'
import ProcessStatus from './ProcessStatus'
import ProductInfo from './ProductInfo'
import ReviewDemoScript from './ReviewDemoScript'

const JobDetailPageSkeleton = () => {
    return (
        <Flex vertical gap={16}>
            <CampaignInfo loading />
            <Row gutter={[16, 16]}>
                <Col span={18}>
                    <Flex vertical gap={16}>
                        <ProcessStatus loading />
                        <ProductInfo loading />
                        <AdvertisingFormat loading />
                        <OrderInfo loading />
                        <ReviewDemoScript loading />
                    </Flex>
                </Col>
                <Col span={6}>
                    <CreatorPerformance jobDetailLoading performancesLoading />
                </Col>
            </Row>
        </Flex>
    )
}

export default JobDetailPageSkeleton
