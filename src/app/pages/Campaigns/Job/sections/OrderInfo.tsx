import { Button, Card, Divider, Flex, Input, Skeleton, Spin, Steps, Tabs, Tooltip, Typography } from 'antd'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CopyText from '../../components/CopyText'
import { CampaignSampleRequestItemInfo, OrderInfoData } from '../../types/CampaignJobDetail.type'
import { REGISTER_SAMPLE_STATUS } from '../../CampaignRegister/constants/constant'
import { PROCESS_STATUS } from '../constants/constants'
import { useJobDetail } from '../hooks/useJobDetail'
import { CloseCircleOutlined, CloseOutlined, EditOutlined, InfoCircleOutlined } from '@ant-design/icons'

const { Text } = Typography

const NEED_PROCESS_ORDER_CANCEL_TOOLTIP = 'Đơn đã bị hủy, vui lòng liên kết đơn mới để quy trình được tiếp tục'
export interface OrderInfoProps {
    orderInfo?: OrderInfoData | null
    sampleItems?: CampaignSampleRequestItemInfo[] | null
    loading?: boolean
    jobStatus?: string | null
}

const NO_DATA = '--'
const MAX_VISIBLE_IMAGES = 4

const formatDateTime = (value?: string | number | null, isUnix = false) => {
    if (value == null || value === '') return NO_DATA
    const date = isUnix ? new Date(Number(value) * 1000) : new Date(value)
    if (Number.isNaN(date.getTime())) return NO_DATA

    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
}

