import type { CampaignSampleRequestInfo, CampaignStoreInfo, JobProductInfo, JobSubmissionRef, OrderInfoData } from '../../types/CampaignJobDetail.type'
import type { CreatorPerformanceQueryData } from '../sections/CreatorPerformance'

export interface StatusJobDetailData {
  status?: string
  campaignStore?: CampaignStoreInfo | null
  campaignSampleRequest?: CampaignSampleRequestInfo | null
  jobProducts?: JobProductInfo[] | null
  jobSubmissions?: JobSubmissionRef[] | null
  videoCount?: number | null
  creatorChannelName?: string
  creatorChannelUsername?: string
  createdAt?: string | null
  videoDeadline?: string | null
  liveSessionCount?: number | null
  hasDemoApproval?: number
}

export interface BaseStatusJobProps {
  jobDetailData?: StatusJobDetailData | null
  jobDetailLoading?: boolean
  refetchJobDetail?: () => Promise<unknown>
  performancesData?: CreatorPerformanceQueryData | null
  performancesLoading?: boolean
}

export interface PendingShipmentProps extends BaseStatusJobProps {
  orderDetailData?: {
    findOrderByIds?: OrderInfoData[] | null
  } | null
  orderDetailLoading?: boolean
  approvedVideoMediaData?: any[] | null
  approvedVideoMediaLoading?: boolean
}

export type PendingStatusJobProps = BaseStatusJobProps
