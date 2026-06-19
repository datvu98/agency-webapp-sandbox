import { CheckCircleFilled, ClockCircleOutlined, LeftOutlined, LinkOutlined, RightOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Divider, Flex, Image, Skeleton, Tag, Typography } from 'antd'
import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import TikTokEmbed from 'app/pages/Campaigns/components/TikTokEmbed'
import VideoThumbnail from '../../components/VideoThumbnail'
import ApprovedAirModal from './ApprovedAirModal'
import ApproveAirHistoryModal from './ApproveAirHistoryModal'
import CopyText from '../../components/CopyText'
import { PopupScrollArea, ReviewAirSlideWrapper } from '../../Campaign.styles'
import { useApprovedAir } from '../hooks/useApprovedAir'
import { PROCESS_STATUS } from '../constants/constants'
import { ApprovedLiveMediaItem, ApprovedVideoMediaItem, JobSubmissionRef } from '../../types/CampaignJobDetail.type'
import { SUBMISSION_STATUS } from '../helpers/approvedView.helpers'

export interface ReviewDemoScriptProps {
    approvedVideoMedia?: ApprovedVideoMediaItem[] | null
    jobStatus?: string | null
    loading?: boolean | null
    jobSubmissions?: JobSubmissionRef[] | null
}

const { Text } = Typography
const NO_DATA = '--'
const LIVE_VISIBLE_COUNT = 2
const AIR_SUBMISSION_TYPE = 'air'

