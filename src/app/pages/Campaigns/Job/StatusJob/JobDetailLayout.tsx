import React from 'react'
import { Flex, Row, Col } from 'antd'
import { CampaignInfo, ProcessStatus, ProductInfo, AdvertisingFormat, CreatorPerformance } from '../sections'
import OrderInfo from '../sections/OrderInfo'
import ReviewDemoScript from '../sections/ReviewDemoScript'
import ReviewAir from '../sections/ReviewAir'
import type { PendingShipmentProps } from './types'

interface JobDetailLayoutProps extends PendingShipmentProps {
    showAdvertisingFormat?: boolean
    showOrderInfo?: boolean
    showReviewDemoScript?: boolean
    showReviewAir?: boolean
}

const JobDetailLayout = ({
    jobDetailData,
    jobDetailLoading,
    refetchJobDetail,
    orderDetailData,
    orderDetailLoading,
    performancesData,
    performancesLoading,
    approvedVideoMediaData,
    approvedVideoMediaLoading,
    showAdvertisingFormat = false,
    showOrderInfo = false,
    showReviewDemoScript = false,
    showReviewAir = false,
}: JobDetailLayoutProps) => {
    return (
        <Flex vertical gap={16}>
            <CampaignInfo
                campaignStore={jobDetailData?.campaignStore}
                loading={jobDetailLoading}
                jobDetail={jobDetailData}
            />
            <Row gutter={[16, 16]}>
                <Col span={18}>
                    <Flex vertical gap={16}>
                        <ProcessStatus
                            status={jobDetailData?.status}
                            loading={jobDetailLoading}
                            jobDetail={jobDetailData}
                            hasDemoApproval={jobDetailData?.hasDemoApproval}
                        />
                        <ProductInfo
                            campaignSampleRequest={jobDetailData?.campaignSampleRequest}
                            loading={jobDetailLoading}
                            onCompleted={refetchJobDetail}
                            jobStatus={jobDetailData?.status}
                        />
                        {showAdvertisingFormat && (
                            <AdvertisingFormat
                                jobProducts={jobDetailData?.jobProducts}
                                videoCount={jobDetailData?.videoCount}
                                liveSessionCount={jobDetailData?.liveSessionCount}
                                loading={jobDetailLoading}
                                jobStatus={jobDetailData?.status}
                            />
                        )}
                        {showOrderInfo && (
                            <OrderInfo
                                orderInfo={orderDetailData?.findOrderByIds?.[0]}
                                sampleItems={jobDetailData?.campaignSampleRequest?.items}
                                loading={orderDetailLoading}
                                jobStatus={jobDetailData?.status}
                            />
                        )}
                        {showReviewDemoScript && (
                            <ReviewDemoScript
                                approvedVideoMedia={approvedVideoMediaData}
                                loading={approvedVideoMediaLoading}
                                jobStatus={jobDetailData?.status}
                            />
                        )}
                        {showReviewAir && (
                            <ReviewAir
                                approvedVideoMedia={approvedVideoMediaData}
                                loading={approvedVideoMediaLoading}
                                jobStatus={jobDetailData?.status}
                                jobSubmissions={jobDetailData?.jobSubmissions}
                            />
                        )}
                    </Flex>
                </Col>
                <Col span={6}>
                    <CreatorPerformance
                        performancesData={performancesData}
                        performancesLoading={performancesLoading}
                        jobDetailData={jobDetailData}
                        jobDetailLoading={jobDetailLoading}
                    />
                </Col>
            </Row>
        </Flex>
    )
}

export default JobDetailLayout
