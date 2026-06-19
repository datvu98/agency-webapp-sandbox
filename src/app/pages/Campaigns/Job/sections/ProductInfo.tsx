import { Button, Card, Col, Divider, Flex, Skeleton, Typography } from 'antd'
import React, { useMemo, useState } from 'react'
import InfoProduct from '../../components/InfoProduct'
import StatusLabel from '../../components/StatusLabel'
import { REGISTER_SAMPLE_STATUS } from '../../CampaignRegister/constants/constant'
import ModalApprove from '../../CampaignRegister/components/modal/ModalApprove'
import ModalBulkReject from '../../CampaignRegister/components/modal/ModalBulkReject'
import { useProductSampleActions } from '../hooks/useProductSampleActions'
import { CampaignSampleRequestInfo } from '../../types/CampaignJobDetail.type'
import { PROCESS_STATUS } from '../constants/constants'

const { Text } = Typography

const MAX_VISIBLE = 4
export interface ProductInfoProps {
    campaignSampleRequest?: CampaignSampleRequestInfo | null
    jobStatus?: string
    loading?: boolean
    onCompleted?: () => Promise<unknown> | void
}

const ProductInfo = ({ campaignSampleRequest, jobStatus, loading, onCompleted }: ProductInfoProps) => {
    const items = campaignSampleRequest?.items
    const [expanded, setExpanded] = useState(false)

    const visibleItems = useMemo(() => {
        if (!items?.length) return []
        if (items.length <= MAX_VISIBLE || expanded) return items
        return items.slice(0, MAX_VISIBLE)
    }, [items, expanded])

    const hasMoreThanMax = (items?.length ?? 0) > MAX_VISIBLE
    const requestId = campaignSampleRequest?.id

    const {
        openApproveModal,
        openRejectModal,
        approveLoading,
        rejectLoading,
        approveProducts,
        setOpenApproveModal,
        setOpenRejectModal,
        checkItemsStock,
        handleApprove,
        handleReject,
    } = useProductSampleActions({
        requestId,
        items,
        onCompleted,
    })

    if (loading && !campaignSampleRequest) {
        return (
            <Card>
                <Flex vertical gap={16}>
                    <Skeleton.Input active size="small" style={{ width: 320 }} />
                    <Skeleton active paragraph={{ rows: 3 }} title={false} />
                    <Divider style={{ margin: '0' }} />
                    <Flex justify="flex-end" gap={8}>
                        <Skeleton.Button active size="default" />
                        <Skeleton.Button active size="default" />
                    </Flex>
                </Flex>
            </Card>
        )
    }

    return (
        <Card>
            <Flex vertical gap={16}>
                {jobStatus === PROCESS_STATUS.PENDING ? <Text strong style={{ fontSize: 16 }}>Xác nhận thông tin sản phẩm mẫu yêu cầu</Text> :
                    <Text strong style={{ fontSize: 16 }}>Thông tin sản phẩm mẫu yêu cầu</Text>}
                
                <Flex vertical gap={16}>
                    {visibleItems.map((item) => (
                        <Flex align='center' justify='space-between' key={item?.id}>
                            <InfoProduct key={item?.id} productDetail={item} />
                            <Col span={1}></Col>
                            {item?.status !== REGISTER_SAMPLE_STATUS.pending && <StatusLabel status={item?.status} />}
                        </Flex>
                    ))}
                    {hasMoreThanMax && (
                        <Button type="link" style={{ alignSelf: 'flex-start', padding: 0, height: 'auto', color: '#ff5629' }} onClick={() => setExpanded((v) => !v)}>
                            {expanded ? 'Thu gọn' : 'Xem thêm'}
                        </Button>
                    )}
                </Flex>

                {jobStatus !== PROCESS_STATUS.CANCELLED && campaignSampleRequest?.status === REGISTER_SAMPLE_STATUS.rejected && <div style={{ backgroundColor: '#ffebeb', width: '100%', borderRadius: 8, padding: 10 }}>
                    <Text strong style={{ color: 'red' }}>Lý do: </Text>
                    <Text style={{ fontSize: 12 }}>{campaignSampleRequest?.rejectMessage}</Text>
                </div>
                }

                {campaignSampleRequest?.status === REGISTER_SAMPLE_STATUS.pending && jobStatus === PROCESS_STATUS.PENDING &&
                    <>
                        <Divider style={{ margin: '0' }} />
                        <Flex justify="flex-end" gap={8}>
                            <Button
                                onClick={() => setOpenRejectModal(true)}
                                loading={rejectLoading}
                            >
                                Từ chối
                            </Button>
                            <Button
                                type="primary"
                                onClick={() => setOpenApproveModal(true)}
                                loading={approveLoading}
                                // disabled={!pendingItemIds.length}
                            >
                                Duyệt
                            </Button>
                        </Flex>
                    </>
                }
            </Flex>

            <ModalApprove
                open={openApproveModal}
                onCancel={() => {
                    if (approveLoading) return
                    setOpenApproveModal(false)
                }}
                loading={approveLoading}
                dataProduct={approveProducts}
                onConfirm={handleApprove}
                checkItemsStock={checkItemsStock}
            />

            <ModalBulkReject
                open={openRejectModal}
                onCancel={() => {
                    if (rejectLoading) return
                    setOpenRejectModal(false)
                }}
                onConfirm={handleReject}
                loading={rejectLoading}
            />
        </Card>
    )
}

export default ProductInfo