const ReviewAir = ({ jobStatus, loading, jobSubmissions }: ReviewDemoScriptProps) => {
    const { id } = useParams()
    const jobId = Number(id)

    const { approvedVideoMediaDataAir, approvedVideoMediaAirLoading, approvedLiveMediaData,
        approvedAirMediaLoading, jobDetailApproveAirLive, jobDetailApproveAirLiveLoading,
        getPreviousSubmissions, previousSubmissionsData, previousSubmissionsLoading,
        previousSubmissionsResponse, previousSubmissionsJobProducts, checkAddShowcase } = useApprovedAir()

    const [approvedModalOpen, setApprovedModalOpen] = useState(false)
    const [historyModalOpen, setHistoryModalOpen] = useState(false)
    const [liveProductStartIndex, setLiveProductStartIndex] = useState(0)
    const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)
    const [animKey, setAnimKey] = useState(0)

    const mediaVideoItems = (approvedVideoMediaDataAir ?? []) as ApprovedVideoMediaItem[]

    const liveBlocks = (approvedLiveMediaData ?? []) as ApprovedLiveMediaItem[]

    const liveProducts = useMemo(() => {
        const productMap = new Map<number, NonNullable<ApprovedLiveMediaItem['products']>[number]>()
        liveBlocks.forEach((block) => {
            (block?.products ?? []).forEach((product) => {
                const productId = product?.jobProductId
                if (productId == null) return
                if (!productMap.has(productId)) {
                    productMap.set(productId, product)
                }
            })
        })
        const mappedFromLiveBlocks = Array.from(productMap.values())
        if (mappedFromLiveBlocks.length > 0) return mappedFromLiveBlocks

        return mediaVideoItems.map((item, index) => ({
            jobProductId: item?.jobProductId ?? index,
            productName: item?.productName ?? null,
            productImage: item?.productImage ?? null,
            requiredLiveSessionCount: null,
            variants: item?.variants?.map((variant) => ({
                variantName: variant?.variantName ?? null,
                quantityPurchased: variant?.quantityPurchased ?? null,
            })) ?? [],
        }))
    }, [liveBlocks, mediaVideoItems])

    const totalPages = Math.ceil(liveProducts.length / LIVE_VISIBLE_COUNT)
    const maxLiveProductStartIndex = Math.max((totalPages - 1) * LIVE_VISIBLE_COUNT, 0)
    const safeLiveProductStartIndex = Math.min(Math.max(liveProductStartIndex, 0), maxLiveProductStartIndex)
    const visibleLiveProducts = liveProducts.slice(
        safeLiveProductStartIndex,
        safeLiveProductStartIndex + LIVE_VISIBLE_COUNT
    )
    const showLiveProductNavigation = liveProducts.length > LIVE_VISIBLE_COUNT

    const isShowHistoryButton = jobSubmissions?.some((submission) => submission?.status !== SUBMISSION_STATUS.PENDING && submission?.type === AIR_SUBMISSION_TYPE)

    if (loading || approvedVideoMediaAirLoading || approvedAirMediaLoading || jobDetailApproveAirLiveLoading) {
        return (
            <Card>
                <Flex vertical gap={16}>
                    <Skeleton active paragraph={{ rows: 3 }} title={false} />
                </Flex>
            </Card>
        )
    }

    return (
        <Card>
            <Flex vertical gap={16}>
                <Flex align="center" wrap="wrap" gap={8}>
                    <Text strong style={{ fontSize: 16 }}>Duyệt nghiệm thu</Text>
                    <Divider type="vertical" />
                    <Text type="secondary" style={{ fontSize: 13 }}>{mediaVideoItems?.[0]?.totalVideoCount ?? '--'} video & {jobDetailApproveAirLive?.liveSessionCount ?? '--'} livestream</Text>
                </Flex>
                {isShowHistoryButton && <Button
                    type="link"
                    style={{ padding: 0, margin: 0, width: 'fit-content' }}
                    onClick={() => {
                        if (!jobId || Number.isNaN(jobId)) return
                        setHistoryModalOpen(true)
                        void getPreviousSubmissions({ variables: { jobId, type: AIR_SUBMISSION_TYPE } })
                    }}
                >
                    <Flex align="center" gap={8}>
                        <ClockCircleOutlined style={{ color: '#ff5722' }} />
                        <Text style={{ color: '#ff5722' }}>Xem lịch sử duyệt nghiệm thu</Text>
                    </Flex>
                </Button>}

                {(mediaVideoItems?.[0]?.totalVideoCount ?? 0) > 0 && <Flex vertical >
                    <Flex align='center' gap={16} style={{ padding: '10px 16px', backgroundColor: '#F0F0F0', borderTopLeftRadius: 6, borderTopRightRadius: 6 }}>
                        <Text strong>Video</Text>
                        <Divider type="vertical" />
                        <Text type="secondary" style={{ fontSize: 13 }}>Số lượng video đi theo sản phẩm </Text>

                    </Flex>
                    <Flex vertical gap={32} style={{ backgroundColor: '#fafafa', padding: 16, borderBottomLeftRadius: 6, borderBottomRightRadius: 6 }}>
                        {mediaVideoItems.map((item, index) => {
                            const isShowcaseWarning = checkAddShowcase.some((showcase) => showcase?.id === item?.campaignProductId)
                            return (
                                <Flex vertical gap={12}>
                                    <Flex align="center" gap={8}>
                                        <Text strong >Sản phẩm {index + 1}</Text>
                                        <Divider type="vertical" />
                                        <Text type="secondary" style={{ fontSize: 12 }}>Mỗi sản phẩm cần trả {item?.requiredVideoCount ?? '--'} video </Text>
                                    </Flex>

                                    <Flex align='flex-start' justify='flex-start' gap={8}>
                                        <Image src={item?.productImage ?? undefined} alt="product" width={50} height={50} style={{ borderRadius: 4, objectFit: 'cover', boxShadow: '0 4px 10px rgba(97, 97, 97, 0.1)' }} />
                                        <Flex vertical gap={4}>
                                            <Text>{item?.productName ?? '--'}</Text>
                                            <Flex gap={2} wrap="wrap" align='center'>
                                                {item?.variants?.map((variant) => (
                                                    <Tag key={variant?.id} style={{ fontSize: 12, width: 'fit-content' }}>{variant?.variantName ?? '--'}</Tag>
                                                ))}
                                            </Flex>
                                        </Flex>
                                    </Flex>

                                    {isShowcaseWarning ? <Alert
                                        closable
                                        type='warning'
                                        message='Lưu ý: Hiện tại Affiliate Hub chưa ghi nhận Nhà sáng tạo đã thêm sản phẩm này vào trang trưng bày, giữ liệu giỏ hàng có thể không được đồng bộ đầy đủ. Vui lòng nhắc nhở Nhà sáng tạo thực hiện để ghi nhận hoa hồng chính xác.'
                                        showIcon
                                    /> : null}

                                    <Flex vertical gap={8} style={{ backgroundColor: '#fff', padding: 16, borderRadius: 6, border: '1px dashed #e0e0e0', minHeight: 150 }}>
                                        <Text type='secondary' style={{ fontSize: 13 }}>{item?.approvedVideoCount ?? '--'}/{item?.requiredVideoCount ?? '--'} video được duyệt</Text>
                                        <Flex gap={10} wrap="wrap">
                                            {(item?.medias ?? []).length > 0 ? (
                                                (item?.medias ?? []).map((media, mediaIndex) => {
                                                    const mediaDemoUrl = media?.demoUrl
                                                    const mediaAirUrl = media?.fullAirUrl
                                                    const mediaRenderUrl = mediaDemoUrl ?? mediaAirUrl
                                                    const mediaType = (media?.type ?? '').toLowerCase()
                                                    if (!mediaRenderUrl) return null

                                                    if (mediaType === 'image') {
                                                        return (
                                                            <img
                                                                key={media?.id ?? `${item?.jobProductId}-${mediaIndex}`}
                                                                src={mediaRenderUrl}
                                                                alt="media"
                                                                width={90}
                                                                height={120}
                                                                style={{ borderRadius: 6, objectFit: 'cover', background: '#000' }}
                                                            />
                                                        )
                                                    }

                                                    return (
                                                        <Flex vertical>
                                                            <TikTokEmbed
                                                                key={media?.id ?? `${item?.jobProductId}-${mediaIndex}`}
                                                                url={mediaAirUrl ?? undefined}
                                                                style={{ width: 90, height: 120, background: '#000', borderRadius: 6, overflow: 'hidden' }}
                                                            />
                                                            {mediaAirUrl ? (
                                                                <Button type='link' style={{ padding: 0, margin: 0, width: 'fit-content' }} href={mediaAirUrl} target='_blank'>Link</Button>
                                                            ) : null}
                                                            <CopyText text={media?.advertisingCode ?? '--'} hideIcon={media?.advertisingCode ? false : true}>
                                                                <Text ellipsis={{ tooltip: { title: 'Mã quảng cáo' } }} style={{}}>{media?.advertisingCode ?? 'Mã quảng cáo: --'}</Text>
                                                            </CopyText>
                                                        </Flex>
                                                    )
                                                })
                                            ) : (
                                                <Text type='secondary'>{ }</Text>
                                            )}
                                        </Flex>
                                    </Flex>
                                </Flex>
                            )
                        })}
                    </Flex>
                </Flex>}

                {(jobDetailApproveAirLive?.liveSessionCount ?? 0) > 0 && <Flex vertical >
                    <Flex align='center' gap={16} style={{ padding: '10px 16px', backgroundColor: '#F0F0F0', borderTopLeftRadius: 6, borderTopRightRadius: 6 }}>
                        <Text strong>Livestream</Text>
                        <Divider type="vertical" />
                        <Text type="secondary" style={{ fontSize: 13 }}>Số lượng livestream đi theo số lần live đã yêu cầu </Text>
                    </Flex>
                    <Flex vertical gap={16} style={{ backgroundColor: '#fafafa', padding: 16, borderBottomLeftRadius: 6, borderBottomRightRadius: 6 }}>
                        <PopupScrollArea vertical gap={12} style={{ backgroundColor: '#fff', padding: 16, borderRadius: 6 }}>
                            <Text>Danh sách sản phẩm cần xuất hiện trong livestream</Text>
                            {visibleLiveProducts.length > 0 ? (
                                <div style={{ position: 'relative' }}>
                                    {showLiveProductNavigation && (
                                        <Button
                                            shape="circle"
                                            disabled={safeLiveProductStartIndex <= 0}
                                            onClick={() => {
                                                setSlideDirection('left')
                                                setAnimKey((k) => k + 1)
                                                setLiveProductStartIndex((prev) => Math.max(prev - LIVE_VISIBLE_COUNT, 0))
                                            }}
                                            style={{
                                                position: 'absolute',
                                                left: -35,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                zIndex: 2,
                                                border: 'none',
                                                backgroundColor: '#fff',
                                                boxShadow: '0 4px 10px rgba(97,97,97,0.3)',
                                            }}
                                        >
                                            <LeftOutlined style={{ color: '#646464' }} />
                                        </Button>
                                    )}
                                    {showLiveProductNavigation && (
                                        <Button
                                            shape="circle"
                                            disabled={safeLiveProductStartIndex >= maxLiveProductStartIndex || liveProducts.length === 0}
                                            onClick={() => {
                                                setSlideDirection('right')
                                                setAnimKey((k) => k + 1)
                                                setLiveProductStartIndex((prev) => Math.min(prev + LIVE_VISIBLE_COUNT, maxLiveProductStartIndex))
                                            }}
                                            style={{
                                                position: 'absolute',
                                                right: -35,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                zIndex: 2,
                                                border: 'none',
                                                backgroundColor: '#fff',
                                                boxShadow: '0 4px 10px rgba(97,97,97,0.3)',
                                            }}
                                        >
                                            <RightOutlined style={{ color: '#646464' }} />
                                        </Button>
                                    )}
                                    <ReviewAirSlideWrapper direction={slideDirection} animKey={animKey}>
                                        {visibleLiveProducts.map((product, productIndex) => (
                                            <Flex
                                                key={product?.jobProductId ?? productIndex}
                                                gap={8}
                                                style={{ minHeight: 52, flex: 1, minWidth: 0 }}
                                            >
                                                <Image
                                                    src={product?.productImage ?? undefined}
                                                    alt="product"
                                                    width={50}
                                                    height={50}
                                                    style={{
                                                        borderRadius: 4,
                                                        objectFit: 'cover',
                                                        boxShadow: '0 4px 10px rgba(97,97,97,0.1)',
                                                    }}
                                                />
                                                <Flex vertical gap={4} style={{ minWidth: 0 }}>
                                                    <Text
                                                        ellipsis={{ tooltip: { title: product?.productName ?? '--' } }}
                                                        style={{ width: '100%' }}
                                                    >
                                                        {product?.productName ?? '--'}
                                                    </Text>
                                                    <Flex gap={2} wrap="wrap">
                                                        {product?.variants?.map((variant, variantIndex) => (
                                                            <Tag key={`${product?.jobProductId}-${variantIndex}`} style={{ fontSize: 12 }}>
                                                                {variant?.variantName ?? '--'}
                                                            </Tag>
                                                        ))}
                                                    </Flex>
                                                </Flex>
                                            </Flex>
                                        ))}
                                    </ReviewAirSlideWrapper>
                                </div>
                            ) : (
                                <Text type='secondary'>{NO_DATA}</Text>
                            )}
                        </PopupScrollArea>
                        {liveBlocks.length > 0 ? liveBlocks.map((block, blockIndex) => {
                            const mediaList = block?.medias ?? []
                            return (
                                <Flex key={block?.id ?? blockIndex} vertical gap={12}>
                                    <Flex align='center' gap={16}>
                                        <Text strong>Livestream {Number(block?.index ?? blockIndex)}</Text>
                                        <Tag color='green' style={{ border: 'none' }}>Đã duyệt</Tag>
                                    </Flex>
                                    <Flex vertical gap={8} style={{ position: 'relative', backgroundColor: '#fff', padding: 16, borderRadius: 6, border: '1px dashed #e0e0e0' }}>
                                        <CheckCircleFilled style={{ position: 'absolute', top: 8, right: 8, color: '#52c41a', fontSize: 15 }} />
                                        <Flex align='center' gap={10} wrap="wrap">
                                            {mediaList.length > 0 ? mediaList.map((media, mediaIndex) => {
                                                const mediaUrl = media?.airUrl ?? media?.demoUrl
                                                const mediaType = (media?.type ?? '').toLowerCase()
                                                if (!mediaUrl) return null

                                                if (mediaType === 'image') {
                                                    return (
                                                        <div key={media?.id ?? mediaIndex} style={{ position: 'relative' }}>
                                                            <img
                                                                src={mediaUrl}
                                                                alt="media"
                                                                width={95}
                                                                height={120}
                                                                style={{ borderRadius: 6, objectFit: 'cover', background: '#000' }}
                                                            />
                                                        </div>
                                                    )
                                                }
                                                if (mediaType === 'video') return (
                                                    <VideoThumbnail
                                                        key={media?.id ?? mediaIndex}
                                                        url={mediaUrl}
                                                    />
                                                )
                                                return null
                                            }) : <Text type='secondary'>{NO_DATA}</Text>}
                                        </Flex>
                                        <Flex vertical gap={4}>
                                            {mediaList.length > 0 ? mediaList.map((media) => {
                                                const mediaType = (media?.type ?? '').toLowerCase()
                                                const mediaUrl = media?.airUrl ?? media?.demoUrl
                                                if (!mediaUrl) return null
                                                if (mediaType === 'link') {
                                                    return (
                                                        <Button type='link' style={{ padding: 0, margin: 0, width: 'fit-content', height: 'fit-content' }} href={mediaUrl} target='_blank'>Link</Button>
                                                    )
                                                }
                                                return null
                                            }) : null}
                                        </Flex>

                                        <CopyText text={block?.advertisingCode ?? '--'} hideIcon={false}>
                                            <Text ellipsis={{ tooltip: { title: block?.advertisingCode ?? '--' } }} style={{ width: '100%' }}>Mã quảng cáo: {block?.advertisingCode ?? '--'}</Text>
                                        </CopyText>
                                        {block?.linkDrive ? (
                                            <Flex align='center' gap={4}>
                                                <Button style={{ width: 'fit-content', backgroundColor: '#ECECEC', color: '#000', border: 'none', }}>
                                                    <LinkOutlined />
                                                </Button>
                                                <Text
                                                    style={{ color: '#000', border: '1px solid #ECECEC', padding: 5, paddingLeft: 10, borderRadius: 6, width: '100%' }}
                                                    ellipsis={{ tooltip: { title: block?.linkDrive ?? '--' } }}
                                                >{block?.linkDrive ?? <Text type='secondary'>https://drive.google.com/drive/folders/</Text>}</Text>
                                            </Flex>
                                        ) : null}
                                    </Flex>
                                </Flex>
                            )
                        }) : <Text type='secondary'>0/{jobDetailApproveAirLive?.liveSessionCount} đã duyệt</Text>}
                    </Flex>
                </Flex>}

                <Divider style={{ margin: '0' }} />

                {jobStatus === PROCESS_STATUS.PENDING_ACCEPTANCE ? <Flex justify='flex-end'>
                    <Button
                        style={{ border: '1px solid #ff5629', color: '#ff5629' }}
                        onClick={() => setApprovedModalOpen(true)}
                    >
                        Nghiệm thu
                    </Button>
                </Flex> : null}

                <ApprovedAirModal
                    open={approvedModalOpen}
                    onCancel={() => setApprovedModalOpen(false)}
                    id={jobId}
                />
                <ApproveAirHistoryModal
                    open={historyModalOpen}
                    onCancel={() => setHistoryModalOpen(false)}
                    previousSubmissionsData={previousSubmissionsData}
                    previousSubmissionsLoading={previousSubmissionsLoading}
                    totalVideoCount={previousSubmissionsResponse?.affGetPreviousSubmissions?.data?.videoCount ?? 0}
                    approvedVideoCount={previousSubmissionsResponse?.affGetPreviousSubmissions?.data?.approvedVideoAirCount ?? 0}
                    totalLiveCount={jobDetailApproveAirLive?.liveSessionCount ?? 0}
                    approvedLiveCount={previousSubmissionsResponse?.affGetPreviousSubmissions?.data?.approvedLiveAirCount ?? 0}
                    jobProducts={previousSubmissionsJobProducts}
                />
            </Flex>
        </Card>
    )
}

export default ReviewAir