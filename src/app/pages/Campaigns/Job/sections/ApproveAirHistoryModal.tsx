import React, { useMemo } from 'react'
import { Button, Collapse, Divider, Flex, Image, Modal, Progress, Skeleton, Tag, Typography } from 'antd'
import styled from 'styled-components'
import { JobProductRef, PreviousSubmission } from '../../types/CampaignJobDetail.type'
import { buildJobProductNameMap, buildRejectReasonLines, submissionStatusBadge, SUBMISSION_STATUS } from '../helpers/approvedView.helpers'
import { popupScrollbarCss } from '../../Campaign.styles'
import TikTokEmbed from 'app/pages/Campaigns/components/TikTokEmbed'
import CopyText from '../../components/CopyText'
import dayjs from 'dayjs'

interface ApproveAirHistoryModalProps {
    open: boolean
    onCancel: () => void
    previousSubmissionsData?: PreviousSubmission[] | null
    previousSubmissionsLoading: boolean
    totalVideoCount?: number | null
    approvedVideoCount?: number | null
    totalLiveCount?: number | null
    approvedLiveCount?: number | null
    jobProducts?: JobProductRef[] | null
}

const { Text } = Typography

const ScrollArea = styled(Flex)`
  ${popupScrollbarCss}
`

const renderRejectReason = (reason?: string | null) => (
    <Flex vertical gap={6}>
        {buildRejectReasonLines(reason).map((line) => (
            <Text key={line.key}> {line.content}</Text>
        ))}
    </Flex>
)

const progressPercent = (approved = 0, total = 0) => (total > 0 ? (approved / total) * 100 : 0)
const DOT_SIZE = 10
const DOT_OFFSET_TOP = 16

const sortByAssetIndexAsc = (assets: any[] = []) =>
    [...assets].sort((a, b) => {
        const indexA = Number(a?.index)
        const indexB = Number(b?.index)
        const safeA = Number.isFinite(indexA) ? indexA : Number.MAX_SAFE_INTEGER
        const safeB = Number.isFinite(indexB) ? indexB : Number.MAX_SAFE_INTEGER
        return safeA - safeB
    })

const getAssetMediaList = (asset: any) => {
    // New air history API returns medias in `submissionMedias`.
    if (Array.isArray(asset?.submissionMedias) && asset.submissionMedias.length > 0) {
        return asset.submissionMedias
    }

    // Backward compatibility with older shape `productMedia[].jobSubmissionMedia`.
    return (asset?.productMedia ?? [])
        .map((item: any) => item?.jobSubmissionMedia)
        .filter(Boolean)
}

