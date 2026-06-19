export interface CampaignRegister {
  id: number;
  campaignId: number;

  // Creator (KOC)
  creatorId?: number;
  creatorChannelId?: number;
  creatorChannelName?: string;
  creatorRefId?: string;
  creatorChannelUsername?: string;

  connectorChannelCode?: string;

  // Address
  fullAddress?: string;
  province?: string;
  provinceCode?: string;
  district?: string;
  districtCode?: string;
  ward?: string;
  wardCode?: string;

  phone?: string;

  // Business
  isReceiveSample: number; // 1 = có, 0 = không
  requestType?: string; // SAMPLE | SHOWCASE
  smeId?: number;
  status: string; // PENDING | APPROVED | REJECTED
  rejectMessage?: string;

  orderId?: string;

  // Relation
  items?: CampaignSampleRequestItem[];

  // System
  storeId?: number;

  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
}

export interface CampaignSampleRequestItem {
  id: number;
  campaignSampleRequestId?: number;

  campaignId?: number;

  // Product info
  productName?: string;
  variantName?: string;
  variantSku?: string;
  variantImage?: string;

  scProductId?: number;
  scVariantId?: number;

  quantityPurchased?: number;
  creatorCommissionRate?: number;

  // Status
  status: string; // PENDING | APPROVED | REJECTED

  // System
  storeId?: number;

  createdAt?: string;
  updatedAt?: string;
  approvedAt?: string;
}

export interface ICampaignRegisterTable {
  // Dùng cho rowKey của Table
  key: string;

  // Từ CampaignRegister API
  id: number;
  campaignId: number;
  creatorId?: number;
  creatorChannelId: number;
  creatorChannelName: string;
  creatorChannelUsername: string;
  creatorRefId?: string;
  fullAddress: string;
  phone: string;
  requestType: string;    // SAMPLE | SHOWCASE
  status: string;         // PENDING | APPROVED | REJECTED
  smeId?: number;
  rejectMessage?: string;
  isReceiveSample: number;
  orderId?: string;
  items: CampaignSampleRequestItem[];
  createdAt: string;

  // KOC performance metrics — chưa tích hợp, tạm để null
  ecLiveCount: number | null;
  ecVideoCount: number | null;
  followCount: number | null;
  postCount: Array<{
    Live: number;
    video: number;
  }>;
  gmv: number | string | null;
  soldCount: number | null;
  avgVideoViews: number | null;
  engagementRate: number | null;
  category: string[] | null;
  urlCreatorChannel: string | null;
}

export interface ICreatorChannelPerformance {
  id: number;
  avgEcVideoPlayCount: number | null;
  avgEcVideoViewCount: number | null;
  ecLiveCount: number | null;
  ecVideoCount: number | null;
  creatorChannelId: number;
  ecVideoEngagementRate: number | null;
  followerCount: number | null;
  gmvAmount: number | null;
  isGmvHiddenByCreator: boolean | null;
  gmvRange: string | null;
  unitsSold: number | null;
  creatorChannel: {
    id: number;
    ref_url: string;
  };
  listCategories: {
    display_name: string;
    id: number;
    ref_id: string;
  }[];
}