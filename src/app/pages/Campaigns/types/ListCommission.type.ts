export interface IListCommission {
  rowNumber: number;
  refProductId: number;
  campaignProductId: number;
  creatorCommissionRate: number;
  totalCommissionRate: number;
  creatorShopAdsCommissionRate: number;
  affiliateShopAdsCommissionRate: number;
  totalShopAdsCommissionRate: number;
  referralLink: string;
  isValid: boolean;
  errors: string[] | null;
}
