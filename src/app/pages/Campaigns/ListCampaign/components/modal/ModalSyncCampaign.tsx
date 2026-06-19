import { InfoCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import { Button, Divider, Flex, Input, Modal, Progress, Radio, Spin, Table, Typography } from 'antd'
import React, { useEffect, useRef, useState } from 'react'

interface ModalSyncCampaignProps {
    show: boolean
    onHide: () => void
    handleSyncCampaign: () => void
    handleSyncCampaignByIds?: (ids: string[]) => void
    isTracking?: boolean
    isCompleted?: boolean
    trackingData?: {
        total?: number
        totalSuccess?: number
        totalFail?: number
        listErrorMessage?: Array<{ ref_id?: string; message?: string, campaign_name?: string } | string>
    }
    totalEligibleCount?: number
    isLoadingInitial?: boolean
}

const { Text } = Typography;

type SyncMode = 'all' | 'by_id';

const ModalSyncCampaign = ({
    show, onHide, handleSyncCampaign, handleSyncCampaignByIds,
    isTracking = false, isCompleted = false, trackingData, totalEligibleCount, isLoadingInitial = false }: ModalSyncCampaignProps) => {
    const hasTriggeredRef = useRef(false);
    const [phase, setPhase] = useState<'selection' | 'syncing'>('selection');
    const [syncMode, setSyncMode] = useState<SyncMode>('all');
    const [rawIds, setRawIds] = useState('');

    useEffect(() => {
        if (!show) {
            hasTriggeredRef.current = false;
            setPhase('selection');
            setSyncMode('all');
            setRawIds('');
            return;
        }

        // Nếu đang có tiến trình chạy hoặc đã hoàn thành, bỏ qua selection
        if (isTracking || isCompleted) {
            setPhase('syncing');
            return;
        }

        if (phase !== 'syncing') return;

        // Chỉ auto-trigger cho mode "tải tất cả"
        if (syncMode !== 'all') return;

        if (!hasTriggeredRef.current && !isLoadingInitial) {
            hasTriggeredRef.current = true;
            handleSyncCampaign();
        }
    }, [show, phase, syncMode, isTracking, isCompleted, isLoadingInitial, handleSyncCampaign]);

    const handleConfirm = () => {
        if (syncMode === 'by_id') {
            const ids = rawIds
                .split(/[\s,;]+/)
                .map((s) => s.trim())
                .filter(Boolean);
            if (ids.length === 0) return;
            setPhase('syncing');
            handleSyncCampaignByIds?.(ids);
        } else {
            setPhase('syncing');
        }
    };

    const confirmDisabled = syncMode === 'by_id' && rawIds.trim() === '';

    const total = trackingData?.total ?? 0;
    const totalSuccess = trackingData?.totalSuccess ?? 0;
    const totalError = trackingData?.totalFail ?? 0;
    const totalDone = totalSuccess;
    // by_id: tính progress theo tổng đã xử lý (success + fail); all: chỉ theo success
    const totalProcessed = syncMode === 'by_id' ? totalSuccess + totalError : totalDone;
    const percent = total > 0 ? Math.round((totalProcessed / total) * 100) : 0;
    const errorList = trackingData?.listErrorMessage ?? [];

    // Chỉ hiển thị bảng lỗi khi đã hoàn thành và có lỗi
    const shouldShowErrorTable = Array.isArray(errorList) && errorList.length > 0;

    const tableDataSource = shouldShowErrorTable
        ? errorList.map((item: any, index: number) => ({
            key: String(index),
            campaign_name: typeof item === 'object' ? (item?.campaign_name ?? '--') : '--',
            ref_id: typeof item === 'object' ? (item?.ref_id ?? '--') : '--',
            message: typeof item === 'object' ? (item?.message ?? '--') : String(item),
        }))
        : [];

    const columns = [
        {
            title: 'Chiến dịch',
            dataIndex: 'campaign_name',
            key: 'campaign_name',
            width: '40%',
            render: (value: string, record: any) => {
                return (
                    <Flex vertical>
                        <Text>{value ?? '--'}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>ID: {record?.ref_id ?? '--'}</Text>
                    </Flex>
                )
            }
        },
        {
            title: 'Lỗi',
            dataIndex: 'message',
            key: 'message',
            width: '60%',
        }
    ]

    return (
        <Modal
            title="Tải chiến dịch"
            open={show}
            onCancel={onHide}
            footer={
                <Flex justify="flex-end" gap={8}>
                    <Button onClick={onHide} disabled={isLoadingInitial}>
                        Đóng
                    </Button>
                    {phase === 'selection' && (
                        <Button type="primary" onClick={handleConfirm} disabled={confirmDisabled}>
                            Xác nhận
                        </Button>
                    )}
                </Flex>
            }
            centered
            width={600}
        >
            <Divider style={{ marginBottom: '20px' }} />

            {phase === 'selection' ? (
                <Flex vertical gap={16}>
                    <Radio.Group
                        value={syncMode}
                        onChange={(e) => setSyncMode(e.target.value)}
                    >
                        <Flex vertical gap={12}>
                            <Radio value="all">Tải tất cả chiến dịch</Radio>
                            <Radio value="by_id">Tải theo ID chiến dịch</Radio>
                        </Flex>
                    </Radio.Group>

                    {syncMode === 'by_id' && (
                        <Flex vertical gap={4}>
                            <Input.TextArea
                                placeholder="Nhập ID chiến dịch, cách nhau bởi dấu cách, dấu phẩy hoặc dấu chấm phẩy"
                                value={rawIds}
                                onChange={(e) => setRawIds(e.target.value)}
                                autoSize={{ minRows: 3, maxRows: 6 }}
                            />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Ví dụ: 123 456, 789; 101112
                            </Text>
                        </Flex>
                    )}
                </Flex>
            ) : (
                isLoadingInitial ? (
                    <Flex vertical gap={16} align="center" justify="center">
                        <Spin
                            indicator={<LoadingOutlined style={{ fontSize: 48, color: '#ff5629' }} spin />}
                        />
                    </Flex>
                ) : !isTracking && !isCompleted ?
                    <Flex align="center" justify="center">
                        <Text>Đang bắt đầu tải chiến dịch...</Text>
                    </Flex> : <>
                        <Flex vertical gap={16} align="center">
                            <div
                                style={{
                                    width: '100%',
                                    position: "relative",
                                }}
                            >
                                <Progress
                                    percent={percent}
                                    strokeWidth={24}
                                    showInfo={false}
                                    strokeColor={{
                                        '0%': '#ff5629',
                                        '100%': '#ff5629',
                                    }}
                                />

                                <div
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        color: "#fff",
                                        fontWeight: 600,
                                        pointerEvents: "none",
                                    }}
                                >
                                    {percent}%
                                </div>
                            </div>
                            <Flex align="center" gap={8}>
                                <InfoCircleOutlined style={{ color: '#666', fontSize: 18 }} />
                                <Text style={{ color: '#666', fontSize: 12 }}>Hệ thống chỉ hiện thị những chiến dịch đã xác nhận hợp tác giữa Nhà bán hàng và Đối tác liên kết.</Text>
                            </Flex>
                        </Flex>
                        <Flex align="start" gap={4} vertical style={{ margin: '16px 0' }}>
                            <Text>Tổng số chiến dịch cần tải: <Text>{total}</Text></Text>
                            <Text>Tổng số chiến dịch tải thành công: <Text style={{ color: '#3ac200' }}>{totalDone}</Text></Text>
                            {/* {syncMode === 'all' && (
                                <Text>Tổng số chiến dịch đủ điều kiện hiển thị: <Text style={{ color: '#3ac200' }}>{totalEligibleCount}</Text></Text>
                            )} */}
                            <Text>Tổng số chiến dịch tải thất bại: <Text style={{ color: '#ff4d4f' }}>{totalError}</Text></Text>
                        </Flex>
                        {shouldShowErrorTable && (
                            <Table dataSource={tableDataSource} columns={columns} bordered
                                pagination={
                                    {
                                        pageSize: 3,
                                    }
                                } />
                        )}
                    </>
            )}

            <Divider style={{ margin: '16px 0' }} />
        </Modal>
    )
}

export default ModalSyncCampaign