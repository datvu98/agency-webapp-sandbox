import { ICampaignRegisterTable } from "app/pages/Campaigns/types";
import type { BulkApproveProgress } from "../hooks/useCampaignRegister";
import { ETYPE_PROCESS_STATUS } from "../constants/constant";
import {
  EORDER_BY_COLUMN,
  ESORT_DIRECTION,
} from "app/pages/Campaigns/CampaignRegister/types/CampaignSampleFilter.type";

export interface CampaignRegisterTableSharedProps {
  data: ICampaignRegisterTable[];
  basePath: string;
  loading?: boolean;
  total?: number;
  page?: number;
  limit?: number;
  onPageChange?: (page: number, pageSize: number) => void;
  bulkApproveProgress: BulkApproveProgress;
  onBulkApproveConfirm: (rows: ICampaignRegisterTable[]) => Promise<void>;
  onBulkApproveCancel: () => void;
  onBulkApproveClose: () => void;
  onBulkRejectConfirm: (
    rows: ICampaignRegisterTable[],
    rejectMessage: string,
  ) => Promise<void>;
  bulkRejectLoading?: boolean;
  onApproveRowConfirm: (
    requestId: number,
    requestItemIds: number[],
    shouldCheckStock?: number,
  ) => Promise<void>;
  approveRowLoading?: boolean;
  checkItemsStock: (ids: number[]) => Promise<number[]>;
}

export enum ECANCEL_BY {
  CREATOR = "hub",
  AGENCY = "agency",
}

export interface ICampaignJob {
  approvedAt?: string;
  campaignId?: number;
  campaignSampleRequest?: CampaignSampleRequestModel;
  // campaignStore?: CampaignStoreModel;
  campaignStoreId?: number;
  cancelBy?: ECANCEL_BY;
  cancelReason?: string;
  connectorChannelCode?: string;
  createdAt: string;
  creatorChannelId?: number;
  creatorChannelName?: string;
  creatorChannelUsername?: string;
  creatorId?: number;
  creatorRefId?: string;
  hasDemoApproval?: number;
  isPreShippingCancel?: boolean | number;
  id: number;

  liveSessionCount?: number;
  postDeadline?: string;
  postDemoDeadline?: string;
  refShopId?: string;
  status?: ETYPE_PROCESS_STATUS;
  storeId?: number;
  updatedAt: string;
  videoAirDeadline?: string;
  videoCount?: number;
  videoDeadline?: string;
  demoSubmittedAt: string;

  cancelAt: string;
  liveApprovedPostCount: number;
  postSubmittedAt: string;
  videoApprovedDemoCount: number;
  videoApprovedPostCount: number;
}

export interface CampaignSampleRequestModel {
  approvedAt?: string;
  birthday?: string;
  campaignId: number;
  campaignJobId?: number;
  connectorChannelCode?: string;
  createdAt: string;
  creatorChannelId?: number;
  creatorChannelName?: string;
  creatorChannelUsername?: string;
  creatorId?: number;
  creatorRefId?: string;
  district?: string;
  districtCode?: string;
  email?: string;
  fullAddress?: string;
  id: number;
  isReceiveSample: number;
  items?: CampaignSampleRequestItemModel[];
  orderId?: string;
  order?: OrderV2Model;
  phone?: string;
  province?: string;
  provinceCode?: string;
  rejectMessage?: string;
  requestType?: string;
  sex?: string;
  status: string;
  storeId?: number;
  ward?: string;
  wardCode?: string;

  // KOC performance
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
  logisticsPackages: CampaignSampleRequestLogisticsPackageModel[];
}

export interface OrderV2Model {
  id: number;
  ref_id?: string;
  status: string;
  platform_status_text: string;
  logisticsPackages?: CampaignSampleRequestLogisticsPackageModel[];
}

export interface CampaignSampleRequestLogisticsPackageModel {
  tracking_number?: string;
  package_number?: string;
  shipping_carrier?: string;
  pack_status: string;
}

export interface CampaignSampleRequestItemModel {
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
