export interface ICampaignProductModel {
  __typename?: string;
  campaignId?: number;
  createdAt: string;
  creatorCommissionRate?: number;
  creatorShopAdsCommissionRate?: number | null;
  hiddenVariantIds?: number[];
  id?: number;
  openCollaborationCommissionRate?: number;
  openCollaborationShopAdsRate?: number;
  price?: number;
  productImageUrl?: string;
  productName?: string;
  rating?: number | null;
  refProductId?: string;
  referralLink?: string | null;
  registerDate?: string | null;
  scProductId?: string | null;
  smeId?: number | null;
  soldCount?: number;
  status?: string;
  stock?: number;
  stockSample?: number;
  storeId?: number | null;
  totalCommissionRate?: number;
  totalShopAdsCommissionRate?: number | null;
  updatedAt?: string;
}

export interface ICampaignConditionModel {
  joinType: string;
  followers?: string;
  rangeAge?: string;
  gender?: string;
  gmv?: string;
  sold?: string;
  avgVideoViews?: string;
  avgLiveViews?: string;
  engagementRate?: string;
  note: string;
  videoCount?: string;
  liveSessionCount?: string;
  videoDemoDeadline?: string;
  postDemoDeadline?: string;
}

export interface ICampaignStoreModel {
  bannerDesktopUrl: string;
  bannerMobileUrl: string;
  brandInfo: string;
  campaignId: number;
  campaignName: string;
  createdAt: string;
  description: string;
  hasDemoApproval: number;
  id: number;
  instruction: string;
  maxCreatorCommissionRate: number;
  maxCreatorShopAdsCommissionRate: number | null;
  maxTotalCommissionRate: number;
  maxTotalShopAdsCommissionRate: number | null;
  minCreatorCommissionRate: number;
  minCreatorShopAdsCommissionRate: number | null;
  minTotalCommissionRate: number;
  minTotalShopAdsCommissionRate: number | null;
  smeId: number | null;
  storeCode: string;
  storeId: number | null;
  storeName: string;
  totalProduct: number;
  updatedAt: string;
  visibleToCreator: number;
  creatorIdsJoinedCount?: number;
  wageAmount: number;
  products: ICampaignProductModel[];
  conditions: ICampaignConditionModel[];
}

export interface IDetailCampaignModel {
  approvedProductCount: number;
  code: string | null;
  connectorChannelCode: string;
  createdAt: string;
  description: string;
  endTime: string;
  id: number;
  name: string;
  partnerAccountId: number;
  refCampaignId: string;
  registrationEndTime: string;
  registrationStartTime: string;
  startTime: string;
  status: string;
  stores: ICampaignStoreModel[];
  type: string;
  updatedAt: string;
}
