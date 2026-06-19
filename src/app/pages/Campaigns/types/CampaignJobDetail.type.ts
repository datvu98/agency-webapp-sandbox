// export interface CampaignJobDetailResponse { 
//   campaignSampleRequest: CampaignSampleRequestModel
//   campaignStoreId: number
//   cancelReason: string
//   connectorChannelCode: string
//   creatorChannelId: number
//   creatorChannelName: string
//   creatorChannelUsername: string
//   creatorId: number
//   creatorRefId: string
//   id: number
//   // jobProducts: JobProductModel[]
//   liveSessionCount: number
//   refShopId: string
//   smeId: number
//   status: string
//   storeId: number
//   updatedAt: string
//   videoCount: number
// }

// export interface CampaignSampleRequestModel {
//   id: number
//   campaignId: number
//   creatorId: number
//   creatorChannelId: number
//   creatorChannelName: string
//   creatorChannelUsername: string
//   creatorRefId: string
//   fullAddress: string
//   phone: string
// }

export interface CampaignStoreInfo {
  smeId?: number | null
  bannerDesktopUrl?: string | null
  bannerMobileUrl?: string | null
  campaignName?: string | null
  connectorChannelCode?: string | null
  storeName?: string | null
  registrationStartTime?: string | null
}

export interface CampaignSampleRequestItemInfo {
  id: number
  productName?: string
  quantityPurchased?: number
  variantImage?: string
  variantName?: string
  variantSku?: string
  status: string
}

export interface CampaignSampleRequestInfo {
  id?: number
  items?: CampaignSampleRequestItemInfo[]
  status?: string
  rejectMessage?: string
}

export interface JobProductInfo {
  id?: number | null
  liveSessionCount?: number | null
  productImage?: string | null
  status?: string | null
  videoCount?: number | null
}

export interface OrderInfoData {
  id?: number | null
  customerRecipientAddress?: {
    full_address?: string | null
    full_name?: string | null
    phone?: string | null
  } | null
  ref_id?: string | null
  logisticsPackages?: {
    id?: number | null
    tracking_number?: string | null
    packHistory?: {
      pack_name?: string | null
      pack_status?: string | null
      updated_at?: string | null
    }[] | null
    logisticsTrackingInfo?: {
      description?: string | null
      tracking_update_time?: number | null
    }[] | null
  }[] | null
}

export interface CreatorPerformanceCategory {
  id?: number | null
  display_name?: string | null
  ref_id?: string | null
}

export interface CreatorPerformanceItem {
  avgEcVideoViewCount?: number | null
  avgEcVideoPlayCount?: number | null
  avgEcLiveViewCount?: number | null
  ecVideoEngagementRate?: number | null
  followerCount?: number | null
  isGmvHiddenByCreator?: boolean | null
  gmvAmount?: number | null
  gmvRange?: string | null
  unitsSold?: number | null
  followerGenderFemale?: number | null
  followerGenderMale?: number | null
  age18_24FollowerRate?: number | null
  age25_34FollowerRate?: number | null
  age35_44FollowerRate?: number | null
  age45_54FollowerRate?: number | null
  age55PlusFollowerRate?: number | null
  creatorChannel?: {
    ref_url?: string | null
  } | null
  listCategories?: CreatorPerformanceCategory[] | null
}

export type JobProductRef = {
  id?: number | null
  productName?: string | null
}

export type JobSubmissionMediaRef = {
  url?: string | null
  type?: string | null
}

export type JobSubmissionProductMediaRef = {
  id?: number | null
  jobProductId?: number | null
  jobSubmissionMedia?: JobSubmissionMediaRef | null
}

export type JobSubmissionAssetRef = {
  id?: number | null
  jobId?: number | null
  index?: number | null
  type?: string | null
  note?: string | null
  productMedia?: JobSubmissionProductMediaRef[] | null
}

export type JobSubmissionRef = {
  id?: number | null
  status?: string | null
  videoDeadline?: string | null
  updatedAt?: string | null
  assets?: JobSubmissionAssetRef[] | null
  type?: string | null
}

export type ApprovedJobDetailData = {
  jobSubmissions?: JobSubmissionRef[] | null
  jobProducts?: JobProductRef[] | null
  videoCount?: number | null
}

export interface PreviousSubmissionMedia {
  url?: string | null
  type?: string | null
  fullAirUrl?: string | null
}

export interface PreviousSubmissionProductMedia {
  jobSubmissionMedia?: PreviousSubmissionMedia | null
  jobProductId?: number | null
}

