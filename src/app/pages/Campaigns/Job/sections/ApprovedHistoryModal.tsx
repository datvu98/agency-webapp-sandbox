import React, { useMemo } from 'react'
import { Button, Collapse, Divider, Flex, Image, Modal, Progress, Skeleton, Tag, Typography } from 'antd'
import styled from 'styled-components'
import { JobProductRef, PreviousSubmission, PreviousSubmissionAsset } from '../../types/CampaignJobDetail.type'
import VideoThumbnail from '../../components/VideoThumbnail'
import { buildJobProductNameMap, buildRejectReasonLines, groupProductMediaByJobProduct, submissionStatusBadge, SUBMISSION_STATUS } from '../helpers/approvedView.helpers'
import { popupScrollbarCss } from '../../Campaign.styles'
import dayjs from 'dayjs'
import { sortAssetsByIndexAsc } from '../helpers/approvedModal.helpers'

interface ApprovedHistoryModalProps {
    open: boolean
    onCancel: () => void
    previousSubmissionsData?: PreviousSubmission[] | null
    previousSubmissionsLoading: boolean
    jobProducts?: JobProductRef[] | null
    videoIndex?: number | null
    assetType?: 'video' | 'live'
    totalVideoCount?: number | null
    approvedVideoCount?: number | null
}

const { Text } = Typography

const ScrollArea = styled(Flex)`
    ${popupScrollbarCss}
`

const renderRejectReason = (reason?: string | null) => (
    <Flex vertical gap={6}>
        {buildRejectReasonLines(reason).map((line) => (
            <Text key={line.key}>
                {line.label ? <Text strong>{line.label}:</Text> : null} {line.content}
            </Text>
        ))}
    </Flex>
)

const DOT_SIZE = 10
const DOT_OFFSET_TOP = 16 // căn dot thẳng với dòng tiêu đề

