import { Card, Divider, Flex, Skeleton, Typography } from 'antd'
import React from 'react'
import { ChannelLogo } from '../../components'
import { CampaignStoreInfo } from '../../types/CampaignJobDetail.type'
import dayjs from 'dayjs'

const { Text } = Typography
export interface CampaignInfoProps {
    campaignStore?: CampaignStoreInfo | null
    jobDetail?: {
        createdAt?: string | null
        videoDeadline?: string | null
    } | null
    loading?: boolean
}

const CampaignInfo = ({ campaignStore, jobDetail, loading }: CampaignInfoProps) => {

    if (loading && !campaignStore) {
        return (
            <Card style={{ paddingTop: 0 }}>
                <Flex align='center' gap={10}>
                    <Skeleton.Image active style={{ width: 50, height: 50, borderRadius: 4 }} />
                    <Flex vertical gap={8} style={{ flex: 1 }}>
                        <Flex align='center' gap={10}>
                            <Skeleton.Avatar active size="small" shape="circle" />
                            <Skeleton.Input active size="small" style={{ width: 180 }} />
                        </Flex>
                        <Flex align='center' gap={10}>
                            <Skeleton.Input active size="small" style={{ width: 240 }} />
                            <Divider type='vertical' />
                            <Skeleton.Input active size="small" style={{ width: 180 }} />
                        </Flex>
                    </Flex>
                </Flex>
            </Card>
        )
    }
    return (
        <Card>
            <Flex align='center' gap={10}>
                <img
                    style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                    src={(campaignStore?.bannerMobileUrl ?? campaignStore?.bannerDesktopUrl) ?? undefined}
                    alt="banner"
                />
                <Flex vertical gap={4}>
                    <Flex align='center' gap={10}>
                        <ChannelLogo code={campaignStore?.connectorChannelCode ?? undefined} style={{ width: 18, height: 18 }} />
                        <Text>{campaignStore?.storeName}</Text>
                    </Flex>
                    <Flex gap={10} align='center'>
                        <Text strong>{campaignStore?.campaignName}</Text>
                        <Divider type='vertical' style={{ fontWeight: 400 }} />
                        <Text type='secondary' style={{ fontSize: 12 }}>Thời gian đăng ký: {jobDetail?.createdAt ? dayjs(jobDetail?.createdAt).format('HH:mm DD/MM/YYYY ') : '--'}</Text>
                    </Flex>
                </Flex>
            </Flex>
        </Card>
    )
}

export default CampaignInfo