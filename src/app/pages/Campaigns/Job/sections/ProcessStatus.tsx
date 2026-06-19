import { Card, Divider, Flex, Skeleton, Steps, Typography } from 'antd'
import React, { useMemo } from 'react'
import {
    CANCELLED_BY_OPTIONS,
    PROCESS_STATUS,
    PROCESS_STATUS_OPTIONS,
    PROCESS_STATUS_OPTIONS_CANCELLED,
    PROCESS_STATUS_OPTIONS_HAS_DEMO_APPROVAL,
} from '../constants/constants'
import { ClockCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { Text } = Typography

const VISIBLE_STEP_COUNT = 5
const DAY_MS = 24 * 60 * 60 * 1000

const formatDeadlineDisplay = (deadline?: string | null) => {
    if (!deadline) return '--'
    const value = new Date(deadline)
    if (Number.isNaN(value.getTime())) return '--'
    const hh = String(value.getHours()).padStart(2, '0')
    const mm = String(value.getMinutes()).padStart(2, '0')
    const dd = String(value.getDate()).padStart(2, '0')
    const mo = String(value.getMonth() + 1).padStart(2, '0')
    const yyyy = value.getFullYear()
    return `${hh}:${mm} - ${dd}/${mo}/${yyyy}`
}

export interface ProcessStatusProps {
    status?: string | null
    loading?: boolean
    jobDetail?: {
        videoDeadline?: string | null
        videoCount?: number | null
        liveSessionCount?: number | null
        status?: string | null
        cancelBy?: string | null
        cancelReason?: string | null
        cancelAt?: string | null
        isPreShippingCancel?: boolean
    } | null
    hasDemoApproval?: number
}

const ProcessStatus = ({ status, loading, jobDetail, hasDemoApproval }: ProcessStatusProps) => {
    const allItems = useMemo(() => {
        if (status === PROCESS_STATUS.CANCELLED) {
            return PROCESS_STATUS_OPTIONS_CANCELLED.map((item) => ({
                title: item.label,
                value: item.value,
                index: item.index,
                status: item.status,
            }))
        }

        if (hasDemoApproval === 0 || jobDetail?.videoCount === 0) {
            return PROCESS_STATUS_OPTIONS_HAS_DEMO_APPROVAL.map((item) => ({
                title: item.label,
                value: item.value,
                index: item.index,
            }))
        }

        return PROCESS_STATUS_OPTIONS.map((item) => ({
            title: item.label,
            value: item.value,
            index: item.index,
        }))
    }, [hasDemoApproval, status])

    const currentStepIndex = useMemo(() => {
        const index = allItems.findIndex((item) => item.value === status)
        return index >= 0 ? index : 0
    }, [allItems, status])

    const total = allItems.length

    const windowStart = useMemo(() => {
        if (total <= VISIBLE_STEP_COUNT) return 0

        const centerIndex = Math.floor(VISIBLE_STEP_COUNT / 2)

        let start = currentStepIndex - centerIndex

        if (start < 0) start = 0
        if (start > total - VISIBLE_STEP_COUNT) {
            start = total - VISIBLE_STEP_COUNT
        }

        return start
    }, [currentStepIndex, total])

    const visibleItems = useMemo(() => {
        return allItems.slice(windowStart, windowStart + VISIBLE_STEP_COUNT).map((item, i) => {
            const absoluteIndex = windowStart + i
            const stepNumber = item.index ?? (absoluteIndex + 1)
            const isFinished = absoluteIndex < currentStepIndex
            const isCurrent = absoluteIndex === currentStepIndex
            const isError = (item as any).status === 'error'

            const isFinishedStatus = (item as any).status === 'finished'

            return {
                ...item,
                status: isFinishedStatus ? 'finish' : isError ? 'error' : undefined,
                icon: isFinished || isError || isFinishedStatus
                    ? undefined
                    : (
                        <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            fontSize: 12,
                            border: `1px solid ${isCurrent ? '#ff5629' : '#d9d9d9'}`,
                            color: isCurrent ? '#ff5629' : 'rgba(0,0,0,0.25)',
                            backgroundColor: 'transparent',
                        }}>
                            {stepNumber}
                        </span>
                    ),
            }
        })
    }, [allItems, windowStart, currentStepIndex])

    const currentInWindow = Math.min(
        Math.max(currentStepIndex - windowStart, 0),
        visibleItems.length - 1
    )

    const deadlineDiff = useMemo(() => {
        if (!jobDetail?.videoDeadline) return null
        const deadline = new Date(jobDetail.videoDeadline)
        if (Number.isNaN(deadline.getTime())) return null
        const now = new Date()
        const deadlineDateOnly = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate())
        const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const dayDiff = Math.floor((deadlineDateOnly.getTime() - nowDateOnly.getTime()) / DAY_MS)
        const hourDiff = Math.floor((deadline.getTime() - now.getTime()) / (60 * 60 * 1000))
        return { dayDiff, hourDiff }
    }, [jobDetail?.videoDeadline])

    const deadlineMessage = useMemo(() => {
        if (!deadlineDiff) return null
        const { dayDiff, hourDiff } = deadlineDiff
        if (dayDiff > 3) return null
        if (dayDiff > 0) return `Còn ${dayDiff} ngày`
        if (dayDiff === 0) {
            if (hourDiff > 0) return `Còn ${hourDiff} giờ`
            if (hourDiff === 0) return 'Hạn cuối hôm nay'
            return `Quá hạn ${Math.abs(hourDiff)} giờ`
        }
        return `Quá hạn ${Math.abs(dayDiff)} ngày`
    }, [deadlineDiff])

    if (loading && !status) {
        return (
            <Card>
                <Flex vertical gap={16}>
                    <Skeleton.Input active size="small" style={{ width: 120 }} />
                    <Skeleton active title={false} paragraph={{ rows: 2 }} />
                </Flex>
            </Card>
        )
    }

    return (
        <Card>
            <Flex vertical gap={16}>
                <Flex align="center" justify="space-between" wrap="wrap" gap={8}>
                    <Text strong style={{ fontSize: 16 }}>Tiến trình</Text>
                </Flex>

                <Steps
                    size="small"
                    current={currentInWindow}
                    items={visibleItems as any}
                    style={{
                        maxWidth: visibleItems.length < VISIBLE_STEP_COUNT
                            ? '30%'
                            : undefined,
                    }}
                />

                {jobDetail?.isPreShippingCancel && <Flex align='center' gap={4} style={{ padding: "6px 10px", border: "1px solid #ff4d4f", borderRadius: 4, backgroundColor: "#ffe6e6" }}>
                    <CloseCircleOutlined style={{ fontSize: 16, color: "#ff4d4f" }} />
                    <Text style={{ fontSize: 13 }}>Đơn hàng bị hủy, vui lòng liên kết đơn mới để quy trình được tiếp tục</Text>
                </Flex>}

                {jobDetail?.status === PROCESS_STATUS.PENDING_POSTING && <div style={{ backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8 }}>
                    {deadlineMessage && (
                        <Flex align='center' gap={8} style={{ marginBottom: 4 }}>
                            <ClockCircleOutlined />
                            <Text strong>{deadlineMessage}</Text>
                        </Flex>
                    )}
                    <Flex vertical style={{ marginLeft: deadlineMessage ? 22 : 0 }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>Nhà sáng tạo cần gửi kịch trước {formatDeadlineDisplay(jobDetail?.videoDeadline)}</Text>
                        <Text type="secondary" style={{ fontSize: 13 }}>Yêu cầu: {jobDetail?.videoCount ?? '--'} video, {jobDetail?.liveSessionCount ?? '--'} livestream</Text>
                    </Flex>
                </div>
                }

                {jobDetail?.status === PROCESS_STATUS.CANCELLED && (
                    <Flex vertical gap={8} style={{ backgroundColor: '#ffebeb', padding: 10, borderRadius: 8 }}>
                        <Flex align='center' gap={8}>
                            <Text strong style={{ color: '#ff0000' }}>{CANCELLED_BY_OPTIONS.find((item) => item.value === jobDetail?.cancelBy)?.label ?? '--'}</Text>
                            <Divider type="vertical" style={{ borderColor: '#000' }} />
                            <Text style={{ fontSize: 13 }}>Thời gian hủy: {dayjs(String(jobDetail?.cancelAt)).format('HH:mm DD/MM/YYYY') || '--'}</Text>
                        </Flex>
                        <Text style={{ fontSize: 13 }}>{jobDetail?.cancelReason || '--'}</Text>
                    </Flex>
                )}
            </Flex>
        </Card>
    )
}

export default ProcessStatus