const ApprovedHistoryModal = ({
    open,
    onCancel,
    previousSubmissionsData,
    previousSubmissionsLoading,
    jobProducts,
    totalVideoCount,
    approvedVideoCount,
}: ApprovedHistoryModalProps) => {
    const jobProductNameMap = useMemo(() => buildJobProductNameMap(jobProducts), [jobProducts])

    const submissions = previousSubmissionsData ?? []

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            title={"Lịch sử duyệt demo"}
            footer={
                <Flex justify="flex-end" gap={8} style={{ borderTop: '1px solid #e8e8e8', paddingTop: 10 }}>
                    <Button onClick={onCancel}>Đóng</Button>
                </Flex>
            }
            width={600}
            centered
            destroyOnClose
        >
            {previousSubmissionsLoading ? (
                <Flex vertical gap={12}>
                    <Skeleton active paragraph={{ rows: 3 }} title={false} />
                    <Skeleton active paragraph={{ rows: 4 }} title={false} />
                </Flex>
            ) : (
                <ScrollArea vertical gap={12} style={{ maxHeight: '630px', overflowY: 'auto' }}>
                    <Flex vertical style={{ marginTop: 12 }}>
                        <Text strong>Tiến trình tổng quan</Text>
                            <Progress
                                percent={(approvedVideoCount ?? 0) / (totalVideoCount ?? 0) * 100}
                                showInfo={false}
                                strokeColor={
                                    ((approvedVideoCount ?? 0) / (totalVideoCount ?? 0) * 100) === 100
                                        ? "#52c41a"
                                        : "#474747" 
                                }
                            />
                        <Text color={(approvedVideoCount ?? 0) === (totalVideoCount ?? 0) ? '#389E0D' : '#474747'}>{approvedVideoCount ?? 0}/{totalVideoCount ?? 0} video được duyệt</Text>
                    </Flex>

                    <Flex vertical style={{ marginTop: 8 }}>
                        {submissions.map((submission, submissionIndex) => {
                            const assets = sortAssetsByIndexAsc(submission.assets ?? [])
                            const approvedCount = assets.filter((asset) => (asset?.status ?? '').toLowerCase() === SUBMISSION_STATUS.APPROVED).length
                            const statusTag = submissionStatusBadge(submission.status, 'error')
                            const reviewTime = assets?.[0]?.updatedAt ? dayjs(assets?.[0]?.updatedAt).format('HH:mm DD/MM/YYYY ') : ''
                            const panelKey = String(submissionIndex + 1)
                            const isLast = submissionIndex === submissions.length - 1

                            return (
                                <div key={panelKey} style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch' }}>
                                    {/* Cột trái: dot + đường nối */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0, marginRight: 8 }}>
                                        {/* Đường phía trên dot (ẩn ở item đầu tiên) */}
                                        <div style={{
                                            width: 1,
                                            height: DOT_OFFSET_TOP,
                                            backgroundColor: submissionIndex === 0 ? 'transparent' : '#ff4d4f',
                                            flexShrink: 0,
                                        }} />
                                        {/* Dot */}
                                        <div style={{
                                            width: DOT_SIZE,
                                            height: DOT_SIZE,
                                            borderRadius: '50%',
                                            backgroundColor: '#ff4d4f',
                                            flexShrink: 0,
                                        }} />
                                        {/* Đường phía dưới dot (ẩn ở item cuối) */}
                                        <div style={{
                                            width: 1,
                                            flex: 1,
                                            backgroundColor: isLast ? 'transparent' : '#ff4d4f',
                                            minHeight: 16,
                                        }} />
                                    </div>

                                    {/* Cột phải: Collapse */}
                                    <div style={{ flex: 1, paddingBottom: 8 }}>
                                        <Collapse
                                            defaultActiveKey={submissions.length ? ['1'] : []}
                                            ghost
                                            expandIconPosition="end"
                                            style={{ width: '100%' }}
                                            items={[
                                                {
                                                    key: panelKey,
                                                    label: (
                                                        <Flex vertical gap={4}>
                                                            <Flex align="center" gap={8}>
                                                                <Text strong>Duyệt lần {submissions.length - submissionIndex}</Text>
                                                                <Tag color={statusTag.color} style={{ margin: 0 }}>{statusTag.label}</Tag>
                                                            </Flex>
                                                            <Text type="secondary">Thời gian duyệt : {reviewTime}</Text>
                                                            <Text>Tiến độ: {approvedCount}/{assets.length} video được duyệt</Text>
                                                        </Flex>
                                                    ),
                                                    children: (
                                                        <ScrollArea
                                                            vertical
                                                            gap={16}
                                                            style={{
                                                                background: '#fafafa',
                                                                borderRadius: 8,
                                                                padding: 12,
                                                                maxHeight: '52vh',
                                                                overflowY: 'auto',
                                                            }}
                                                        >
                                                            {assets.map((asset: PreviousSubmissionAsset, idx) => {
                                                                const status = submissionStatusBadge(asset?.status, 'error')
                                                                const pairs = groupProductMediaByJobProduct(asset?.productMedia)

                                                                return (
                                                                    <Flex key={`${asset?.index ?? idx}-${idx}`} vertical gap={10}>
                                                                        <Flex align="center" gap={8}>
                                                                            <Text strong>Video {asset?.index ?? '--'}</Text>
                                                                            <Tag color={status.color} style={{ margin: 0, border: 'none' }}>{status.label}</Tag>
                                                                        </Flex>

                                                                        <Flex gap={6} wrap="wrap">
                                                                            {pairs.map((row) => (
                                                                                <Tag key={row.jobProductId} style={{ backgroundColor: '#D9D9D9', borderRadius: 6 }}>
                                                                                    <Text ellipsis={{ tooltip: jobProductNameMap.get(row.jobProductId) ?? '--' }} style={{ maxWidth: 250 }}>{jobProductNameMap.get(row.jobProductId) ?? '--'}</Text>
                                                                                </Tag>
                                                                            ))}
                                                                        </Flex>

                                                                        <Flex gap={10} wrap="wrap">
                                                                            {pairs.map((row) => (
                                                                                <Flex key={row.jobProductId} gap={8}>
                                                                                    <VideoThumbnail url={row.videoUrl} />
                                                                                    {(row.imageUrls?.length ? row.imageUrls : row.imageUrl ? [row.imageUrl] : []).map((imageUrl, imageIdx) => (
                                                                                        <Image
                                                                                            key={`${row.jobProductId}-image-${imageIdx}`}
                                                                                            src={imageUrl}
                                                                                            alt="media"
                                                                                            width={90}
                                                                                            height={120}
                                                                                            style={{ borderRadius: 6, objectFit: 'cover', background: '#000' }}
                                                                                        />
                                                                                    ))}
                                                                                </Flex>
                                                                            ))}
                                                                        </Flex>

                                                                        {(asset?.status ?? '').toLowerCase() === SUBMISSION_STATUS.REJECTED && asset?.rejectReason?.trim() && (
                                                                            <Collapse
                                                                                ghost
                                                                                size="small"
                                                                                expandIconPosition="end"
                                                                                style={{ width: '100%', backgroundColor: '#fff1f0' }}
                                                                                items={[
                                                                                    {
                                                                                        key: `reason-${asset?.index ?? idx}`,
                                                                                        label: <Text style={{ color: '#CF1322' }}>Lý do</Text>,
                                                                                        children: (
                                                                                            <div>
                                                                                                {renderRejectReason(asset.rejectReason)}
                                                                                            </div>
                                                                                        ),
                                                                                    },
                                                                                ]}
                                                                            />
                                                                        )}

                                                                        {idx < assets.length - 1 && <Divider style={{ margin: 0 }} />}
                                                                    </Flex>
                                                                )
                                                            })}
                                                        </ScrollArea>
                                                    ),
                                                },
                                            ]}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </Flex>
                </ScrollArea>
            )}
        </Modal>
    )
}

export default ApprovedHistoryModal