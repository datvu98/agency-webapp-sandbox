import React from 'react'
import { Flex, Input, Typography } from 'antd'

const { Text } = Typography
const { TextArea } = Input
const MAX_REVIEW_LENGTH = 500

export type ReviewCriterionKey = 'hook' | 'script' | 'visual' | 'other'
export type ReviewFeedback = Record<ReviewCriterionKey, string>

type ReviewCriterion = {
  key: ReviewCriterionKey
  title: string
  hint: string
}

export const REVIEW_CRITERIA: ReviewCriterion[] = [
  {
    key: 'hook',
    title: 'Hook',
    hint: 'Đánh giá 3-5 giây đầu có đủ hấp dẫn và giữ chân người xem hay chưa.',
  },
  {
    key: 'script',
    title: 'Kịch bản',
    hint: 'Kiểm tra nội dung có bám brief của brand và làm rõ USP của sản phẩm.',
  },
  {
    key: 'visual',
    title: 'Hình ảnh',
    hint: 'Đánh giá chất lượng video/hình ảnh, ánh sáng và độ rõ của sản phẩm.',
  },
  {
    key: 'other',
    title: 'Khác',
    hint: 'Phản hồi bổ sung nếu có.',
  },
]

export const createDefaultFeedback = (): ReviewFeedback => ({
  hook: '',
  script: '',
  visual: '',
  other: '',
})

export const isReviewFeedbackValid = (feedback?: ReviewFeedback) =>
  Boolean(
    feedback &&
      (Object.values(feedback) as string[]).some((value) => Boolean(value?.trim()))
  )

interface GuidedReviewFormProps {
  value: ReviewFeedback
  onChange: (nextValue: ReviewFeedback) => void
}

const GuidedReviewForm = ({ value, onChange }: GuidedReviewFormProps) => (
  <Flex
    vertical
    gap={8}
    style={{
      background: '#fff',
      borderRadius: 8,
      padding: 12,
    }}
  >
    {REVIEW_CRITERIA.map((criterion) => (
      <Flex key={criterion.key} align="flex-start" gap={6}>
        <Text style={{ lineHeight: '22px', whiteSpace: 'nowrap' }}>
          {criterion.title}:
        </Text>
        <TextArea
          value={value[criterion.key]}
          onChange={(e) =>
            onChange({
              ...value,
              [criterion.key]: e.target.value.slice(0, MAX_REVIEW_LENGTH),
            })
          }
          placeholder={criterion.hint}
          variant="borderless"
          maxLength={MAX_REVIEW_LENGTH}
          autoSize={{ minRows: 1, maxRows: 4 }}
          style={{
            padding: 0,
            color: '#000',
            fontSize: 14,
            lineHeight: '22px',
          }}
        />
      </Flex>
    ))}
  </Flex>
)

export default GuidedReviewForm