

export interface ICampaignStore {
  applyBanner: boolean;
  bannerDesktopUrl: string;
  bannerMobileUrl: string;

  campaignId: number;
  campaignName: string;

  applyDescription: boolean;
  description: string;

  applyBrandInfo: boolean;
  brandInfo: string;

  applyInstruction: boolean;
  instruction: string;

  createdAt: string;
  id: number;

  // maxCreatorCommissionRate?: number;
  // maxCreatorShopAdsCommissionRate?: number | null;
  maxTotalCommissionRate?: number;
  maxTotalShopAdsCommissionRate?: number | null;
  // minCreatorCommissionRate?: number;
  // minCreatorShopAdsCommissionRate?: number | null;
  // minTotalCommissionRate?: number;
  // minTotalShopAdsCommissionRate?: number | null;
  storeCode: string;
  storeId: number | null;
  storeName: string;
  // totalProduct: number;
  // updatedAt: string;
  visibleToCreator: number;
  has_demo_approval?: number;
  creatorIdsJoinedCount?: number;
  messageError?: string | null;
  smeId: number | null;
  wageAmount?: number;
  conditions: IConditionItem[];
  products: ICampaignProduct[];
}
export interface ICampaignProduct {
  openCollaborationCommissionRate?: number;
  openCollaborationShopAdsRate?: number;
  creatorCommissionRate?: number;
  creatorShopAdsCommissionRate?: number | null;
  id?: number;
  price?: number;
  productImageUrl?: string;
  productName?: string;
  // rating?: number | null;
  refProductId?: string;
  referralLink?: string | null;
  registerDate?: string | null;
  scProductId?: string | null;
  soldCount?: number;
  status?: string;
  stock?: number;
  stockSample?: number;
  storeId?: number | null;
  totalCommissionRate?: number;
  totalShopAdsCommissionRate?: number | null;
  hiddenVariantIds?: number[];
  // updatedAt?: string;
}

export interface IEditCampaignForm {
  refCampaignId: string;
  name: string;
  connectorChannelCode: string;
  eventTime: string;
  description: string;
  registrationTime: string;
  imageCampaign: string;
  productCommission: string;
  productCommissionTable: any[];
  stores: ICampaignStore[];
  type: string;
}

export interface IConditionItem {
  join_type: string;

  followers_enabled?: boolean;
  followers?: (number | null)[][];

  range_age_enabled?: boolean;
  range_age?: string[];

  gender_enabled?: boolean;
  gender?: string;

  gmv_enabled?: boolean;
  gmv?: (number | null)[][];
  gmv_min?: number | null;
  gmv_max?: number | null;
  gmv_no_limit?: boolean;
  sold_enabled?: boolean;
  sold?: (number | null)[][];
  sold_min?: number | null;
  sold_max?: number | null;
  sold_no_limit?: boolean;
  avg_video_views_enabled?: boolean;
  avg_video_views?: (number | null)[][];
  avg_video_views_min?: number | null;
  avg_video_views_max?: number | null;
  avg_video_views_no_limit?: boolean;
  avg_live_views_enabled?: boolean;
  avg_live_views?: (number | null)[][];
  avg_live_views_min?: number | null;
  avg_live_views_max?: number | null;
  avg_live_views_no_limit?: boolean;
  followers_min?: number | null;
  followers_max?: number | null;
  followers_no_limit?: boolean;
  engagement_rate_enabled?: boolean;
  engagement_rate?: number[][];

  note: string;

  video_enabled?: boolean;
  video_count?: number;
  livestream_enabled?: boolean;
  live_session_count?: number;

  video_demo_deadline?: number;
  post_demo_deadline?: number;
}

