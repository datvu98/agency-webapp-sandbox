import { ClockCircleOutlined } from '@ant-design/icons'
import { Button, Card, Divider, Flex, Skeleton, Tag, Typography } from 'antd'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import VideoThumbnail from '../../components/VideoThumbnail'
import ApprovedModal from './ApprovedModal'
import ApprovedHistoryModal from './ApprovedHistoryModal'
import { useApprovedAssets } from '../hooks/useApprovedAssets'
import { PROCESS_STATUS } from '../constants/constants'

interface ApprovedVideoMedia {
    approvedVideoCount: number | null
    jobProductId: number | null
    medias: {
        id?: number | null
        demoUrl: string | null
        airUrl: string | null
        type: string | null
    }[] | null
    productImage: string | null
    productName: string | null
    requiredVideoCount: number | null
    scProductId: number | null
    totalVideoCount: number | null
    variants: {
        id: number | null
        quantityPurchased: number | null
        scVariantId: number | null
        variantImage: string | null
        variantName: string | null
        variantSku: string | null
    }[] | null
}

export interface ReviewDemoScriptProps {
    approvedVideoMedia?: ApprovedVideoMedia[] | null
    jobStatus?: string | null
    loading?: boolean | null
}

const { Text } = Typography
const NO_DATA = '--'

const ReviewDemoScript = ({ approvedVideoMedia, jobStatus, loading }: ReviewDemoScriptProps) => {
    const { id } = useParams()
    const jobId = Number(id)

    const {
        getApprovedAssets,
        approvedAssetsData,
        getPreviousSubmissions,
        previousSubmissionsData,
        previousSubmissionsLoading,
        previousSubmissionsTotalVideoCount,
        previousSubmissionsApprovedVideoCount,
    } = useApprovedAssets()

    const [approvedModalOpen, setApprovedModalOpen] = useState(false)
    const [historyModalOpen, setHistoryModalOpen] = useState(false)

    useEffect(() => {
        if (!approvedModalOpen) return
        void getApprovedAssets()
    }, [approvedModalOpen, getApprovedAssets])

    if (loading) {
        return (
            <Card>
                <Flex vertical gap={16}>
                    <Skeleton active paragraph={{ rows: 3 }} title={false} />
                </Flex>
            </Card>
        )
    }

    const mediaItems = approvedVideoMedia ?? []
    const hasApprovedVideoHistory = mediaItems.some((item) => (item?.approvedVideoCount ?? 0) >= 1)

    return (
        <Card>
            <Flex vertical gap={16}>
                <Flex align="center" wrap="wrap" gap={8}>
                    <Text strong style={{ fontSize: 16 }}>Duyệt demo</Text>
                    <Divider type="vertical" />
                    <Text type="secondary" style={{ fontSize: 13 }}>{mediaItems?.[0]?.totalVideoCount ?? '--'} video</Text>
                </Flex>

                <Divider style={{ margin: '0' }} />

                {hasApprovedVideoHistory && <Button
                    type="link"
                    style={{ padding: 0, margin: 0, width: 'fit-content' }}
                    onClick={() => {
                        setHistoryModalOpen(true)
                        void getPreviousSubmissions()
                        void getApprovedAssets()
                    }}
                >
                    <Flex align="center" gap={8}>
                        <ClockCircleOutlined style={{ color: '#ff5722' }} />
                        <Text style={{ color: '#ff5722' }}>Xem lịch sử duyệt demo</Text>
                    </Flex>
                </Button>}

                <Flex vertical gap={32} style={{ backgroundColor: '#fafafa', padding: 16, borderRadius: 6 }}>
                    {mediaItems.map((item, index) => (
                        <Flex vertical gap={12}>
                            <Flex align="center" gap={8}>
                                <Text strong >Sản phẩm {index + 1}</Text>
                                <Divider type="vertical" />
                                <Text type="secondary" style={{ fontSize: 12 }}>Mỗi sản phẩm cần trả tối thiểu {item?.requiredVideoCount ?? '--'} video </Text>
                            </Flex>

                            <Flex align='flex-start' justify='flex-start' gap={8}>
                                <img src={item?.productImage ?? undefined} alt="product" width={50} height={50} style={{ borderRadius: 4, objectFit: 'cover', boxShadow: '0 4px 10px rgba(97, 97, 97, 0.1)' }} />
                                <Flex vertical gap={4}>
                                    <Text>{item?.productName ?? '--'}</Text>
                                    <Flex gap={2} wrap="wrap" align='center'>
                                        {item?.variants?.map((variant) => (
                                            <Tag key={variant?.id} style={{ fontSize: 12, width: 'fit-content' }}>{variant?.variantName ?? '--'}</Tag>
                                        ))}
                                    </Flex>
                                </Flex>
                            </Flex>

                            <Flex vertical gap={8} style={{ backgroundColor: '#fff', padding: 16, borderRadius: 6, border: '1px dashed #e0e0e0', minHeight: 150 }}>
                                <Text type='secondary' style={{ fontSize: 13 }}>{item?.approvedVideoCount ?? '--'}/{item?.requiredVideoCount ?? '--'} video được duyệt</Text>
                                <Flex gap={10} wrap="wrap">
                                    {(item?.medias ?? []).length > 0 ? (
                                        (item?.medias ?? []).map((media, mediaIndex) => {
                                            const mediaUrl = media?.demoUrl ?? media?.airUrl
                                            const mediaType = (media?.type ?? '').toLowerCase()
                                            if (!mediaUrl) return null

                                            if (mediaType === 'image') {
                                                return (
                                                    <img
                                                        key={media?.id ?? `${item?.jobProductId}-${mediaIndex}`}
                                                        src={mediaUrl}
                                                        alt="media"
                                                        width={90}
                                                        height={120}
                                                        style={{ borderRadius: 6, objectFit: 'cover', background: '#000' }}
                                                    />
                                                )
                                            }

                                            return (
                                                <VideoThumbnail
                                                    key={media?.id ?? `${item?.jobProductId}-${mediaIndex}`}
                                                    url={mediaUrl}
                                                    showCheck
                                                />
                                            )
                                        })
                                    ) : (
                                        <Text type='secondary'>{ }</Text>
                                    )}
                                </Flex>
                            </Flex>
                        </Flex>
                    ))}
                </Flex>

                <Divider style={{ margin: '0' }} />

                {jobStatus === PROCESS_STATUS.PENDING_REVIEW && <Flex justify='flex-end'>
                    <Button
                        style={{ border: '1px solid #ff5629', color: '#ff5629' }}
                        onClick={() => setApprovedModalOpen(true)}
                    >
                        Tiến hành duyệt
                    </Button>
                </Flex>}

                <ApprovedModal
                    id={Number.isNaN(jobId) ? undefined : jobId}
                    open={approvedModalOpen}
                    onCancel={() => setApprovedModalOpen(false)}
                />
                <ApprovedHistoryModal
                    open={historyModalOpen}
                    onCancel={() => setHistoryModalOpen(false)}
                    previousSubmissionsData={previousSubmissionsData}
                    previousSubmissionsLoading={previousSubmissionsLoading}
                    jobProducts={approvedAssetsData?.jobProducts}
                    totalVideoCount={previousSubmissionsTotalVideoCount}
                    approvedVideoCount={previousSubmissionsApprovedVideoCount}
                />
            </Flex>
        </Card>
    )
}

export default ReviewDemoScript