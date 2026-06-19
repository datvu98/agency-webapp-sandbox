import { ICampaignProduct, IListCommission } from "app/pages/Campaigns/types";

const normalizeRefProductId = (refProductId?: string | number | null) => {
  if (refProductId == null) return "";
  return String(refProductId).trim();
};

export const mapProductsWithImportedCommission = (
  products: ICampaignProduct[] = [],
  listCommission: IListCommission[] = []
): ICampaignProduct[] => {
  if (!listCommission.length) {
    return products;
  }

  const commissionByRefProductId = new Map<string, IListCommission>();

  listCommission.forEach((commissionItem) => {
    const key = normalizeRefProductId(commissionItem.refProductId);
    if (key) {
      commissionByRefProductId.set(key, commissionItem);
    }
  });

  return products.map((product) => {
    const productRefId = normalizeRefProductId(product.refProductId);
    if (!productRefId) {
      return product;
    }

    const importedCommission = commissionByRefProductId.get(productRefId);
    if (!importedCommission) {
      return product;
    }

    return {
      ...product,
      creatorCommissionRate: importedCommission.creatorCommissionRate,
      creatorShopAdsCommissionRate: importedCommission.creatorShopAdsCommissionRate,
      totalShopAdsCommissionRate: importedCommission.totalShopAdsCommissionRate,
      referralLink: importedCommission.referralLink,
    };
  });
};
