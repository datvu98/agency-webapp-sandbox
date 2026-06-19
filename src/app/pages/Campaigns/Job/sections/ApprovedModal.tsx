import React, { useEffect, useMemo, useState } from 'react'
import { Button, DatePicker, Divider, Flex, Image, message, Modal, Skeleton, Spin, Tag, Tooltip, Typography } from 'antd'
import { ClockCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import type { Dayjs } from 'dayjs'
import GuidedReviewForm, {
  createDefaultFeedback,
  isReviewFeedbackValid,
  type ReviewFeedback,
} from '../../components/GuidedReviewForm'
import VideoThumbnail from '../../components/VideoThumbnail'
import { useApprovedAssets } from '../hooks/useApprovedAssets'
import dayjs from 'dayjs'
import { showAlert } from 'utils/helper'
import { JobSubmissionAssetRef } from '../../types/CampaignJobDetail.type'
import { useJobDetail } from '../hooks/useJobDetail'
import ApprovedAssetHistoryPanel from './ApprovedAssetHistoryPanel'
import ApprovedHistoryModal from './ApprovedHistoryModal'
import { buildJobProductNameMap, groupProductMediaByJobProduct, submissionStatusBadge, SUBMISSION_STATUS } from '../helpers/approvedView.helpers'
import { buildRejectReasonFromFeedback, getAssetKey, sortAssetsByIndexAsc } from '../helpers/approvedModal.helpers'
import { popupScrollbarCss } from '../../Campaign.styles'

export interface ApprovedModalProps {
  id?: number
  open: boolean
  onCancel: () => void
  onApprovedSuccess?: () => Promise<unknown> | void
}

const { Text } = Typography

const ScrollArea = styled(Flex)`
  ${popupScrollbarCss}
`
type ReviewDecision = typeof SUBMISSION_STATUS.APPROVED | typeof SUBMISSION_STATUS.REJECTED
type ReviewItemState = {
  decision?: ReviewDecision
  feedback?: ReviewFeedback
}

const ApprovedModal = ({
  id,
  open,
  onCancel,
  onApprovedSuccess,
}: ApprovedModalProps) => {
  const jobId = typeof id === 'number' && !Number.isNaN(id) ? id : undefined
  const {
    getApprovedAssets,
    approvedAssetsData,
    approvedAssetsLoading,
    submitApproveDemoJobSubmission,
    getPreviousSubmissions,
    previousSubmissionsResponse,
    previousSubmissionsData,
    previousSubmissionsLoading,
    approveDemoJobSubmissionLoading,
    previousSubmissionsTotalVideoCount,
    previousSubmissionsApprovedVideoCount,
  } = useApprovedAssets(jobId)
  const submission = approvedAssetsData?.jobSubmissions?.[0]
  const jobProducts = approvedAssetsData?.jobProducts
  // const assets = submission?.assets ?? []
  const statusBadge = submissionStatusBadge(submission?.status)
  const [reviewByAsset, setReviewByAsset] = useState<Record<string, ReviewItemState>>({})
  const [extensionDeadline, setExtensionDeadline] = useState<Dayjs | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [assetHistoryPanelOpen, setAssetHistoryPanelOpen] = useState(false)
  const [selectedAssetIndex, setSelectedAssetIndex] = useState<number | null>(null)

  const { refetchJobDetail } = useJobDetail()

  const requiredNum = approvedAssetsData?.videoCount ?? 0
  const videoDeadline = approvedAssetsData?.videoDeadline ?? null
  const parsedVideoDeadline = useMemo(
    () => (videoDeadline ? dayjs(String(videoDeadline)) : null),
    [videoDeadline],
  )

  const approvedAssetCount = useMemo(() => {
    return requiredNum - (approvedAssetsData?.jobSubmissions?.[0]?.assets.length ?? 0)
  }, [requiredNum, approvedAssetsData?.jobSubmissions?.[0]?.assets.length])

  const jobProductNameMap = useMemo(
    () => buildJobProductNameMap(jobProducts),
    [jobProducts],
  )

  const isShowHistoryButton = approvedAssetsData?.jobSubmissions?.length > 1

  const mediaRows = useMemo(() => {
    return sortAssetsByIndexAsc(submission?.assets ?? []).map((asset) => ({
      asset,
      pairs: groupProductMediaByJobProduct(asset.productMedia),
    }))
  }, [submission])

  const rowsWithState = useMemo(
    () =>
      mediaRows.map((row, idx) => {
        const key = getAssetKey(row.asset as JobSubmissionAssetRef, idx)
        const state = reviewByAsset[key]
        return {
          ...row,
          idx,
          key,
          state,
          isApproved: state?.decision === SUBMISSION_STATUS.APPROVED,
          isRejected: state?.decision === SUBMISSION_STATUS.REJECTED,
        }
      }),
    [mediaRows, reviewByAsset],
  )

  useEffect(() => {
    if (!open) {
      setReviewByAsset({})
    }
  }, [open])

  useEffect(() => {
    if (!open || !jobId) return
    void getApprovedAssets()
  }, [open, jobId, getApprovedAssets])

  useEffect(() => {
    if (!historyModalOpen || !jobId) return
    void getPreviousSubmissions()
  }, [historyModalOpen, jobId, getPreviousSubmissions])

  const isAllReviewed = useMemo(
    () =>
      rowsWithState.length > 0 &&
      rowsWithState.every(({ state }) => {
        if (!state?.decision) return false
        if (state.decision === SUBMISSION_STATUS.REJECTED) {
          return isReviewFeedbackValid(state.feedback)
        }
        return true
      }),
    [rowsWithState],
  )

  const hasRejectedVideo = useMemo(
    () => rowsWithState.some(({ isRejected }) => isRejected),
    [rowsWithState],
  )
  const hasUnsavedChanges = useMemo(() => {
    if (extensionDeadline) return true

    return Object.values(reviewByAsset).some(({ decision, feedback }) => {
      if (decision) return true
      if (!feedback) return false
      return Object.values(feedback).some((value) => Boolean(value?.trim()))
    })
  }, [extensionDeadline, reviewByAsset])
  const canSubmit = isAllReviewed

  const resetLocalState = () => {
    setReviewByAsset({})
    setExtensionDeadline(null)
    setHistoryModalOpen(false)
    setAssetHistoryPanelOpen(false)
    setSelectedAssetIndex(null)
  }

  const handleRequestClose = () => {
    if (submitting || approveDemoJobSubmissionLoading) return

    if (!hasUnsavedChanges) {
      resetLocalState()
      onCancel()
      return
    }

    Modal.confirm({
      title: 'Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn thoát không?',
      okText: 'Thoát',
      cancelText: 'Ở lại',
      okButtonProps: { style: { backgroundColor: '#ff5629', borderColor: '#ff5629' } },
      cancelButtonProps: { style: { backgroundColor: '#fff', borderColor: '#d9d9d9' } },
      centered: true,
      onOk: () => {
        resetLocalState()
        onCancel()
      },
    })
  }

  const setDecision = (key: string, decision: ReviewDecision) => {
    setReviewByAsset((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        decision,
        feedback: prev[key]?.feedback ?? createDefaultFeedback(),
      },
    }))
  }

  const setRejectFeedback = (key: string, value: ReviewFeedback) => {
    setReviewByAsset((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        feedback: value,
      },
    }))
  }

  const handleComplete = async () => {
    if (!isAllReviewed) return
    if (!submission?.id) {
      message.error('Không tìm thấy submission để duyệt.')
      return
    }

    const approvedAssetIds: number[] = []
    const rejectedAssets: { id: number; reason: string }[] = []

    rowsWithState.forEach(({ asset, state }) => {
      if (!asset.id) return
      if (state?.decision === SUBMISSION_STATUS.APPROVED) {
        approvedAssetIds.push(asset.id)
      }
      if (state?.decision === SUBMISSION_STATUS.REJECTED) {
        rejectedAssets.push({
          id: asset.id,
          reason: buildRejectReasonFromFeedback(state.feedback),
        })
      }
    })
    try {
      setSubmitting(true)
      await submitApproveDemoJobSubmission({
        submissionId: submission.id,
        approvedAssetIds,
        rejectedAssets,
        ...(extensionDeadline && { extendTime: extensionDeadline.endOf('day').format('YYYY-MM-DD HH:mm:ss') }),
        jobId: Number(jobId),
      })
      showAlert.success('Hoàn tất duyệt demo thành công.')
      resetLocalState()
      onCancel()
      void getApprovedAssets()
      refetchJobDetail()
      await onApprovedSuccess?.()
    } catch (error: any) {
      console.error('affApproveDemoJobSubmission error', error)
      showAlert.error(error?.message || 'Duyệt demo thất bại, vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  const LoadingAssets = () => {
    return (
      <Flex vertical gap={8}>
        <Skeleton active paragraph={{ rows: 3 }} title={false} />
        <Skeleton active paragraph={{ rows: 4 }} title={false} />
      </Flex>
    )
  }

  return (
    <>
      <Modal
        open={open}
        onCancel={handleRequestClose}
        title="Duyệt demo"
        footer={
          <Flex justify="flex-end" gap={8} style={{ borderTop: '1px solid #e8e8e8', paddingTop: 10 }}>
            <Button onClick={handleRequestClose}>Đóng</Button>
            <Button
              type="primary"
              disabled={!canSubmit}
              loading={submitting || approveDemoJobSubmissionLoading}
              onClick={handleComplete}
            >
              Hoàn tất
            </Button>
          </Flex>
        }
        destroyOnClose
        centered
        width={500}
      >
        {approvedAssetsLoading ? <LoadingAssets /> : (
          <Flex vertical gap={8}>
            <Flex align="center" justify="space-between" wrap="wrap" gap={8}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Thời gian gửi: {submission?.updatedAt ? dayjs(submission?.updatedAt).format('HH:mm DD/MM/YYYY ') : '--'}
              </Text>
              <Divider type="vertical" />
              <Text type="secondary" style={{ fontSize: 13 }}>
                Hạn gửi: {videoDeadline ? dayjs(videoDeadline).format('HH:mm DD/MM/YYYY ') : '--'}
              </Text>
            </Flex>

            {(approvedAssetsData?.jobSubmissions?.length ?? 0) > 1 && <Button
              type="link"
              style={{ padding: 0, color: '#ff5629', width: 'fit-content' }}
              onClick={() => {
                const defaultAssetIndex = submission?.assets?.[0]?.index ?? null
                if (!id || defaultAssetIndex == null) {
                  message.error('Không tìm thấy job id để xem lịch sử duyệt.')
                  return
                }
                setSelectedAssetIndex(defaultAssetIndex)
                setHistoryModalOpen(true)
              }}
            >
              <Flex
                align="center"
                gap={8}
              >
                <ClockCircleOutlined />
                <Text style={{ color: '#ff5629' }}>
                  Xem lịch sử duyệt demo
                </Text>
              </Flex>
            </Button>}

            <Divider style={{ margin: 0 }} />

            <Flex vertical>
              <Text>
                Số lượng video phải trả:{' '}
                <Text strong>{requiredNum}</Text>
              </Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Tiến độ: {approvedAssetCount ?? 0}/{requiredNum} video được duyệt
              </Text>
            </Flex>

            <ScrollArea
              vertical
              gap={16}
              style={{
                background: '#fafafa',
                padding: 16,
                borderRadius: 6,
                maxHeight: '55vh',
                overflowY: 'auto',
              }}
            >
              {mediaRows.length === 0 ? (
                <Text type="secondary">Chưa có video cần duyệt</Text>
              ) : (
                rowsWithState.map(({ asset, pairs, idx, key, state, isApproved, isRejected }) => (
                  <Flex key={asset.id ?? idx} vertical gap={10}>
                    <>
                      <Flex align='center' justify='space-between'>
                        <Flex align="center" gap={8} wrap="wrap">
                          <Text strong>Video {asset.index ?? '--'}</Text>
                          <Tag color={statusBadge.color} style={{ margin: 0, border: 'none' }}>
                            {statusBadge.label}
                          </Tag>
                        </Flex>
                        
                        {isShowHistoryButton && <Button
                          type='link'
                          style={{ width: 'fit-content', padding: 0 }}
                          onClick={() => {
                            if (!id || asset.index == null) {
                              message.error('Không tìm thấy job id để xem lịch sử duyệt.')
                              return
                            }
                            setSelectedAssetIndex(asset.index)
                            setAssetHistoryPanelOpen(true)
                          }}
                        >
                          <Tooltip title='Xem lịch sử duyệt video'>
                            <ClockCircleOutlined style={{ color: '#646464' }} />
                          </Tooltip>
                        </Button>}
                      </Flex>

                      <Flex gap={6} wrap="wrap">
                        {pairs.map((row) => {
                          const productName = jobProductNameMap.get(row.jobProductId) ?? '--'
                          return (
                            <Tag key={row.jobProductId} style={{ backgroundColor: '#d5d5d5', borderRadius: 6 }}>
                              <Text ellipsis={{ tooltip: productName }} style={{ maxWidth: 250 }}>
                                {productName}
                              </Text>
                            </Tag>
                          )
                        })}
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

                      {asset.note?.trim() && <>
                        <Text strong>Lời nhắn cho nhãn hàng</Text>
                        <Text type="secondary" style={{ backgroundColor: '#fff', padding: '6px', borderRadius: 6, fontSize: 13 }}>
                          {asset.note?.trim() || '--'}
                        </Text>
                      </>}

                      <Flex gap={8}>
                        <Button
                          style={{ flex: 1 }}
                          type={isApproved ? 'primary' : 'default'}
                          onClick={() => setDecision(key, SUBMISSION_STATUS.APPROVED)}
                        >
                          Duyệt
                        </Button>
                        <Button
                          style={{ flex: 1 }}
                          type={isRejected ? 'primary' : 'default'}
                          onClick={() => setDecision(key, SUBMISSION_STATUS.REJECTED)}
                        >
                          Từ chối
                        </Button>
                      </Flex>
                      {isRejected ? (
                        <Flex gap={8} vertical>
                          <Text strong>Nhận xét <Text style={{ color: '#ff4d4f' }}>*</Text></Text>
                          <GuidedReviewForm
                            value={state?.feedback ?? { hook: '', script: '', visual: '', other: '' }}
                            onChange={(nextFeedback) => setRejectFeedback(key, nextFeedback)}
                          />
                        </Flex>
                      ) : null}

                      {idx < mediaRows.length - 1 && <Divider style={{ margin: '16px 0' }} />}
                    </>
                  </Flex>
                ))
              )}
            </ScrollArea>

            {hasRejectedVideo && (
              <Flex align='center' gap={8}>
                <Text>Thời gian gia hạn</Text>
                <Tooltip title='Thời hạn cuối cùng để Nhà sáng tạo gửi lại demo đã chỉnh sửa.'>
                  <InfoCircleOutlined />
                </Tooltip>
                <DatePicker
                  value={extensionDeadline}
                  onChange={(date) => setExtensionDeadline(date)}
                  format='DD/MM/YYYY'
                  placeholder='Chọn ngày gia hạn'
                  style={{ width: 200, marginLeft: 20 }}
                  disabledDate={(current) => {
                    if (!current) return false
                    if (!parsedVideoDeadline?.isValid()) return false
                    return current.startOf('day').isBefore(parsedVideoDeadline.startOf('day'))
                  }}
                />
              </Flex>
            )}
          </Flex>
        )}
      </Modal>
      <ApprovedHistoryModal
        open={historyModalOpen}
        onCancel={() => setHistoryModalOpen(false)}
        previousSubmissionsData={previousSubmissionsData}
        previousSubmissionsLoading={previousSubmissionsLoading}
        videoIndex={selectedAssetIndex}
        assetType="video"
        jobProducts={jobProducts}
        totalVideoCount={previousSubmissionsTotalVideoCount}
        approvedVideoCount={previousSubmissionsApprovedVideoCount}
      />
      <ApprovedAssetHistoryPanel
        open={assetHistoryPanelOpen}
        onClose={() => setAssetHistoryPanelOpen(false)}
        jobId={jobId}
        videoIndex={selectedAssetIndex}
        assetType="video"
        jobProducts={jobProducts}
      />
    </>
  )
}

export default ApprovedModal