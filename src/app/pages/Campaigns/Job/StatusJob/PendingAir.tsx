// Không sử dụng
import React from 'react'
import { Flex, Row, Col } from 'antd'
import { CampaignInfo, ProcessStatus, ProductInfo, AdvertisingFormat, CreatorPerformance } from '../sections'
import OrderInfo from '../sections/OrderInfo'
import type { PendingShipmentProps } from './types'
import ReviewDemoScript from '../sections/ReviewDemoScript'
import ReviewAir from '../sections/ReviewAir'

const PendingAir = ({
    jobDetailData,
    jobDetailLoading,
    refetchJobDetail,
    orderDetailData,
    orderDetailLoading,
    performancesData,
    performancesLoading,
    approvedVideoMediaData,
    approvedVideoMediaLoading,
}: PendingShipmentProps) => {

    return (
        <Flex vertical gap={16}>
            <CampaignInfo campaignStore={jobDetailData?.campaignStore} loading={jobDetailLoading} jobDetail={jobDetailData} />
            <Row gutter={[16, 16]}>
                <Col span={18} >
                    <Flex vertical gap={16}>
                        <ProcessStatus
                            status={jobDetailData?.status}
                            hasDemoApproval={jobDetailData?.hasDemoApproval}
                            loading={jobDetailLoading}
                            jobDetail={jobDetailData}
                        />
                        <ProductInfo
                            campaignSampleRequest={jobDetailData?.campaignSampleRequest}
                            jobStatus={jobDetailData?.status}
                            loading={jobDetailLoading}
                            onCompleted={refetchJobDetail}
                        />
                        <AdvertisingFormat
                            jobProducts={jobDetailData?.jobProducts}
                            videoCount={jobDetailData?.videoCount}
                            liveSessionCount={jobDetailData?.liveSessionCount}
                            loading={jobDetailLoading}
                        />
                        <OrderInfo
                            orderInfo={orderDetailData?.findOrderByIds?.[0]}
                            sampleItems={jobDetailData?.campaignSampleRequest?.items}
                            loading={orderDetailLoading}
                        />
                        {jobDetailData?.hasDemoApproval === 1 && <ReviewDemoScript approvedVideoMedia={approvedVideoMediaData} loading={approvedVideoMediaLoading} jobStatus={jobDetailData?.status} />}
                        <ReviewAir approvedVideoMedia={approvedVideoMediaData} loading={approvedVideoMediaLoading} jobStatus={jobDetailData?.status} />
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

export default PendingAir
