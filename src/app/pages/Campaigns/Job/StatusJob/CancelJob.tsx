// Không sử dụng
import React from 'react'
import { CampaignInfo, CreatorPerformance, ProcessStatus, ProductInfo, AdvertisingFormat } from '../sections'
import { Col, Flex, Row } from 'antd'
import type { PendingStatusJobProps } from './types'

const CancelJob = ({
    jobDetailData,
    jobDetailLoading,
    refetchJobDetail,
    performancesData,
    performancesLoading,
}: PendingStatusJobProps) => {

    return (
        <Flex vertical gap={16}>
            <CampaignInfo campaignStore={jobDetailData?.campaignStore} loading={jobDetailLoading} jobDetail={jobDetailData} />
            <Row gutter={[16, 16]}>
                <Col span={18} >
                    <Flex vertical gap={16}>
                        <ProcessStatus status={jobDetailData?.status} loading={jobDetailLoading} jobDetail={jobDetailData} hasDemoApproval={jobDetailData?.hasDemoApproval} />
                        <ProductInfo
                            campaignSampleRequest={jobDetailData?.campaignSampleRequest}
                            loading={jobDetailLoading}
                            onCompleted={refetchJobDetail}
                            jobStatus={jobDetailData?.status}
                        />
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

export default CancelJob