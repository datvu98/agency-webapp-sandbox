import { Button, DatePicker, Divider, Flex, Image, Modal, Popover, Skeleton, Tag, Tooltip, Typography } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { useApprovedAir } from '../hooks/useApprovedAir'
import { useParams } from 'react-router-dom'
import { SUBMISSION_STATUS, buildJobProductNameMap, groupProductMediaByJobProduct, submissionStatusBadge } from '../helpers/approvedView.helpers'
import TikTokEmbed from 'app/pages/Campaigns/components/TikTokEmbed'
import { createDefaultFeedback, type ReviewFeedback } from '../../components/GuidedReviewForm'
import ReasonReject, { isReasonRejectFeedbackValid } from '../../components/ReasonReject'
import styled from 'styled-components'
import { popupScrollbarCss } from '../../Campaign.styles'
import CopyText from '../../components/CopyText'
import { ClockCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import { showAlert } from 'utils/helper'
import ApproveAirHistoryModal from './ApproveAirHistoryModal'
import ApprovedAssetAirHistoryPanel from './ApprovedAssetAirHistoryPanel'
import ApprovedScriptComparisonPanel from './ApprovedScriptComparisonPanel'
import { buildRejectedAssetsReasonForApprovedAir, getAssetKey, sortAssetsByIndexAsc, splitMediaUrlsByType } from '../helpers/approvedModal.helpers'

interface ApprovedAirModalProps {
    open: boolean
    onCancel: () => void
    id?: number
    onApprovedSuccess?: () => Promise<unknown> | void
}

const ScrollArea = styled(Flex)`
  ${popupScrollbarCss}
`

const { Text } = Typography

const ApprovedAirModal = ({ open, onCancel, id, onApprovedSuccess }: ApprovedAirModalProps) => {
    const { id: idFromParams } = useParams()
    const jobId = typeof id === 'number' && !Number.isNaN(id) ? id : Number(idFromParams)
    const { approvedAirData, approvedAirDataLoading, getApprovedAirData, submitApproveAirJobSubmission, approveAirJobSubmissionLoading, getPreviousSubmissions, previousSubmissionsData, previousSubmissionsLoading, previousSubmissionsResponse, previousSubmissionsJobProducts } = useApprovedAir()
    const [reviewByAsset, setReviewByAsset] = useState<Record<string, { decision?: 'approved' | 'rejected'; feedback?: ReviewFeedback }>>({})
    const [extensionDeadline, setExtensionDeadline] = useState<Dayjs | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [historyModalOpen, setHistoryModalOpen] = useState(false)
    const [assetHistoryPanelOpen, setAssetHistoryPanelOpen] = useState(false)
    const [scriptComparisonPanelOpen, setScriptComparisonPanelOpen] = useState(false)
    const [selectedAssetIndex, setSelectedAssetIndex] = useState<number | null>(null)
    const [selectedAssetType, setSelectedAssetType] = useState<'video' | 'live'>('video')
    const [openPopoverKey, setOpenPopoverKey] = useState<string | null>(null)

    useEffect(() => {
        if (!open) return
        if (!jobId || Number.isNaN(jobId)) return
        void getApprovedAirData({ variables: { id: Number(jobId) } })
    }, [open, getApprovedAirData, jobId])

    useEffect(() => {
        if (!open) {
            setReviewByAsset({})
            setExtensionDeadline(null)
            setHistoryModalOpen(false)
            setAssetHistoryPanelOpen(false)
            setScriptComparisonPanelOpen(false)
            setSelectedAssetIndex(null)
            setSelectedAssetType('video')
            setOpenPopoverKey(null)
        }
    }, [open])

    useEffect(() => {
        if (!historyModalOpen) return
        if (!jobId || Number.isNaN(jobId)) return
        void getPreviousSubmissions({
            variables: { jobId: Number(jobId), type: 'air' },
        })
    }, [getPreviousSubmissions, historyModalOpen, jobId])

    const latestAirSubmission = useMemo(() => {
        const submissions = approvedAirData?.jobSubmissions ?? []
        const airSubmissions = submissions.filter(
            (submission: any) => (submission?.type ?? '').toLowerCase() === 'air'
        )
        if (!airSubmissions.length) return null
        return [...airSubmissions].sort((a: any, b: any) => {
            const timeA = new Date(a?.updatedAt ?? 0).getTime()
            const timeB = new Date(b?.updatedAt ?? 0).getTime()
            return timeB - timeA
        })[0]
    }, [approvedAirData])
    const airSubmissionCount = useMemo(() => (approvedAirData?.jobSubmissions ?? []).filter((submission) => submission.type === 'air').length,
        [approvedAirData]
    )
    const postDeadline = approvedAirData?.postDeadline ?? null
    const parsedPostDeadline = useMemo(
        () => (postDeadline ? dayjs(String(postDeadline)) : null),
        [postDeadline]
    )

    const videoAssets = useMemo(
        () =>
            sortAssetsByIndexAsc(
                (latestAirSubmission?.assets ?? []).filter(
                    (asset: any) => (asset?.type ?? '').toLowerCase() === 'video'
                )
            ),
        [latestAirSubmission]
    )
    const liveAssets = useMemo(
        () =>
            sortAssetsByIndexAsc(
                (latestAirSubmission?.assets ?? []).filter(
                    (asset: any) => (asset?.type ?? '').toLowerCase() === 'live'
                )
            ),
        [latestAirSubmission]
    )

    const jobProductNameMap = useMemo(
        () => buildJobProductNameMap(approvedAirData?.jobProducts),
        [approvedAirData]
    )

    const setDecision = (key: string, decision: 'approved' | 'rejected') => {
        setReviewByAsset((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                decision,
                feedback:
                    decision === SUBMISSION_STATUS.REJECTED
                        ? prev[key]?.feedback ?? createDefaultFeedback()
                        : createDefaultFeedback(),
            },
        }))
    }

    const openAssetHistory = (index: number, type: 'video' | 'live') => {
        setSelectedAssetIndex(index)
        setSelectedAssetType(type)
        setAssetHistoryPanelOpen(true)
    }

    const openScriptComparison = (index: number) => {
        setSelectedAssetIndex(index)
        setSelectedAssetType('video')
        setScriptComparisonPanelOpen(true)
    }

    const allRenderedAssets = useMemo(
        () => [...videoAssets, ...liveAssets],
        [videoAssets, liveAssets]
    )

    const isAllReviewed = useMemo(
        () =>
            allRenderedAssets.length > 0 &&
            allRenderedAssets.every((asset: any, idx: number) => {
                const key = String(asset?.id ?? `${(asset?.type ?? 'asset')}-${asset?.index ?? idx}-${idx}`)
                const state = reviewByAsset[key]
                if (!state?.decision) return false
                if (state.decision === SUBMISSION_STATUS.REJECTED) {
                    return isReasonRejectFeedbackValid(state.feedback)
                }
                return true
            }),
        [allRenderedAssets, reviewByAsset]
    )

    const hasRejectedAsset = useMemo(
        () => Object.values(reviewByAsset).some((item) => item?.decision === SUBMISSION_STATUS.REJECTED),
        [reviewByAsset]
    )
    const hasUnsavedChanges = useMemo(() => {
        if (extensionDeadline) return true

        return Object.values(reviewByAsset).some(({ decision, feedback }) => {
            if (decision) return true
            if (!feedback) return false
            return Object.values(feedback).some((value) => Boolean(value?.trim()))
        })
    }, [extensionDeadline, reviewByAsset])

    const resetLocalState = () => {
        setReviewByAsset({})
        setExtensionDeadline(null)
    }

    const handleRequestClose = () => {
        if (submitting || approveAirJobSubmissionLoading) return

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

    const handleComplete = async () => {
        if (!latestAirSubmission?.id) return
        if (!isAllReviewed) return

        const approvedAssetIds: number[] = []
        const rejectedAssets: { id: number; reason: string }[] = []

        allRenderedAssets.forEach((asset: any, idx: number) => {
            if (!asset?.id) return
            const key = getAssetKey(asset, idx)
            const state = reviewByAsset[key]
            if (!state?.decision) return

            if (state.decision === SUBMISSION_STATUS.APPROVED) {
                approvedAssetIds.push(asset.id)
            } else if (state.decision === SUBMISSION_STATUS.REJECTED) {
                rejectedAssets.push({
                    id: asset.id,
                    reason: buildRejectedAssetsReasonForApprovedAir(state.feedback),
                })
            }
        })

        try {
            setSubmitting(true)
            await submitApproveAirJobSubmission({
                submissionId: latestAirSubmission.id,
                approvedAssetIds,
                rejectedAssets,
                ...(extensionDeadline ? { extendTime: extensionDeadline.endOf('day').format('YYYY-MM-DD HH:mm:ss') } : {}),
                jobId: Number(jobId),
            })
            await onApprovedSuccess?.()
            showAlert.success('Hoàn tất duyệt nghiệm thu thành công.')
            resetLocalState()
            onCancel()
        } catch (error: any) {
            showAlert.error(error?.message || 'Duyệt nghiệm thu thất bại, vui lòng thử lại.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <Modal
                open={open} onCancel={handleRequestClose} title='Nghiệm thu' centered
                footer={
                    <Flex justify="flex-end" gap={8} style={{ borderTop: '1px solid #e8e8e8', paddingTop: 10 }}>
                        <Button onClick={handleRequestClose}>Đóng</Button>
                        <Button
                            type="primary"
                            disabled={!isAllReviewed}
                            loading={submitting || approveAirJobSubmissionLoading}
                            onClick={handleComplete}
                        >
                            Hoàn tất
                        </Button>
                    </Flex>
                }
                destroyOnClose
                width={560}
            >
                <Flex vertical gap={16}>
                    {approvedAirDataLoading ? (
                        <Skeleton active paragraph={{ rows: 5 }} title={false} />
                    ) : (
                        <>
                            <Flex vertical gap={0} style={{ borderBottom: '1px solid #e8e8e8' }}>
                                <Flex align="center" justify="space-between" wrap="wrap" gap={8}>
                                    <Text type="secondary">Thời gian gửi: {latestAirSubmission?.createdAt ? dayjs(latestAirSubmission?.createdAt).format('HH:mm:ss DD/MM/YYYY ') : '--'}</Text>
                                    <Divider type="vertical" />
                                    <Text type="secondary">Hạn gửi: {approvedAirData?.postDeadline ? dayjs(approvedAirData?.postDeadline).format('HH:mm:ss DD/MM/YYYY ') : '--'}</Text>
                                </Flex>
                                {airSubmissionCount > 1 ? (
                                    <Button
                                        type="link"
                                        style={{ padding: 0, margin: 0, color: '#ff5629', width: 'fit-content' }}
                                        onClick={() => setHistoryModalOpen(true)}
                                    >
                                        <Flex align="center" gap={8}>
                                            <ClockCircleOutlined />
                                            <Text style={{ color: '#ff5629' }}>Xem lịch sử duyệt nghiệm thu</Text>
                                        </Flex>
                                    </Button>
                                ) : null}
                            </Flex>
                            <Flex vertical>
                                {(approvedAirData?.videoCount ?? 0) > 0 && <>
                                    <Text>Số lượng video phải trả: <Text strong>{approvedAirData?.videoCount ?? 0}</Text></Text>
                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                        Tiến độ: {approvedAirData?.videoApprovedPostCount ?? 0}/{approvedAirData?.videoCount ?? 0} video được duyệt
                                    </Text>
                                </>}
                                {(approvedAirData?.liveSessionCount ?? 0) > 0 && <>
                                    <Text>Số lượng livestream phải trả: <Text strong>{approvedAirData?.liveSessionCount ?? 0}</Text></Text>
                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                        Tiến độ: {approvedAirData?.liveApprovedPostCount ?? 0}/{approvedAirData?.liveSessionCount ?? 0} livestream được duyệt
                                    </Text>
                                </>}
                            </Flex>

                            <ScrollArea vertical gap={16} style={{ maxHeight: '58vh', overflowY: 'auto' }}>
                                {videoAssets.length === 0 && liveAssets.length === 0 ? (
                                    <Text type="secondary">Chưa có video cần duyệt</Text>
                                ) : (
                                    <>
                                        <Flex vertical gap={12} style={{ backgroundColor: '#fafafa', borderRadius: 8, padding: 12 }}>
                                            {videoAssets.map((asset: any, index: number) => {
                                                const status = submissionStatusBadge(asset?.status)
                                                const key = getAssetKey(asset, index)
                                                const state = reviewByAsset[key]
                                                const pairs = groupProductMediaByJobProduct(asset?.productMedia)
                                                const airAssetPrimaryUrl = (asset?.productMedia ?? [])
                                                    .map((pm: any) => pm?.jobSubmissionMedia?.fullAirUrl)
                                                    .find(Boolean)
                                                const isApproved = state?.decision === SUBMISSION_STATUS.APPROVED
                                                const isRejected = state?.decision === SUBMISSION_STATUS.REJECTED

                                                return (
                                                    <Flex key={key} vertical gap={10}>
                                                        <Flex align="center" justify="space-between" gap={8}>
                                                            <Flex align="center" gap={8}>
                                                                <Text strong>Video {asset?.index ?? index + 1}</Text>
                                                                <Tag color={status.color} style={{ margin: 0, border: 'none' }}>{status.label}</Tag>
                                                            </Flex>
                                                            <Popover
                                                                trigger="click"
                                                                placement="topRight"
                                                                open={openPopoverKey === `video-${asset.index}`}
                                                                onOpenChange={(isOpen) => setOpenPopoverKey(isOpen ? `video-${asset.index}` : null)}
                                                                content={(
                                                                    <Flex vertical>
                                                                        <Button
                                                                            type='text'
                                                                            style={{ textAlign: 'left', height: 'fit-content' }}
                                                                            onClick={() => {
                                                                                openAssetHistory(Number(asset.index), 'video')
                                                                                setOpenPopoverKey(null)
                                                                            }}
                                                                            disabled={asset?.index == null || airSubmissionCount <= 1}
                                                                        >
                                                                            Xem lần duyệt trước
                                                                        </Button>
                                                                        {approvedAirData?.hasDemoApproval === 1 ? (<Button
                                                                            type='text'
                                                                            style={{ width: 'fit-content', textAlign: 'left', height: 'fit-content' }}
                                                                            onClick={() => {
                                                                                openScriptComparison(Number(asset.index))
                                                                                setOpenPopoverKey(null)
                                                                            }}
                                                                        >
                                                                            Đối chiếu với demo đã duyệt
                                                                        </Button>
                                                                        ) : null}
                                                                    </Flex>
                                                                )}
                                                            >
                                                                <Button type='link' style={{ width: 'fit-content', padding: 0 }}>
                                                                    <ClockCircleOutlined style={{ color: '#646464' }} />
                                                                </Button>
                                                            </Popover>
                                                        </Flex>

                                                        <Flex gap={6} wrap="wrap">
                                                            {pairs.map((row) => (
                                                                <Tag key={row.jobProductId} style={{ backgroundColor: '#d5d5d5', borderRadius: 6 }}>
                                                                    <Text ellipsis={{ tooltip: jobProductNameMap.get(row.jobProductId) ?? '--' }} style={{ maxWidth: 450 }}>
                                                                        {jobProductNameMap.get(row.jobProductId) ?? '--'}
                                                                    </Text>
                                                                </Tag>
                                                            ))}
                                                        </Flex>

                                                        <Flex gap={10} wrap="wrap">
                                                            {pairs.map((row) => (
                                                                <Flex key={row.jobProductId} gap={8}>
                                                                    <TikTokEmbed
                                                                        url={airAssetPrimaryUrl ?? row.videoUrl}
                                                                        style={{ width: 90, height: 120, background: '#000', borderRadius: 6, overflow: 'hidden' }}
                                                                    />
                                                                </Flex>
                                                            ))}
                                                        </Flex>

                                                        {airAssetPrimaryUrl ? (
                                                            <Button type="link" href={airAssetPrimaryUrl} target="_blank" style={{ width: 'fit-content', padding: 0, margin: 0, height: 'fit-content' }}>Link</Button>
                                                        ) : null}

                                                        <Flex align="center" gap={4}>
                                                            <Text>Mã quảng cáo: </Text>
                                                            <CopyText text={asset.advertisingCode ?? '--'} hideIcon={false}>
                                                                <Text ellipsis={{ tooltip: { title: asset.advertisingCode } }} style={{ width: 'fit-content', maxWidth: 200 }}>{asset.advertisingCode ?? '--'}</Text>
                                                            </CopyText>
                                                        </Flex>

                                                        {asset?.note?.trim() ? (
                                                            <>
                                                                <Text strong>Lời nhắn cho nhãn hàng</Text>
                                                                <Text style={{ backgroundColor: '#fff', padding: '8px 10px', borderRadius: 6 }}>
                                                                    {asset.note}
                                                                </Text>
                                                            </>
                                                        ) : null}

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
                                                            <Flex vertical gap={8}>
                                                                <Text strong>Nhận xét</Text>
                                                                <ReasonReject
                                                                    value={state?.feedback ?? createDefaultFeedback()}
                                                                    onChange={(nextFeedback) =>
                                                                        setReviewByAsset((prev) => ({
                                                                            ...prev,
                                                                            [key]: { ...prev[key], feedback: nextFeedback },
                                                                        }))
                                                                    }
                                                                />
                                                            </Flex>
                                                        ) : null}
                                                    </Flex>
                                                )
                                            })}
                                        </Flex>
                                        <Flex vertical gap={12} style={{ backgroundColor: '#fafafa', borderRadius: 8, padding: 12 }}>
                                            {liveAssets.map((asset: any, index: number) => {
                                                const status = submissionStatusBadge(asset?.status)
                                                const key = getAssetKey(asset, index)
                                                const state = reviewByAsset[key]
                                                const isApproved = state?.decision === SUBMISSION_STATUS.APPROVED
                                                const isRejected = state?.decision === SUBMISSION_STATUS.REJECTED
                                                const productIds = Array.from(
                                                    new Set(
                                                        (asset?.productMedia ?? [])
                                                            .map((pm: any) => pm?.jobProductId)
                                                            .filter((id: number | null | undefined) => id != null)
                                                    )
                                                ) as number[]
                                                const { imageUrls: liveImageUrls, linkUrls: liveLinkUrls } = splitMediaUrlsByType(asset?.productMedia ?? [])

                                                return (
                                                    <Flex key={key} vertical gap={10}>
                                                        <Flex align="center" justify="space-between" gap={8}>
                                                            <Flex align="center" gap={8}>
                                                                <Text strong>Livestream {asset?.index ?? index}</Text>
                                                                <Tag color={status.color} style={{ margin: 0, border: 'none' }}>{status.label}</Tag>
                                                            </Flex>
                                                            {(asset?.index != null && airSubmissionCount > 1) ? (
                                                                <Popover
                                                                    trigger="click"
                                                                    placement="topRight"
                                                                    open={openPopoverKey === `live-${asset.index}`}
                                                                    onOpenChange={(isOpen) => setOpenPopoverKey(isOpen ? `live-${asset.index}` : null)}
                                                                    content={(
                                                                        <Flex vertical>
                                                                            <Button
                                                                                type='text'
                                                                                style={{ textAlign: 'left', height: 'fit-content' }}
                                                                                onClick={() => {
                                                                                    openAssetHistory(Number(asset.index), 'live')
                                                                                    setOpenPopoverKey(null)
                                                                                }}
                                                                            >
                                                                                Xem lần duyệt trước
                                                                            </Button>
                                                                        </Flex>
                                                                    )}
                                                                >
                                                                    <Button type='link' style={{ width: 'fit-content', padding: 0 }}>
                                                                        <ClockCircleOutlined style={{ color: '#646464' }} />
                                                                    </Button>
                                                                </Popover>
                                                            ) : null}
                                                        </Flex>

                                                        <ScrollArea align='center' gap={6} style={{ overflowX: 'auto' }}>
                                                            {productIds.map((productId) => (
                                                                <Tag key={productId} style={{ backgroundColor: '#d5d5d5', borderRadius: 6 }}>
                                                                    <Text ellipsis={{ tooltip: jobProductNameMap.get(productId) ?? '--' }} style={{ maxWidth: 350 }}>
                                                                        {jobProductNameMap.get(productId) ?? '--'}
                                                                    </Text>
                                                                </Tag>
                                                            ))}
                                                        </ScrollArea>

                                                        {liveImageUrls.length > 0 ? (
                                                            <Flex gap={10} wrap="wrap">
                                                                {liveImageUrls.map((imageUrl, mediaIndex) => (
                                                                    <Image
                                                                        key={`${key}-image-${mediaIndex}`}
                                                                        src={imageUrl}
                                                                        alt="live-media"
                                                                        width={95}
                                                                        height={120}
                                                                        style={{ borderRadius: 6, objectFit: 'cover', background: '#000' }}
                                                                    />
                                                                ))}
                                                            </Flex>
                                                        ) : null}

                                                        <Flex vertical gap={4}>
                                                            {liveLinkUrls.map((linkUrl, linkIndex) => (
                                                                <Button key={`${key}-link-${linkIndex}`} type="link" href={linkUrl} target="_blank" style={{ width: 'fit-content', padding: 0, margin: 0, height: 'fit-content' }}>
                                                                    Link
                                                                </Button>
                                                            ))}
                                                        </Flex>

                                                        <Flex align="center" gap={4}>
                                                            <Text>Mã quảng cáo: </Text>
                                                            <CopyText text={asset.advertisingCode} hideIcon={false}>
                                                                <Text ellipsis={{ tooltip: { title: asset.advertisingCode } }} style={{ width: 'fit-content', maxWidth: 200 }}>{asset.advertisingCode}</Text>
                                                            </CopyText>
                                                        </Flex>

                                                        {asset?.note?.trim() ? (
                                                            <>
                                                                <Text strong>Lời nhắn cho nhãn hàng</Text>
                                                                <Text style={{ backgroundColor: '#fff', padding: '8px 10px', borderRadius: 6 }}>
                                                                    {asset.note}
                                                                </Text>
                                                            </>
                                                        ) : null}

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
                                                            <Flex vertical gap={8}>
                                                                <Text strong>Lý do từ chối</Text>
                                                                <ReasonReject
                                                                    value={state?.feedback ?? createDefaultFeedback()}
                                                                    onChange={(nextFeedback) =>
                                                                        setReviewByAsset((prev) => ({
                                                                            ...prev,
                                                                            [key]: { ...prev[key], feedback: nextFeedback },
                                                                        }))
                                                                    }
                                                                />
                                                            </Flex>
                                                        ) : null}
                                                    </Flex>
                                                )
                                            })}
                                        </Flex>
                                    </>
                                )}
                            </ScrollArea>
                            {hasRejectedAsset ? (
                                <Flex align='center' gap={8}>
                                    <Text>Thời gian gia hạn</Text>
                                    <Tooltip title='Thời hạn cuối cùng để Nhà sáng tạo gửi lại bài đăng để nghiệm thu.'>
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
                                            if (!parsedPostDeadline?.isValid()) return false
                                            return current.startOf('day').isBefore(parsedPostDeadline.startOf('day'))
                                        }}
                                    />
                                </Flex>
                            ) : null}
                        </>
                    )}
                </Flex>
            </Modal>
            <ApproveAirHistoryModal
                open={historyModalOpen}
                onCancel={() => setHistoryModalOpen(false)}
                previousSubmissionsData={previousSubmissionsData}
                previousSubmissionsLoading={previousSubmissionsLoading}
                totalVideoCount={previousSubmissionsResponse?.affGetPreviousSubmissions?.data?.videoCount ?? 0}
                approvedVideoCount={previousSubmissionsResponse?.affGetPreviousSubmissions?.data?.approvedVideoAirCount ?? 0}
                totalLiveCount={previousSubmissionsResponse?.affGetPreviousSubmissions?.data?.liveCount ?? 0}
                approvedLiveCount={previousSubmissionsResponse?.affGetPreviousSubmissions?.data?.approvedLiveAirCount ?? 0}
                jobProducts={previousSubmissionsJobProducts}
            />
            <ApprovedAssetAirHistoryPanel
                open={assetHistoryPanelOpen}
                onClose={() => setAssetHistoryPanelOpen(false)}
                jobId={jobId}
                assetIndex={selectedAssetIndex}
                assetType={selectedAssetType}
            />
            <ApprovedScriptComparisonPanel
                open={scriptComparisonPanelOpen}
                onClose={() => setScriptComparisonPanelOpen(false)}
                jobId={jobId}
                videoIndex={selectedAssetIndex}
                assetType={selectedAssetType}
                jobProducts={approvedAirData?.jobProducts}
            />
        </>
    )
}

export default ApprovedAirModal