const ApproveAirHistoryModal = ({
    open,
    onCancel,
    previousSubmissionsData,
    previousSubmissionsLoading,
    totalVideoCount = 0,
    approvedVideoCount = 0,
    totalLiveCount = 0,
    approvedLiveCount = 0,
    jobProducts,
}: ApproveAirHistoryModalProps) => {
    const submissions = previousSubmissionsData ?? []
    const jobProductNameMap = useMemo(() => buildJobProductNameMap(jobProducts), [jobProducts])

    const getProductName = (productId: number) => {
        return jobProductNameMap.get(productId) ?? '--'
    }

    const totalVideoLiveCount = (totalVideoCount ?? 0) + (totalLiveCount ?? 0)
    const approvedVideoLiveCount = (approvedVideoCount ?? 0) + (approvedLiveCount ?? 0)

    return (
        <>
            <Modal
                open={open}
                onCancel={onCancel}
                title="Lịch sử duyệt nghiệm thu"
                footer={(
                    <Flex justify="flex-end" gap={8} style={{ borderTop: '1px solid #e8e8e8', paddingTop: 10 }}>
                        <Button onClick={onCancel}>Đóng</Button>
                    </Flex>
                )}
                width={620}
                centered
                destroyOnClose
            >
                {previousSubmissionsLoading ? (
                    <Flex vertical gap={12}>
                        <Skeleton active paragraph={{ rows: 3 }} title={false} />
                        <Skeleton active paragraph={{ rows: 4 }} title={false} />
                    </Flex>
                ) : (
                    <ScrollArea vertical gap={12} style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                        <Flex vertical>
                            <Text strong>Tiến trình</Text>
                            <Progress
                                percent={progressPercent(approvedVideoLiveCount ?? 0, totalVideoLiveCount ?? 0)}
                                showInfo={false}
                                strokeColor={progressPercent(approvedVideoLiveCount ?? 0, totalVideoLiveCount ?? 0) === 100 ? '#52c41a' : '#474747'}
                            />
                            <Text color={(approvedVideoLiveCount ?? 0) === (totalVideoLiveCount ?? 0) ? '#389E0D' : '#474747'} style={{ fontSize: 13 }}>{approvedVideoCount ?? 0}/{totalVideoCount ?? 0} video & {approvedLiveCount ?? 0}/{totalLiveCount ?? 0} livestream được duyệt</Text>
                        </Flex>

                        <Flex vertical style={{ marginTop: 8 }}>
                            {submissions.map((submission, submissionIndex) => {
                                const assets = submission?.assets ?? []
                                const approvedCount = assets.filter((asset) => (asset?.status ?? '').toLowerCase() === SUBMISSION_STATUS.APPROVED).length
                                const statusTag = submissionStatusBadge(submission?.status, 'error')
                                const reviewTime = submission?.approvedAt ? dayjs(submission?.approvedAt).format('HH:mm DD/MM/YYYY ') : dayjs(submission?.assets?.[0]?.rejectedAt).format('HH:mm DD/MM/YYYY ')
                                const panelKey = String(submissionIndex + 1)
                                const isLast = submissionIndex === submissions.length - 1

                                return (
                                    <div key={panelKey} style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0, marginRight: 8 }}>
                                            <div style={{
                                                width: 1,
                                                height: DOT_OFFSET_TOP,
                                                backgroundColor: submissionIndex === 0 ? 'transparent' : '#ff4d4f',
                                                flexShrink: 0,
                                            }} />
                                            <div style={{
                                                width: DOT_SIZE,
                                                height: DOT_SIZE,
                                                borderRadius: '50%',
                                                backgroundColor: '#ff4d4f',
                                                flexShrink: 0,
                                            }} />
                                            <div style={{
                                                width: 1,
                                                flex: 1,
                                                backgroundColor: isLast ? 'transparent' : '#ff4d4f',
                                                minHeight: 16,
                                            }} />
                                        </div>

                                        <div style={{ flex: 1, paddingBottom: 8 }}>
                                            <Collapse
                                                defaultActiveKey={submissions.length ? ['1'] : []}
                                                ghost
                                                expandIconPosition="end"
                                                style={{ width: '100%' }}
                                                items={[{
                                                    key: panelKey,
                                                    label: (
                                                        <Flex vertical gap={4}>
                                                            <Flex align="center" gap={8}>
                                                                <Text strong>Duyệt lần {submissions.length - submissionIndex}</Text>
                                                                <Tag color={statusTag.color} style={{ margin: 0, border: 'none' }}>{statusTag.label}</Tag>
                                                            </Flex>
                                                            <Text type="secondary">Thời gian duyệt: {reviewTime}</Text>
                                                            <Text>Tiến độ: {approvedCount}/{assets.length} nội dung được duyệt</Text>
                                                        </Flex>
                                                    ),
                                                    children: (
                                                        <ScrollArea vertical gap={16}>
                                                            {(['video', 'live'] as const).map((currentType) => {
                                                                const assetsByType = sortByAssetIndexAsc(
                                                                    assets.filter((asset) => (asset?.type ?? '').toLowerCase() === currentType)
                                                                )
                                                                if (assetsByType.length === 0) return null

                                                                return (
                                                                    <div>
                                                                        <Text strong style={{ backgroundColor: '#F0F0F0', padding: '10px 12px', borderTopLeftRadius: 8, borderTopRightRadius: 8, display: 'block', fontSize: 15 }}>
                                                                            {currentType === 'video' ? 'Video' : 'Livestream'}
                                                                        </Text>
                                                                        <Flex
                                                                            key={currentType}
                                                                            vertical
                                                                            gap={8}
                                                                            style={{ backgroundColor: '#fafafa', borderRadius: 8, padding: 12, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
                                                                        >
                                                                            {assetsByType.map((asset, idx) => {
                                                                                const assetStatus = submissionStatusBadge(asset?.status, 'error')
                                                                                const assetType = (asset?.type ?? '').toLowerCase()
                                                                                const mediaList = getAssetMediaList(asset)
                                                                                const productIds = Array.from(
                                                                                    new Set(
                                                                                        (asset?.productMedia ?? [])
                                                                                            .map((pm: any) => pm?.jobProductId)
                                                                                            .filter((productId: number | null | undefined) => productId != null)
                                                                                    )
                                                                                ) as number[]
                                                                                const imageUrls = Array.from(
                                                                                    new Set(
                                                                                        mediaList
                                                                                            .filter((item: any) => (item?.type ?? '').toLowerCase() === 'image' && item?.url)
                                                                                            .map((item: any) => item.url)
                                                                                    )
                                                                                ) as string[]
                                                                                const linkUrls = Array.from(
                                                                                    new Set(
                                                                                        mediaList
                                                                                            .filter((item: any) => (item?.type ?? '').toLowerCase() === 'link' && item?.url)
                                                                                            .map((item: any) => item.url)
                                                                                    )
                                                                                ) as string[]
                                                                                const linkAirUrls = Array.from(
                                                                                    new Set(
                                                                                        mediaList
                                                                                            .filter((item: any) => (item?.type ?? '').toLowerCase() === 'link' && item?.fullAirUrl)
                                                                                            .map((item: any) => item.fullAirUrl)
                                                                                    )
                                                                                ) as string[]
                                                                                return (
                                                                                    <Flex key={`${assetType}-${asset?.index ?? idx}-${idx}`} vertical gap={10}>
                                                                                        <Flex align="center" justify="space-between" gap={8}>
                                                                                            <Flex align="center" gap={8}>
                                                                                                <Text strong>{assetType === 'live' ? 'Livestream' : 'Video'} {asset?.index ?? '--'}</Text>
                                                                                                <Tag color={assetStatus.color} style={{ margin: 0, border: 'none' }}>{assetStatus.label}</Tag>
                                                                                            </Flex>
                                                                                        </Flex>

                                                                                        <Flex align='center' gap={6} wrap="wrap">
                                                                                            {productIds.map((productId) => (
                                                                                                <Tag key={`${asset?.index ?? idx}-${productId}`} style={{ backgroundColor: '#d5d5d5', borderRadius: 6 }}>
                                                                                                    <Text ellipsis={{ tooltip: getProductName(productId) }} style={{ maxWidth: 350 }}>
                                                                                                        {getProductName(productId)}
                                                                                                    </Text>
                                                                                                </Tag>
                                                                                            ))}
                                                                                        </Flex>

                                                                                        {imageUrls.length > 0 ? (
                                                                                            <Flex align='center' gap={10}>
                                                                                                {imageUrls.map((imageUrl, imageIdx) => (
                                                                                                    <Image key={`${imageUrl}-${imageIdx}`} src={imageUrl} alt="media" width={90} height={120} style={{ borderRadius: 6, objectFit: 'cover', background: '#000' }} />
                                                                                                ))}
                                                                                            </Flex>
                                                                                        ) : null}

                                                                                        {currentType === 'video' ? (
                                                                                            linkAirUrls.length > 0 ? (
                                                                                                <Flex gap={10} wrap="wrap">
                                                                                                    {linkAirUrls.map((mediaUrl, mediaIdx) => (
                                                                                                        <Flex key={`${mediaUrl}-${mediaIdx}`} vertical gap={8}>
                                                                                                            <TikTokEmbed
                                                                                                                url={mediaUrl}
                                                                                                                style={{ width: 90, height: 120, background: '#000', borderRadius: 6, overflow: 'hidden' }}
                                                                                                            />
                                                                                                            <Button type="link" href={mediaUrl} target="_blank" style={{ width: 'fit-content', padding: 0, margin: 0, height: 'fit-content' }}>
                                                                                                                Link
                                                                                                            </Button>
                                                                                                        </Flex>
                                                                                                    ))}
                                                                                                </Flex>
                                                                                            ) : null
                                                                                        ) : linkUrls.length > 0 ? (
                                                                                            <Flex vertical gap={4}>
                                                                                                {linkUrls.map((mediaUrl, mediaIdx) => (
                                                                                                    <Button key={`${mediaUrl}-${mediaIdx}`} type="link" href={mediaUrl} target="_blank" style={{ width: 'fit-content', padding: 0, margin: 0 }}>
                                                                                                        Link
                                                                                                    </Button>
                                                                                                ))}
                                                                                            </Flex>
                                                                                        ) : null}

                                                                                        <Flex align="center" gap={4}>
                                                                                            <Text>Mã quảng cáo:</Text>
                                                                                            <CopyText text={asset.advertisingCode ?? '--'} hideIcon={false}>
                                                                                                <Text ellipsis={{ tooltip: { title: asset.advertisingCode } }} style={{ width: 'fit-content', maxWidth: 260 }}>
                                                                                                    {asset.advertisingCode ?? '--'}
                                                                                                </Text>
                                                                                            </CopyText>
                                                                                        </Flex>

                                                                                        {(asset?.status ?? '').toLowerCase() === SUBMISSION_STATUS.REJECTED && asset?.rejectReason?.trim() ? (
                                                                                            <Collapse
                                                                                                ghost
                                                                                                size="small"
                                                                                                expandIconPosition="end"
                                                                                                style={{ width: '100%', backgroundColor: '#fff1f0' }}
                                                                                                items={[{
                                                                                                    key: `reason-${assetType}-${asset?.index ?? idx}`,
                                                                                                    label: <Text style={{ color: '#CF1322' }}>Lý do</Text>,
                                                                                                    children: <div>{renderRejectReason(asset.rejectReason)}</div>,
                                                                                                }]}
                                                                                            />
                                                                                        ) : null}

                                                                                        {idx < assetsByType.length - 1 ? <Divider style={{ margin: 0 }} /> : null}
                                                                                    </Flex>
                                                                                )
                                                                            })}
                                                                        </Flex>
                                                                    </div>
                                                                )
                                                            })}
                                                        </ScrollArea>
                                                    ),
                                                }]}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </Flex>
                    </ScrollArea>
                )}
            </Modal>
        </>
    )
}

export default ApproveAirHistoryModal