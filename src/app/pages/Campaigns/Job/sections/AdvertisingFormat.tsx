import { Card, Divider, Flex, Skeleton, Typography } from 'antd'
import React from 'react'
import { JobProductInfo } from '../../types/CampaignJobDetail.type'
import { PROCESS_STATUS } from '../constants/constants'

const { Text } = Typography

const REJECTED_STATUS = 'rejected'

export interface AdvertisingFormatProps {
    jobProducts?: JobProductInfo[] | null
    videoCount?: number | null
    liveSessionCount?: number | null
    loading?: boolean,
    jobStatus?: string
}

const AdvertisingFormat = ({ jobProducts, videoCount, liveSessionCount, loading, jobStatus }: AdvertisingFormatProps) => {

    const visibleJobProducts = (jobProducts ?? []).filter((product) => product?.status !== REJECTED_STATUS)
    const totalVideoCount = videoCount ?? 0
    const minVideoPerProduct = visibleJobProducts.length ? totalVideoCount / visibleJobProducts.length : 0
    const totalLiveSessionCount = liveSessionCount ?? 0

    if (loading && !(jobProducts?.length ?? 0)) {
        return (
            <Card>
                <Flex vertical gap={16}>
                    <Skeleton.Input active size="small" style={{ width: 180 }} />

                    <Flex vertical gap={12}>
                        <Skeleton.Input active size="small" style={{ width: 420 }} />
                        <Flex align='center' gap={8}>
                            <Skeleton.Image active style={{ width: 50, height: 50, borderRadius: 4 }} />
                            <Skeleton.Image active style={{ width: 50, height: 50, borderRadius: 4 }} />
                            <Skeleton.Image active style={{ width: 50, height: 50, borderRadius: 4 }} />
                        </Flex>
                    </Flex>

                    {/* <Divider style={{ margin: '0' }} />

                    <Flex vertical gap={12}>
                        <Skeleton.Input active size="small" style={{ width: 300 }} />
                        <Flex align='center' gap={8}>
                            <Skeleton.Image active style={{ width: 50, height: 50, borderRadius: 4 }} />
                            <Skeleton.Image active style={{ width: 50, height: 50, borderRadius: 4 }} />
                            <Skeleton.Image active style={{ width: 50, height: 50, borderRadius: 4 }} />
                        </Flex>
                    </Flex> */}
                </Flex>
            </Card>
        )
    }

    return (
        <Card>
            <Flex vertical gap={16}>
                <Text strong style={{ fontSize: 16 }}>Hình thức quảng cáo</Text>
                {totalVideoCount > 0 && <Flex vertical gap={16}>
                    <Flex align='center' gap={4}>
                        <Text>{jobStatus === PROCESS_STATUS.PENDING ? 'Số lượng video dự kiến phải trả' : 'Số lượng video cam kết'} <Text strong>{totalVideoCount}</Text></Text>
                        <Divider type='vertical' />
                        <Text type="secondary" style={{ fontSize: 12 }}>Mỗi sản phẩm phải trả tối thiểu <Text type="secondary" style={{ fontSize: 12 }}>{minVideoPerProduct}</Text> video</Text>
                    </Flex>
                    <Flex align='center' gap={4}>
                        {visibleJobProducts.map((product, index) => (
                            <img key={product?.id || `${product?.productImage}-${index}`} src={product?.productImage ?? undefined} alt="alt" width={50} height={50} style={{ borderRadius: 4, objectFit: 'cover', boxShadow: '0 4px 10px rgba(97, 97, 97, 0.1)' }} />
                        ))}
                    </Flex>
                </Flex>
                }

                {totalLiveSessionCount > 0 && <Flex vertical gap={16}>
                    <Text>{jobStatus === PROCESS_STATUS.PENDING ? 'Số lượng livestream dự kiến phải trả' : 'Số lượng livestream cam kết'} <Text strong>{totalLiveSessionCount}</Text></Text>
                    <Flex align='center' gap={4}>
                        {visibleJobProducts.map((product, index) => (
                            <img key={product?.id || `${product?.productImage}-${index}`} src={product?.productImage ?? undefined} alt="alt" width={50} height={50} style={{ borderRadius: 4, objectFit: 'cover', boxShadow: '0 4px 10px rgba(97, 97, 97, 0.1)' }} />
                        ))}
                    </Flex>
                </Flex>}
            </Flex>
        </Card>
    )
}

export default AdvertisingFormat