const OrderInfo = ({ orderInfo, sampleItems, loading, jobStatus }: OrderInfoProps) => {
    const {
        jobDetailData,
        saveCampaignJobOrderInfo,
        updateCampaignJobOrderInfoLoading,
    } = useJobDetail()
    const approvedItems = (sampleItems ?? []).filter((item) => item?.status === REGISTER_SAMPLE_STATUS.approved)
    const [showAllImages, setShowAllImages] = useState(false)
    const [tabHistory, setTabHistory] = useState<'order' | 'shipping'>('order')
    const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null)
    const hasMoreThanMaxImages = approvedItems.length > MAX_VISIBLE_IMAGES
    const visibleItems = showAllImages ? approvedItems : approvedItems.slice(0, MAX_VISIBLE_IMAGES)
    const logisticsPackages = orderInfo?.logisticsPackages ?? []
    const recipientName = jobDetailData?.campaignSampleRequest?.recipientName || orderInfo?.customerRecipientAddress?.full_name || NO_DATA
    const recipientPhone = jobDetailData?.campaignSampleRequest?.phone || orderInfo?.customerRecipientAddress?.phone || NO_DATA
    const recipientAddress = jobDetailData?.campaignSampleRequest?.fullAddress || orderInfo?.customerRecipientAddress?.full_address || NO_DATA

    const [isEditOrderInfo, setIsEditOrderInfo] = useState(false)
    const [refOrderIdDraft, setRefOrderIdDraft] = useState('')
    const inputRef = useRef<any>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isEditOrderInfo) {
            setRefOrderIdDraft(orderInfo?.ref_id ?? '')
        }
    }, [orderInfo?.ref_id, isEditOrderInfo])

    // Handle click outside
    useEffect(() => {
        if (!isEditOrderInfo) return

        const handleClickOutside = async (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                // Check if the draft value is different from original
                const originalValue = orderInfo?.ref_id ?? ''
                if (refOrderIdDraft !== originalValue && refOrderIdDraft.trim()) {
                    // Call API to save
                    const ok = await saveCampaignJobOrderInfo(refOrderIdDraft)
                    if (ok) {
                        setIsEditOrderInfo(false)
                    }
                } else {
                    // Just close without saving
                    setIsEditOrderInfo(false)
                }
            }
        }

        // Add delay to avoid immediate triggering when opening
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside)
        }, 100)

        return () => {
            clearTimeout(timer)
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isEditOrderInfo, refOrderIdDraft, orderInfo?.ref_id, saveCampaignJobOrderInfo])

    const selectedPackage = useMemo(() => {
        return logisticsPackages.find((pkg) => pkg?.id === selectedPackageId) ?? logisticsPackages[0]
    }, [logisticsPackages, selectedPackageId])

    const packagingSteps = useMemo(() => {
        const items = (selectedPackage?.packHistory ?? [])
            .filter((item) => !!item?.pack_status)
            .sort((a, b) => {
                const first = new Date(a?.updated_at ?? '').getTime()
                const second = new Date(b?.updated_at ?? '').getTime()
                return (Number.isNaN(first) ? 0 : first) - (Number.isNaN(second) ? 0 : second)
            })

        return items.map((item) => ({
            title: item?.pack_name || NO_DATA,
            description: formatDateTime(item?.updated_at),
        }))
    }, [selectedPackage])

    const shippingSteps = useMemo(() => {
        const items = selectedPackage?.logisticsTrackingInfo ?? []
        return items.map((item) => ({
            title: <div dangerouslySetInnerHTML={{ __html: item?.description || NO_DATA }} />,
            description: formatDateTime(item?.tracking_update_time, true),
        }))
    }, [selectedPackage])

    const handleOpenEditOrderInfo = () => {
        setRefOrderIdDraft(orderInfo?.ref_id ?? '')
        setIsEditOrderInfo(true)
    }

    const handleCancelEditOrderInfo = () => {
        setRefOrderIdDraft(orderInfo?.ref_id ?? '')
        setIsEditOrderInfo(false)
    }

    const handleSaveOrderRefId = useCallback(async () => {
        const ok = await saveCampaignJobOrderInfo(refOrderIdDraft)
        if (ok) {
            setIsEditOrderInfo(false)
        }
    }, [refOrderIdDraft, saveCampaignJobOrderInfo])

    if (loading && !orderInfo) {
        return (
            <Card>
                <Flex vertical gap={16}>
                    <Flex vertical gap={8}>
                        <Skeleton.Input active size="small" style={{ width: 160 }} />
                        <Skeleton.Input active size="small" style={{ width: 220 }} />
                        <Skeleton.Input active size="small" style={{ width: 180 }} />
                        <Skeleton.Input active size="small" style={{ width: '100%' }} />
                    </Flex>

                    <Divider style={{ marginTop: 0, marginBottom: 0 }} />

                    <Flex vertical gap={8}>
                        <Skeleton.Input active size="small" style={{ width: 100 }} />
                        <Skeleton.Input active size="small" style={{ width: 180 }} />
                    </Flex>

                    <Divider style={{ marginTop: 0, marginBottom: 0 }} />

                    <Flex vertical gap={8}>
                        <Skeleton.Input active size="small" style={{ width: 100 }} />
                        <Flex align='center' gap={8}>
                            <Skeleton.Image active style={{ width: 50, height: 50, borderRadius: 4 }} />
                            <Skeleton.Image active style={{ width: 50, height: 50, borderRadius: 4 }} />
                            <Skeleton.Input active size="small" style={{ width: 220 }} />
                        </Flex>
                        <Skeleton.Input active size="small" style={{ width: 180 }} />
                    </Flex>
                </Flex>
            </Card>
        )
    }

    if (recipientName === NO_DATA && recipientPhone === NO_DATA && recipientAddress === NO_DATA) {
        return (
            <Card>
                <Flex vertical gap={16}>
                    <Text strong>Thông tin nhận hàng</Text>
                    <Text type="secondary">Chưa có thông tin nhận hàng</Text>
                </Flex>
            </Card>
        )
    }

    return (
        <Card>
            <Flex vertical gap={16}>
                <Flex vertical>
                    <Text strong style={{ fontSize: 16, marginBottom: 8 }}>Thông tin nhận hàng</Text>
                    <Text type="secondary">{recipientName}</Text>
                    <Text type="secondary">{recipientPhone}</Text>
                    <Text type="secondary">{recipientAddress}</Text>
                </Flex>

                {jobStatus !== PROCESS_STATUS.PENDING && (
                    <>
                        <Divider style={{ marginTop: 0, marginBottom: 0 }} />

                        <Flex vertical>
                            <Flex align='center' gap={4}>
                                <Text strong style={{ fontSize: 16 }}>Mã đơn hàng</Text>
                                {jobDetailData?.isPreShippingCancel && <Tooltip title={NEED_PROCESS_ORDER_CANCEL_TOOLTIP}>
                                    <InfoCircleOutlined style={{ fontSize: 16, color: '#ff4d4f', marginLeft: 4 }} />
                                </Tooltip>}
                            </Flex>
                            <Flex align='center' gap={4} ref={containerRef}>
                                {isEditOrderInfo ? (
                                    <Input
                                        ref={inputRef}
                                        value={refOrderIdDraft}
                                        onChange={(e) => setRefOrderIdDraft(e.target.value)}
                                        onPressEnter={() => void handleSaveOrderRefId()}
                                        disabled={updateCampaignJobOrderInfoLoading}
                                        placeholder="Nhập mã đơn hàng"
                                        autoFocus
                                        style={{ maxWidth: 280 }}
                                    />
                                ) : (
                                    <CopyText text={orderInfo?.ref_id || NO_DATA} hideIcon={orderInfo?.ref_id ? false : true}>
                                        <Text type="secondary">{orderInfo?.ref_id || NO_DATA}</Text>
                                    </CopyText>
                                )}
                                {jobDetailData?.isPreShippingCancel &&
                                    <Button
                                        type='link'
                                        style={{ padding: 0, marginLeft: 6, width: 'fit-content' }}
                                        onMouseDown={(event) => {
                                            event.preventDefault()
                                            event.stopPropagation()
                                        }}
                                        onClick={(event) => {
                                            event.preventDefault()
                                            if (isEditOrderInfo) {
                                                handleCancelEditOrderInfo()
                                            } else {
                                                handleOpenEditOrderInfo()
                                            }
                                        }}
                                    >
                                        {isEditOrderInfo ?
                                            (updateCampaignJobOrderInfoLoading
                                                ? <Spin size="small" /> : <CloseOutlined style={{ fontSize: 16, color: '#8c8c8c', fontWeight: 600 }} />)
                                            : <EditOutlined style={{ fontSize: 16, color: '#8c8c8c' }} />}
                                    </Button>}
                            </Flex>
                        </Flex>

                        <Divider style={{ marginTop: 0, marginBottom: 0 }} />

                        <Flex vertical gap={8}>
                            <Text strong style={{ fontSize: 16 }}>Theo dõi đơn</Text>
                            <Flex align='center' gap={8}>
                                <Flex align='center' gap={4}>
                                    {visibleItems.map((item, index) => {
                                        const hiddenCount = approvedItems.length - MAX_VISIBLE_IMAGES
                                        const isLastCollapsedImage = !showAllImages && hasMoreThanMaxImages && index === MAX_VISIBLE_IMAGES - 1

                                        return (
                                            <div
                                                key={item?.id || `${item?.variantImage}-${index}`}
                                                onClick={isLastCollapsedImage ? () => setShowAllImages(true) : undefined}
                                                style={{
                                                    position: 'relative',
                                                    cursor: isLastCollapsedImage ? 'pointer' : 'default',
                                                }}
                                            >
                                                <img
                                                    src={item?.variantImage ?? undefined}
                                                    alt="product"
                                                    width={50}
                                                    height={50}
                                                    style={{ borderRadius: 4, objectFit: 'cover', boxShadow: '0 4px 10px rgba(97, 97, 97, 0.1)' }}
                                                />
                                                {isLastCollapsedImage && (
                                                    <Flex
                                                        align='center'
                                                        justify='center'
                                                        style={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            backgroundColor: 'rgba(0, 0, 0, 0.45)',
                                                            borderRadius: 4,
                                                            color: '#fff',
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        +{hiddenCount}
                                                    </Flex>
                                                )}
                                            </div>
                                        )
                                    })}
                                </Flex>
                                <Text type='secondary'>- Tổng <Text>{approvedItems.length}</Text> hàng hóa.</Text>
                            </Flex>
                            <CopyText
                                text={selectedPackage?.tracking_number || NO_DATA}
                                hideIcon={selectedPackage?.tracking_number ? false : true}
                            >
                                <Text type="secondary">{selectedPackage?.tracking_number || NO_DATA}</Text>
                            </CopyText>
                        </Flex>

                        <Flex vertical gap={12}>
                            {logisticsPackages.length > 1 && (
                                <Flex gap={8} wrap="wrap">
                                    {logisticsPackages.map((pkg, index) => (
                                        <Button
                                            key={pkg?.id || index}
                                            size="small"
                                            type={(selectedPackage?.id ?? logisticsPackages[0]?.id) === pkg?.id ? 'primary' : 'default'}
                                            onClick={() => setSelectedPackageId(pkg?.id ?? null)}
                                        >
                                            Kiện hàng: {index + 1}
                                        </Button>
                                    ))}
                                </Flex>
                            )}

                            <Tabs
                                size="small"
                                activeKey={tabHistory}
                                onChange={(key) => setTabHistory(key as 'order' | 'shipping')}
                                items={[
                                    {
                                        key: 'order',
                                        label: 'Đóng gói',
                                        children: packagingSteps.length ? (
                                            <Steps
                                                direction="vertical"
                                                current={packagingSteps.length - 1}
                                                items={packagingSteps}
                                            />
                                        ) : (
                                            <Text type="secondary">{NO_DATA}</Text>
                                        ),
                                    },
                                    {
                                        key: 'shipping',
                                        label: 'Vận chuyển',
                                        children: shippingSteps.length ? (
                                            <Steps
                                                direction="vertical"
                                                current={shippingSteps.length - 1}
                                                items={shippingSteps}
                                            />
                                        ) : (
                                            <Text type="secondary">{NO_DATA}</Text>
                                        ),
                                    },
                                ]}
                            />
                        </Flex>
                    </>
                )}
            </Flex>
        </Card>
    )
}

export default OrderInfo