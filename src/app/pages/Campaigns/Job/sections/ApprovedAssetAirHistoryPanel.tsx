import React, { useEffect } from 'react'
import { Button, Collapse, Drawer, Empty, Flex, Image, Skeleton, Tag, Typography } from 'antd'
import styled from 'styled-components'
import { CloseOutlined } from '@ant-design/icons'
import TikTokEmbed from 'app/pages/Campaigns/components/TikTokEmbed'
import { useApprovedAir } from '../hooks/useApprovedAir'
import { buildRejectReasonLines, submissionStatusBadge, SUBMISSION_STATUS } from '../helpers/approvedView.helpers'
import { popupScrollbarCss } from '../../Campaign.styles'
import dayjs from 'dayjs'

interface ApprovedAssetAirHistoryPanelProps {
  open: boolean
  onClose: () => void
  jobId?: number
  assetIndex?: number | null
  assetType?: 'video' | 'live'
}

const { Text } = Typography

const ScrollArea = styled(Flex)`
  ${popupScrollbarCss}
`

const renderRejectReason = (reason?: string | null) => {
  return (
    <Flex vertical gap={4}>
      {buildRejectReasonLines(reason).map((line) => (
        <Text key={line.key} style={{ fontSize: 13 }}>{line.content}</Text>
      ))}
    </Flex>
  )
}

const ApprovedAssetAirHistoryPanel = ({
  open,
  onClose,
  jobId,
  assetIndex,
  assetType = 'video',
}: ApprovedAssetAirHistoryPanelProps) => {
  const {
    getPreviousSubmissionAssets,
    previousSubmissionAssetsData,
    previousSubmissionAssetsLoading,
  } = useApprovedAir()

  useEffect(() => {
    if (!open || assetIndex == null) return
    void getPreviousSubmissionAssets(assetIndex, assetType, 'air', jobId)
  }, [open, assetIndex, assetType, getPreviousSubmissionAssets, jobId])

  const submissions = previousSubmissionAssetsData ?? []

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`Lịch sử duyệt ${assetType === 'live' ? 'Livestream' : 'Video'} ${assetIndex ?? ''}`.trim()}
      placement="right"
      width={520}
      destroyOnClose
      closable={false}
      footer={(
        <Flex justify="flex-end">
          <Button onClick={onClose}>Đóng</Button>
        </Flex>
      )}
      extra={<Button type="link" onClick={onClose} style={{ width: 'fit-content' }} icon={<CloseOutlined style={{ color: '#646464' }} />} />}
    >
      {previousSubmissionAssetsLoading ? (
        <Flex vertical gap={12}>
          <Skeleton active paragraph={{ rows: 3 }} title={false} />
          <Skeleton active paragraph={{ rows: 3 }} title={false} />
        </Flex>
      ) : submissions.length === 0 ? (
        <Empty description="Chưa có lịch sử duyệt" />
      ) : (
        <ScrollArea vertical gap={12} style={{ maxHeight: '100%', overflowY: 'auto' }}>
          {submissions.map((submission, submissionIndex) => {
            const statusTag = submissionStatusBadge(submission.status, 'error')
            const reviewTime = submission?.status === SUBMISSION_STATUS.APPROVED ? dayjs(submission?.approvedAt).format('HH:mm DD/MM/YYYY') : dayjs(submission?.rejectedAt).format('HH:mm DD/MM/YYYY') ?? '--'
            const mediaItems = submission?.submissionMedias ?? []
            const typeSubmission = submission?.type

            return (
              <Collapse
                key={String(submissionIndex + 1)}
                ghost
                expandIconPosition="end"
                defaultActiveKey={submissionIndex === 0 ? ['1'] : []}
                style={{ backgroundColor: '#fafafa', borderRadius: 8, padding: 12 }}
                items={[{
                  key: '1',
                  label: (
                    <Flex align="center" gap={8}>
                      <Text strong>Duyệt lần {submissions.length - submissionIndex}</Text>
                      <Tag color={statusTag.color} style={{ margin: 0, border: 'none' }}>{statusTag.label}</Tag>
                    </Flex>
                  ),
                  children: (
                    <Flex vertical gap={10}>
                      <Flex gap={10} wrap="wrap">
                        {mediaItems.map((media, mediaIdx) => {
                          const mediaType = (media?.type ?? '').toLowerCase()
                          const mediaUrl = media?.url
                          const mediaAirUrl = media?.fullAirUrl
                          if (typeSubmission === 'live') {
                            if (!mediaUrl) return null
                            return (
                                <Flex key={`${mediaUrl}-${mediaIdx}`} vertical gap={4}>
                                  {mediaType === 'image' && <Image
                                    key={`${mediaUrl}-${mediaIdx}`}
                                    src={mediaUrl}
                                    alt="media"
                                    width={90}
                                    height={120}
                                    style={{ borderRadius: 6, objectFit: 'cover', background: '#000' }}
                                  />}
                                </Flex>
                            )
                          }
                          if (!mediaAirUrl) return null
                          return (
                            <Flex key={`${mediaAirUrl}-${mediaIdx}`} vertical gap={4}>
                              <TikTokEmbed url={mediaAirUrl} style={{ width: 90, height: 120, background: '#000', borderRadius: 6, overflow: 'hidden' }} />
                              <Button type="link" href={mediaAirUrl} target="_blank" style={{ width: 'fit-content', padding: 0, margin: 0, height: 'fit-content' }}>Link</Button>
                            </Flex>
                          )
                        })}
                      </Flex>

                      {typeSubmission === 'live' && (
                        <Flex vertical gap={4}>
                          <Button type="link" href={mediaItems.find((media) => media?.type === 'link')?.url ?? ''} target="_blank" style={{ width: 'fit-content', padding: 0, margin: 0, height: 'fit-content' }}>Link</Button>
                        </Flex>
                      )}

                      <Text type="secondary">Thời gian: {reviewTime}</Text>

                      <Text>Mã quảng cáo: {submission.advertisingCode ?? '--'}</Text>
                      {submission?.linkDrive?.trim() ? (
                        <Button type="link" href={submission.linkDrive} target="_blank" style={{ width: 'fit-content', padding: 0, margin: 0 }}>
                          Link drive
                        </Button>
                      ) : null}
                      {(submission?.status ?? '').toLowerCase() === SUBMISSION_STATUS.REJECTED && submission?.rejectReason?.trim() ? (
                        <Flex vertical gap={8} style={{ background: '#fff1f0', borderRadius: 8, padding: 10 }}>
                          <Text strong style={{ color: '#cf1322' }}>Lý do</Text>
                          {renderRejectReason(submission.rejectReason)}
                        </Flex>
                      ) : null}
                    </Flex>
                  ),
                }]}
              />
            )
          })}
        </ScrollArea>
      )}
    </Drawer>
  )
}

export default ApprovedAssetAirHistoryPanel
