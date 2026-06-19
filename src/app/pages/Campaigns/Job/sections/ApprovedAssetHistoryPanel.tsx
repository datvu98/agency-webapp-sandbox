import React, { useEffect, useMemo } from 'react'
import { Button, Collapse, Drawer, Empty, Flex, Image, Skeleton, Tag, Typography } from 'antd'
import styled from 'styled-components'
import VideoThumbnail from '../../components/VideoThumbnail'
import { JobProductRef } from '../../types/CampaignJobDetail.type'
import { useApprovedAssets } from '../hooks/useApprovedAssets'
import { buildJobProductNameMap, buildRejectReasonLines, groupProductMediaByJobProduct, submissionStatusBadge, SUBMISSION_STATUS } from '../helpers/approvedView.helpers'
import { popupScrollbarCss } from '../../Campaign.styles'
import { CloseOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

interface ApprovedAssetHistoryPanelProps {
  open: boolean
  onClose: () => void
  jobId?: number
  videoIndex?: number | null
  assetType?: 'video' | 'live'
  jobProducts?: JobProductRef[] | null
}

const { Text } = Typography

const ScrollArea = styled(Flex)`
  ${popupScrollbarCss}
`

const renderRejectReason = (reason?: string | null) => {
  return (
    <Flex vertical gap={4}>
      {buildRejectReasonLines(reason).map((line) => (
        <Text key={line.key} style={{ fontSize: 13 }}>
          {line.label ? <Text strong>{line.label}:</Text> : null} {line.content}
        </Text>
      ))}
    </Flex>
  )
}

const ApprovedAssetHistoryPanel = ({
  open,
  onClose,
  jobId,
  videoIndex,
  assetType = 'video',
  jobProducts,
}: ApprovedAssetHistoryPanelProps) => {
  const {
    getPreviousSubmissionAssets,
    previousSubmissionAssetsData,
    previousSubmissionAssetsLoading,
  } = useApprovedAssets(jobId)

  const jobProductNameMap = useMemo(
    () => buildJobProductNameMap(jobProducts),
    [jobProducts],
  )

  useEffect(() => {
    if (!open || videoIndex == null) return
    void getPreviousSubmissionAssets(videoIndex, assetType)
  }, [open, videoIndex, assetType, getPreviousSubmissionAssets])

  const submissions = previousSubmissionAssetsData ?? []

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`Lịch sử duyệt ${assetType === 'live' ? 'Livestream' : 'Video'} ${videoIndex ?? ''}`.trim()}
      placement="right"
      width={520}
      destroyOnClose
      closable={false}
      footer={(
        <Flex justify="flex-end">
          <Button onClick={onClose}>Đóng</Button>
        </Flex>
      )}
      extra={<Button type='link' onClick={onClose} style={{ width: 'fit-content' }} icon={<CloseOutlined style={{ color: '#646464' }}/>} />}
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
            const pairs = groupProductMediaByJobProduct(submission?.productMedia)

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
                      <Text type="secondary">Thời gian: {reviewTime}</Text>
                      {/* <Flex gap={6} wrap="wrap">
                        {pairs.map((row) => (
                          <Tag key={row.jobProductId} style={{ backgroundColor: '#f0f0f0', borderRadius: 6 }}>
                            <Text ellipsis={{ tooltip: jobProductNameMap.get(row.jobProductId) ?? '--' }}>
                              {jobProductNameMap.get(row.jobProductId) ?? '--'}
                            </Text>
                          </Tag>
                        ))}
                      </Flex> */}
                      {(submission?.status ?? '').toLowerCase() === SUBMISSION_STATUS.REJECTED && submission?.rejectReason?.trim() && (
                        <Flex vertical gap={8} style={{ background: '#fff1f0', borderRadius: 8, padding: 10 }}>
                          <Text strong style={{ color: '#cf1322' }}>Lý do</Text>
                          {renderRejectReason(submission.rejectReason)}
                        </Flex>
                      )}
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

export default ApprovedAssetHistoryPanel