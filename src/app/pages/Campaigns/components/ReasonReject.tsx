import { Checkbox, Flex, Input, Typography } from 'antd'
import React from 'react'
import type { ReviewFeedback } from './GuidedReviewForm'

const { Text } = Typography
const { Group: CheckboxGroup } = Checkbox

const REASON_JOINER = '\n'
const OTHER_SELECTED_MARKER = '__other_selected__'

export enum REASON_REJECT {
    WRONG_LINK_SUBMIT = 'Điền sai link nghiệm thu',
    WRONG_LINK_CART = 'Gắn sai link giỏ hàng',
    VIDEO_SUBMIT_DIFFERENT_SCRIPT = 'Video gửi nghiệm thu khác kịch bản đã được duyệt',
    MISSING_HASHTAG = 'Caption thiếu hashtag / hashtag sai brief',
    MISSING_AD_CODE = 'Chưa gửi mã quảng cáo',
}

interface ReasonRejectProps {
    value: ReviewFeedback
    onChange: (nextValue: ReviewFeedback) => void
}

export const isReasonRejectFeedbackValid = (feedback?: ReviewFeedback) => {
    const selectedReasons = (feedback?.script ?? '')
        .split(REASON_JOINER)
        .map((reason) => reason.trim())
        .filter(Boolean)
    const isOtherChecked = feedback?.hook === OTHER_SELECTED_MARKER
    const hasOtherReason = Boolean(feedback?.other?.trim())

    if (isOtherChecked && !hasOtherReason) return false
    return selectedReasons.length > 0 || hasOtherReason
}

const ReasonReject = ({ value, onChange }: ReasonRejectProps) => {
    const selectedReasons = (value?.script ?? '')
        .split(REASON_JOINER)
        .map((reason) => reason.trim())
        .filter(Boolean)

    const isOtherChecked = value?.hook === OTHER_SELECTED_MARKER

    return (
        <Flex vertical gap={8} style={{ background: '#fff', borderRadius: 8, padding: 12 }}>
            <CheckboxGroup
                value={selectedReasons}
                onChange={(checkedValues) => {
                    onChange({
                        ...value,
                        script: (checkedValues as string[]).join(REASON_JOINER),
                    })
                }}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                }}
            >
                {Object.values(REASON_REJECT).map((reason) => (
                    <Checkbox key={reason} value={reason}>{reason}</Checkbox>
                ))}
            </CheckboxGroup>

            <Flex align='center' gap={8}>
                <Checkbox
                    checked={isOtherChecked}
                    onChange={(e) => {
                        const checked = e.target.checked

                        onChange({
                            ...value,
                            hook: checked ? OTHER_SELECTED_MARKER : '',
                            other: checked ? value?.other ?? '' : '',
                        })
                    }}
                    style={{ whiteSpace: 'nowrap' }}
                >
                    Lý do khác
                </Checkbox>

                {isOtherChecked && (
                    <Input
                        value={value?.other ?? ''}
                        onChange={(e) =>
                            onChange({
                                ...value,
                                other: e.target.value,
                            })
                        }
                        placeholder='Nhập lý do khác'
                        maxLength={50}
                        showCount
                    />
                )}
            </Flex>
        </Flex>
    )
}

export default ReasonReject