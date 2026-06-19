import React, { useLayoutEffect } from 'react'
import { useLayoutContext } from 'app/contexts/LayoutContext'
import { Helmet } from 'react-helmet-async'
import { useJobDetail } from './hooks/useJobDetail'
import { PROCESS_STATUS } from './constants/constants'
import JobDetailPageSkeleton from './sections/JobDetailPageSkeleton'
import JobDetailLayout from './StatusJob/JobDetailLayout'

export const JobDetail = () => {
    const { appendBreadcrumb } = useLayoutContext()
    useLayoutEffect(() => {
        appendBreadcrumb([
            {
                title: 'Quản lý tiếp thị liên kết',
                pathname: '/campaign-manage',
            },
            {
                title: 'Chi tiết job',
                pathname: '/campaign-manage/job/:id',
            },
        ])
    }, [])

    const {
        jobDetailData,
        jobDetailLoading,
        refetchJobDetail,
        performancesData,
        performancesLoading,
        orderDetailData,
        orderDetailLoading,
        approvedVideoMediaData,
        approvedVideoMediaLoading,
    } = useJobDetail()

    const status = jobDetailData?.status
    const hasDemoApproval = jobDetailData?.hasDemoApproval === 1
    const hasVideoCount = (jobDetailData?.videoCount ?? 0) > 0
    const hasAirSubmission = jobDetailData?.jobSubmissions?.some((s) => s?.type === 'air')
    const hasJobSubmissions = (jobDetailData?.jobSubmissions?.length ?? 0) > 0
    const showPageSkeleton = jobDetailLoading && !jobDetailData

    const sharedProps = {
        jobDetailData,
        jobDetailLoading,
        refetchJobDetail,
        performancesData,
        performancesLoading,
    }

    const sharedOrderProps = {
        ...sharedProps,
        orderDetailData,
        orderDetailLoading,
        approvedVideoMediaData,
        approvedVideoMediaLoading,
    }

    const renderContent = () => {
        switch (status) {
            // Chỉ có CampaignInfo + ProcessStatus + ProductInfo + AdvertisingFormat
            case PROCESS_STATUS.PENDING:
                return (
                    <JobDetailLayout
                        {...sharedProps}
                        showAdvertisingFormat
                        showOrderInfo
                    />
                )

            // Thêm OrderInfo, hiện ReviewDemoScript khi PENDING_POSTING
            case PROCESS_STATUS.PENDING_SHIPMENT:
            case PROCESS_STATUS.SHIPPING_IN_PROGRESS:
            case PROCESS_STATUS.PENDING_POSTING:
                return (
                    <JobDetailLayout
                        {...sharedOrderProps}
                        showAdvertisingFormat
                        showOrderInfo
                        showReviewDemoScript={
                            status === PROCESS_STATUS.PENDING_POSTING && hasJobSubmissions
                        }
                    />
                )

            // Thêm ReviewDemoScript (khi có demo + video) và ReviewAir (khi có air submission)
            case PROCESS_STATUS.PENDING_REVIEW:
            case PROCESS_STATUS.PENDING_AIRING:
                return (
                    <JobDetailLayout
                        {...sharedOrderProps}
                        showAdvertisingFormat
                        showOrderInfo
                        showReviewDemoScript={hasDemoApproval && hasVideoCount}
                        showReviewAir={hasAirSubmission}
                    />
                )

            // Luôn hiển thị cả ReviewDemoScript và ReviewAir (khi có demo)
            case PROCESS_STATUS.PENDING_ACCEPTANCE:
            case PROCESS_STATUS.COMPLETED:
                return (
                    <JobDetailLayout
                        {...sharedOrderProps}
                        showAdvertisingFormat
                        showOrderInfo
                        showReviewDemoScript={hasDemoApproval}
                        showReviewAir
                    />
                )

            // Chỉ ProcessStatus + ProductInfo, không có AdvertisingFormat
            case PROCESS_STATUS.CANCELLED:
                return <JobDetailLayout {...sharedProps} />

            default:
                return null
        }
    }

    return (
        <>
            <Helmet titleTemplate="Chi tiết job" defaultTitle="Chi tiết job">
                <meta name="description" content="Chi tiết job" />
            </Helmet>
            {showPageSkeleton ? <JobDetailPageSkeleton /> : renderContent()}
        </>
    )
}