import React, { useEffect, useMemo, useState } from 'react'
import { Button, Flex, Input, Modal, Radio, Typography } from 'antd'

interface ModalBulkRejectProps {
    open: boolean
    onCancel: () => void
    onConfirm: (rejectMessage: string) => void
    loading?: boolean
}

export enum REJECT_REASON {
    CONTENT_NOT_MATCH_PRODUCT = 'Nội dung kênh không phù hợp sản phẩm',
    NOT_MATCH_COMMUNICATION_STRATEGY = 'Không phù hợp với chiến lược truyền thông hiện tại',
    CONTENT_FIELD_NOT_MATCH = 'Lĩnh vực nội dung không phù hợp',
    AUDIENCE_NOT_MATCH = 'Đối tượng người xem không phù hợp',
    CHANNEL_INACTIVE_RECENTLY = 'Kênh ít hoạt động gần đây',
    OTHER = 'Lý do khác',
}

const { Text } = Typography
const OTHER_MIN_LENGTH = 10
const OTHER_MAX_LENGTH = 250

const ModalBulkReject = ({ open, onCancel, onConfirm, loading }: ModalBulkRejectProps) => {
    const [selectedReason, setSelectedReason] = useState<REJECT_REASON | null>(null)
    const [otherReason, setOtherReason] = useState('')

    const reasons = useMemo(() => Object.values(REJECT_REASON), [])
    const isOtherSelected = selectedReason === REJECT_REASON.OTHER

    const otherReasonTrimmed = otherReason.trim()
    const otherReasonValid =
        !isOtherSelected ||
        (otherReasonTrimmed.length >= OTHER_MIN_LENGTH &&
            otherReasonTrimmed.length <= OTHER_MAX_LENGTH)

    const canSubmit =
        selectedReason != null && otherReasonValid && !loading

    useEffect(() => {
        if (!open) {
            setSelectedReason(null)
            setOtherReason('')
        }
    }, [open])

    return (
        <Modal
            open={open}
            onCancel={() => {
                if (loading) return
                onCancel()
            }}
            footer={null}
            title={<Text style={{ fontSize: 18, fontWeight: 600 }}>Từ chối nhà sáng tạo tham gia chiến dịch</Text>}
            centered
            maskClosable={!loading}
            closable={!loading}
            width={600}
        >
            <Flex vertical gap={12} style={{ marginTop: '24px' }}>
                <Text>Hãy chọn lý do từ chối nhà sáng tạo tham gia chiến dịch</Text>

                <Radio.Group
                    value={selectedReason ?? undefined}
                    onChange={(e) => {
                        const next = e.target.value as REJECT_REASON
                        setSelectedReason(next)
                        if (next !== REJECT_REASON.OTHER) setOtherReason('')
                    }}
                >
                    <Flex vertical gap={10}>
                        {reasons.map((reason) => (
                            <div
                                key={reason}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    border: '1px solid #d9d9d9',
                                    borderRadius: 4,
                                    padding: 10,
                                }}
                            >
                                <Radio value={reason}>
                                    <Text>{reason}</Text>
                                </Radio>
                            </div>
                        ))}
                    </Flex>
                </Radio.Group>

                {isOtherSelected && (
                    <Flex vertical gap={6} style={{ marginTop: 4 }}>
                        <Text>Lý do khác</Text>
                        <Input.TextArea
                            placeholder='Nhập lý do cụ thể…'
                            maxLength={OTHER_MAX_LENGTH}
                            autoSize={{ minRows: 3, maxRows: 3 }}
                            value={otherReason}
                            onChange={(e) => setOtherReason(e.target.value)}
                            showCount={{ formatter: () => `${otherReason.length}/${OTHER_MAX_LENGTH}` }}
                        />
                        {!otherReasonValid && (
                            <Text type='danger'>
                                Vui lòng nhập ít nhất {OTHER_MIN_LENGTH} ký tự (không chỉ khoảng trắng).
                            </Text>
                        )}
                    </Flex>
                )}

                <Text style={{ marginTop: '12px' }}>
                    Thông tin này sẽ được gửi đến nhà sáng tạo để giúp họ nâng cao chất lượng hồ sơ.
                </Text>

                <Flex justify='flex-end' gap={10} style={{ marginTop: '24px' }}>
                    <Button type='default' onClick={onCancel} disabled={loading}>
                        Hủy
                    </Button>
                    <Button
                        type='primary'
                        onClick={() => {
                            if (!canSubmit) return
                            const msg =
                                selectedReason === REJECT_REASON.OTHER
                                    ? otherReason.trim()
                                    : selectedReason
                            onConfirm(msg)
                        }}
                        disabled={!canSubmit}
                        loading={loading}
                    >
                        Xác nhận từ chối
                    </Button>
                </Flex>
            </Flex>
        </Modal>
    )
}

export default ModalBulkReject