export interface PreviousSubmissionAsset {
  productMedia?: PreviousSubmissionProductMedia[] | null
  rejectReason?: string | null
  status?: string | null
  updatedAt?: string | null
  rejectedAt?: string | null
  note?: string | null
  advertisingCode?: string | null
  index?: number | null
  type?: string | null
  submissionMedias?: PreviousSubmissionMedia[] | null
}

export interface PreviousSubmission {
  createdAt?: string | null
  assets?: PreviousSubmissionAsset[] | null
  videoDeadline?: string | null
  postDeadline?: string | null
  status?: string | null
  videoCount?: number | null
  approvedVideoCount?: number | null
  approvedAt?: string | null
  rejectedAt?: string | null
}

export interface PreviousSubmissionsAirListData {
  approvedLiveAirCount?: number | null
  approvedVideoAirCount?: number | null
  approvedDemoCount?: number | null
  videoCount?: number | null
  items?: PreviousSubmission[] | null
}

export interface AffGetPreviousSubmissionsAirResponse {
  message?: string | null
  success?: boolean | null
  data?: PreviousSubmissionsAirListData | null
}

export interface AffGetCampaignJobDetailForAirResponse {
  data?: {
    job?: {
      jobProducts?: JobProductRef[] | null
    } | null
  } | null
}

export interface AffGetPreviousSubmissionsAirQuery {
  affGetPreviousSubmissions?: AffGetPreviousSubmissionsAirResponse | null
  affGetCampaignJobDetail?: AffGetCampaignJobDetailForAirResponse | null
}

export interface AffGetPreviousSubmissionsAirVariables {
  jobId: number
  type?: string
}


export type RejectAssetInput = {
  id: number;
  reason: string;
};

export type SubmitApproveDemoJobSubmissionParams = {
  submissionId: number;
  approvedAssetIds?: number[];
  rejectedAssets?: RejectAssetInput[];
  extendTime?: string;
  jobId?: number;
};

export interface PreviousSubmissionAssetsApiMedia {
  jobProductId?: number | null;
  jobSubmissionMedia?: {
    url?: string | null;
    type?: string | null;
  } | null;
}

export interface PreviousSubmissionAssetsApiAsset {
  rejectReason?: string | null;
  productMedia?: PreviousSubmissionAssetsApiMedia[] | null;
  note?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface PreviousSubmissionAssetsApiItem {
  index?: number | null;
  note?: string | null;
  type?: string | null;
  status?: string | null;
  rejectReason?: string | null;
  productMedia?: PreviousSubmissionAssetsApiMedia[] | null;
}

export interface PreviousSubmissionAssetHistoryItem {
  createdAt?: string | null;
  updatedAt?: string | null;
  index?: number | null;
  note?: string | null;
  type?: string | null;
  status?: string | null;
  rejectReason?: string | null;
  productMedia?: PreviousSubmissionProductMedia[] | null;
  submissionMedias?: PreviousSubmissionMedia[] | null;
  rejectedAt?: string | null;
  approvedAt?: string | null;
  advertisingCode?: string | null;
  linkDrive?: string | null;
}

export interface ApprovedVideoMediaEntry {
  id?: number | null
  demoUrl?: string | null
  airUrl?: string | null
  fullAirUrl?: string | null
  type?: string | null
  advertisingCode?: string | null
}

export interface ApprovedVideoMediaVariant {
  id?: number | null
  quantityPurchased?: number | null
  scVariantId?: number | null
  variantImage?: string | null
  variantName?: string | null
  variantSku?: string | null
}

export interface ApprovedVideoMediaItem {
  approvedVideoCount?: number | null
  campaignProductId?: number | null
  creatorChannelId?: number | null
  jobProductId?: number | null
  medias?: ApprovedVideoMediaEntry[] | null
  productImage?: string | null
  productName?: string | null
  requiredVideoCount?: number | null
  totalVideoCount?: number | null
  variants?: ApprovedVideoMediaVariant[] | null
}

export interface ApprovedLiveProductVariant {
  variantName?: string | null
  quantityPurchased?: number | null
}

export interface ApprovedLiveProductItem {
  jobProductId?: number | null
  productName?: string | null
  productImage?: string | null
  requiredLiveSessionCount?: number | null
  variants?: ApprovedLiveProductVariant[] | null
}

export interface ApprovedLiveMediaEntry {
  id?: number | null
  demoUrl?: string | null
  airUrl?: string | null
  type?: string | null
}

export interface ApprovedLiveMediaItem {
  advertisingCode?: string | null
  id?: number | null
  index?: number | null
  linkDrive?: string | null
  note?: string | null
  status?: string | null
  products?: ApprovedLiveProductItem[] | null
  medias?: ApprovedLiveMediaEntry[] | null
}
