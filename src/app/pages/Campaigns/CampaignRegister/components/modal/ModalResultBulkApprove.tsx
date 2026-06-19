import { Button, Divider, Flex, Modal, Progress, Table, Typography } from 'antd'
import dayjs from 'dayjs'
import React, { useState } from 'react'
import { ICampaignJob } from '../../types/CampaignRegisterTable.types'
import { APPROVE_SAMPLE_ERROR_CODE } from '../../constants/constant'

interface DataError {
    key: string
    creatorChannelName: string
    creatorChannelUsername: string
    createdAt: string
    errorMessage: string
    error_code?: string
    row: ICampaignJob
}

interface ModalResultBulkApproveProps {
    open: boolean
    onCancel: () => void
    total: number
    processed: number
    totalSuccess: number
    totalError: number
    dataError: DataError[]
    isProcessing: boolean
    onCancelProcessing: () => void
    onRetryApproveRow: (row: ICampaignJob) => void | Promise<void>
}

const { Text } = Typography;

const ModalResultBulkApprove = ({
    open,
    onCancel,
    total,
    processed,
    totalSuccess,
    totalError,
    dataError,
    isProcessing,
    onCancelProcessing,
    onRetryApproveRow,
}: ModalResultBulkApproveProps) => {
    const [retriedKeys, setRetriedKeys] = useState<Set<string>>(new Set());
    const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());

    const columns = [
        {
            title: 'Nhà sáng tạo',
            dataIndex: 'creatorChannelName',
            key: 'creatorChannelName',
            width: '25%',
            render: (text: string, record: DataError) => {
                return (
                    <Flex vertical>
                        <Text>{record.creatorChannelName}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{record.creatorChannelUsername}</Text>
                    </Flex>
                )
            },
        },
        {
            title: 'Thời gian đăng ký',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '20%',
            render: (text: string, record: DataError) => {
                return (
                    <Text>{dayjs(record.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                )
            },
        },
        {
            title: 'Lỗi',
            dataIndex: 'errorMessage',
            key: 'errorMessage',
            width: '60%',
            render: (text: string, record: DataError) => {
                return (
                    <Flex vertical gap={4}>
                        <Text>{record.errorMessage}</Text>
                        {!retriedKeys.has(record.key) &&
                            record.error_code === APPROVE_SAMPLE_ERROR_CODE.STOCK_UNAVAILABLE && (
                            <Button
                                type='primary'
                                style={{ width: '200px' }}
                                loading={loadingKeys.has(record.key)}
                                onClick={async () => {
                                    setLoadingKeys((prev) => new Set(prev).add(record.key));
                                    try {
                                        await onRetryApproveRow(record.row);
                                        setRetriedKeys((prev) => new Set(prev).add(record.key));
                                    } finally {
                                        setLoadingKeys((prev) => {
                                            const next = new Set(prev);
                                            next.delete(record.key);
                                            return next;
                                        });
                                    }
                                }}
                            >
                                Tiếp tục tạo đơn
                            </Button>
                        )}
                    </Flex>
                )
            },
        },
    ]

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            title={<Text style={{ fontSize: 18, fontWeight: 600 }}>Duyệt đăng ký mẫu</Text>}
            centered
            maskClosable={!isProcessing}
            closable={!isProcessing}
            width={700}
        >
            <Divider />
            <Flex vertical gap={10} >
                <div style={{ position: 'relative' }}>
                    <Progress
                        percent={total > 0 ? Math.round((processed / total) * 100) : 0}
                        strokeWidth={24}
                        showInfo={false}
                        strokeColor={{
                            '0%': '#ff5629',
                            '100%': '#ff5629',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontWeight: 600,
                            color: '#fff',
                        }}
                    >
                        {total > 0 ? Math.round((processed / total) * 100) : 0}%
                    </div>
                </div>
                <Flex vertical gap={6} style={{ margin: '14px 0' }}>
                    <Text>Tổng số lượt đăng ký cần xử lý: <Text>{total}</Text></Text>
                    <Text>Tổng số lượt đăng ký thành công: <Text style={{ color: '#52c41a' }}>{totalSuccess}</Text></Text>
                    <Text>Tổng số lượt đăng ký thất bại: <Text style={{ color: '#ff5629' }}>{totalError}</Text></Text>
                </Flex>
                {isProcessing && (
                    <Flex vertical gap={10}>
                        <Divider />
                        <Flex justify='flex-end'>
                            <Button type='primary' onClick={onCancelProcessing}>Đóng</Button>
                        </Flex>
                    </Flex>
                )}

                {totalError > 0 && (
                    <Flex vertical gap={10}>
                        <Divider />
                        <Table
                            rowKey='key'
                            columns={columns}
                            dataSource={dataError}
                            pagination={false}
                            scroll={{ y: 300 }}
                        />
                    </Flex>
                )}
            </Flex>
            <Flex justify='flex-end' gap={10} style={{ marginTop: '24px' }}>
                <Button type='primary' onClick={onCancel}>Đóng</Button>
            </Flex>
        </Modal>
    )
}

export default ModalResultBulkApprove