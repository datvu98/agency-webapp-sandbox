import { FileTextOutlined } from '@ant-design/icons'
import { Card, Col, Divider, Flex, Row, Skeleton, Tag, Typography } from 'antd'
import React from 'react'
import CopyText from '../../components/CopyText'
import { CreatorPerformanceItem } from '../../types/CampaignJobDetail.type'

const { Text } = Typography

const DISPLAY_EMPTY = '--'
const FEMALE_COLOR = '#eb2f96'
const MALE_COLOR = '#1677ff'
const BAR_BG = '#f0f0f0'
export interface CreatorPerformanceQueryData {
  affGetCreatorChannelPerformances?: {
    data?: {
      items?: CreatorPerformanceItem[] | null
    } | null
  } | null
}

export interface CreatorPerformanceProps {
  performancesData?: CreatorPerformanceQueryData | null
  performancesLoading?: boolean
  jobDetailData?: {
    creatorChannelName?: string
    creatorChannelUsername?: string
  } | null
  jobDetailLoading?: boolean
}

const CreatorPerformance = ({
  performancesData,
  performancesLoading,
  jobDetailData,
  jobDetailLoading,
}: CreatorPerformanceProps) => {

  const performancesDataItem = performancesData?.affGetCreatorChannelPerformances?.data?.items?.[0]
  const creator = performancesDataItem?.creatorChannel

  //Chữ cái đầu tiên của tên KOC
  const firstLetter = jobDetailData?.creatorChannelName?.charAt(0)?.toUpperCase()
  const creatorName = jobDetailData?.creatorChannelName || 'Creator'
  const creatorUsername = jobDetailData?.creatorChannelUsername || 'username'
  const creatorRefUrl = creator?.ref_url || ''
  const followerCount = performancesDataItem?.followerCount || DISPLAY_EMPTY

  const isGmvHiddenByCreator = performancesDataItem?.isGmvHiddenByCreator ?? false
  const gmv =
    performancesDataItem?.gmvAmount != null &&
      !Number.isNaN(performancesDataItem.gmvAmount)
      ? `${performancesDataItem.gmvAmount.toLocaleString('vi-VN')} VNĐ`
      : '0'
  
  const gmvAmount = isGmvHiddenByCreator ? `~${gmv}` : gmv
  const ecVideoEngagementRate = (performancesDataItem?.ecVideoEngagementRate ?? 0) / 100 + '%' || DISPLAY_EMPTY

  const performanceRows = [
    { label: 'GMV', value: gmvAmount },
    { label: 'Tỷ lệ tương tác', value: ecVideoEngagementRate },
    { label: 'Số món bán ra', value: performancesDataItem?.unitsSold },
    { label: 'Lượt xem video trung bình', value: performancesDataItem?.avgEcVideoPlayCount },
    { label: 'Lượt xem LIVE trung bình', value: performancesDataItem?.avgEcLiveViewCount },
  ]

  const femaleRate = Number(performancesDataItem?.followerGenderFemale ?? 0)
  const maleRate = Number(performancesDataItem?.followerGenderMale ?? 0)
  const ageRows = [
    { label: '18-24', value: Number((performancesDataItem?.age18_24FollowerRate ?? 0) * 100) },
    { label: '25-34', value: Number((performancesDataItem?.age25_34FollowerRate ?? 0) * 100) },
    { label: '35-44', value: Number((performancesDataItem?.age35_44FollowerRate ?? 0) * 100) },
    { label: '45-54', value: Number((performancesDataItem?.age45_54FollowerRate ?? 0) * 100) },
    { label: '55+', value: Number((performancesDataItem?.age55PlusFollowerRate ?? 0) * 100) },
  ]

  const formatPercent = (value: number) => {
    return value.toFixed(2).replace('.', ',')
  }

  const formatAgePercent = (value: number) => {
    const rounded = Math.round(value * 10) / 10
    return rounded.toFixed(2).replace('.', ',')
  }

  const renderInfoRows = (rows: { label: string; value: React.ReactNode }[]) => (
    <Flex vertical gap={8}>
      {rows.map((row) => (
        // <Row key={row.label}>
        //   <Col span={18}>
        //     <Text type="secondary">{row.label}</Text>
        //   </Col>
        //   <Col span={2}></Col>
        //   <Col span={4}>{row.value || DISPLAY_EMPTY}</Col>
        // </Row>
        <Flex key={row.label} justify='space-between' align='center'>
          <Text type="secondary">{row.label}</Text>
          <Text>{row.value ?? DISPLAY_EMPTY}</Text>
        </Flex>
      ))}
    </Flex>
  )

  const isLoading = jobDetailLoading || performancesLoading

  if (isLoading) {
    return (
      <Card>
        <Flex vertical gap={16}>
          <Skeleton avatar paragraph={{ rows: 2 }} active />
          <Divider />
          <Skeleton active paragraph={{ rows: 5 }} title={false} />
          <Divider />
          <Skeleton active paragraph={{ rows: 2 }} title={false} />
          <Divider />
          <Skeleton active paragraph={{ rows: 1 }} title={false} />
        </Flex>
      </Card>
    )
  }

  return (
    <Card>
      <Flex vertical>
        <Row>
          <Flex gap={16} align='center'>
            <span className='avatar-letter'>{firstLetter}</span>
            <Flex vertical>
              <Text strong>{creatorName}</Text>
              <CopyText text={creatorRefUrl || creatorName} hideIcon={false}>
                <Text
                  style={{ color: '#006aff', cursor: 'pointer', fontSize: 12 }}
                  onClick={() => {
                    if (!creatorRefUrl) return
                    window.open(creatorRefUrl, '_blank')
                  }}
                >
                  {creatorUsername}
                </Text>
              </CopyText>
              <Text>
                {followerCount} <Text type="secondary">Người theo dõi</Text>
              </Text>
            </Flex>
          </Flex>
        </Row>

        <Divider />

        {renderInfoRows(performanceRows)}

        <Divider />

        <Text type="secondary" style={{ marginBottom: 8 }}>Lĩnh vực</Text>
        <Flex wrap='wrap' gap={8}>
          {performancesDataItem?.listCategories?.map((category) => (
            <Tag key={category.id}>
              <Text style={{ maxWidth: 250, fontSize: 12 }} ellipsis={{ tooltip: true }}>{category.display_name}</Text>
            </Tag>
          ))}
        </Flex>

        <Divider />
        <Text type="secondary" style={{ marginBottom: 8 }}>Giới tính người theo dõi</Text>
        <Flex vertical gap={10}>
          <Flex justify='space-between' align='center'>
            <Text strong style={{ color: FEMALE_COLOR }}>
              Nữ ({formatPercent(femaleRate)})
            </Text>
            <Text strong style={{ color: MALE_COLOR }}>
              Nam ({formatPercent(maleRate)})
            </Text>
          </Flex>
          <div
            style={{
              width: '100%',
              height: 7,
              borderRadius: 999,
              overflow: 'hidden',
              background: BAR_BG,
              display: 'flex',
            }}
          >
            <div style={{ width: `${femaleRate}%`, background: FEMALE_COLOR }} />
            <div style={{ width: `${maleRate}%`, background: MALE_COLOR }} />
          </div>
        </Flex>

        <Divider />
        <Text type="secondary" style={{ marginBottom: 8 }}>Độ tuổi người theo dõi</Text>
        <Flex vertical gap={12}>
          {ageRows.map((row) => (
            <Flex key={row.label} align='center' gap={10}>
              <Text style={{ minWidth: 56 }}>{row.label}</Text>
              <div
                style={{
                  flex: 1,
                  height: 7,
                  borderRadius: 999,
                  background: '#d9d9d9',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${row.value}%`,
                    height: '100%',
                    background: '#000',
                    borderRadius: 999,
                  }}
                />
              </div>
              <Text style={{ minWidth: 64, textAlign: 'right' }}>{formatAgePercent(row.value)}%</Text>
            </Flex>
          ))}
        </Flex>

        {/* <Flex justify='center' style={{ marginTop: 20 }}>
          <Flex
            align='center'
            gap={8}
            style={{ color: '#ff4d4f', cursor: creatorRefUrl ? 'pointer' : 'default' }}
            onClick={() => {
              if (!creatorRefUrl) return
              window.open(creatorRefUrl, '_blank')
            }}
          >
            <FileTextOutlined style={{ fontSize: 14 }} />
            <Text style={{ color: '#ff4d4f', fontSize: 12 }}>Xem báo cáo chi tiết</Text>
          </Flex>
        </Flex> */}
      </Flex>
    </Card>
  )
}

export default CreatorPerformance 