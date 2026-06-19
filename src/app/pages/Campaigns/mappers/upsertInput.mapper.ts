import { IEditCampaignForm } from "../types"

export const buildUpsertCampaignInput = (
  values: IEditCampaignForm,
  id: number,
  partnerAccountId: number,
  overrides?: { visibleToCreator?: number }
) => {

  const transformGeneralInfo = () => {
    return {
      id: id,
      partnerAccountId: partnerAccountId,
      name: values.name,
      connectorChannelCode: values.connectorChannelCode,
      startTime: values.eventTime?.[0],
      endTime: values.eventTime?.[1],
      registrationStartTime: values.registrationTime?.[0],
      registrationEndTime: values.registrationTime?.[1],
      type: values.type,
    }
  }

  const transformStores = () => {
    return values.stores.map((store) => ({
      storeCode: store.storeCode,
      storeName: store.storeName,
      storeId: store.storeId,
      bannerDesktopUrl: store.bannerDesktopUrl,
      bannerMobileUrl: store.bannerMobileUrl,
      brandInfo: store.brandInfo,
      instruction: store.instruction,
      description: store.description,
      wageAmount: store.wageAmount,
      visibleToCreator: overrides?.visibleToCreator ?? store.visibleToCreator,
      hasDemoApproval: store.has_demo_approval === 0 ? 0 : 1,
      smeId: store.smeId,

      campaignName: store.campaignName,
    }))
  }

  const transformProducts = () => {
    return values.stores.flatMap((store) =>
      store.products.map((product) => ({
        storeId: store.storeId,
        storeName: store.storeName,

        refProductId: product.refProductId,
        productName: product.productName,
        productImageUrl: product.productImageUrl,
        scProductId: product.scProductId,
        registerDate: product.registerDate,

        totalCommissionRate: product.totalCommissionRate,
        totalShopAdsCommissionRate: product.totalShopAdsCommissionRate,
        creatorCommissionRate: product.creatorCommissionRate,
        creatorShopAdsCommissionRate:
          product.creatorShopAdsCommissionRate,
        openCollaborationShopAdsRate: product.openCollaborationShopAdsRate,
        openCollaborationCommissionRate: product.openCollaborationCommissionRate,

        referralLink: product.referralLink,
        price: product.price,
        stockSample: product.stockSample,
        stock: product.stock,
        soldCount: product.soldCount,
        hiddenVariantIds: product.hiddenVariantIds ?? [],

        smeId: store.smeId,

        campaignStoreId: store.id,  // Trải phẳng products của từng store, thêm id của store để phân biệt prod của store nào

      }))
    )
  }

  const transformConditions = () => {
    return values.stores.flatMap((store) =>
      store.conditions.map((condition) => ({
        storeId: store.storeId,
        joinType: condition.join_type,
        followers: condition.followers_enabled ? JSON.stringify(condition.followers) : null,
        rangeAge: condition.range_age_enabled ? JSON.stringify(condition.range_age) : null,
        gmv: condition.gmv_enabled ? JSON.stringify(condition.gmv) : null,
        sold: condition.sold_enabled ? JSON.stringify(condition.sold) : null,
        avgVideoViews: condition.avg_video_views_enabled ? JSON.stringify(condition.avg_video_views) : null,
        avgLiveViews: condition.avg_live_views_enabled ? JSON.stringify(condition.avg_live_views) : null,
        engagementRate: condition.engagement_rate_enabled ? JSON.stringify(condition.engagement_rate) : null,
        videoCount: condition.video_enabled ? String(condition.video_count) : null,
        liveSessionCount: condition.livestream_enabled ? String(condition.live_session_count) : null,
        ...(condition.video_demo_deadline && { creatorDemoVideoDeadlineDays: Number(condition.video_demo_deadline) }),
        ...(condition.post_demo_deadline && { creatorPostDeadlineDays: Number(condition.post_demo_deadline) }),
        gender: condition.gender_enabled ? condition.gender : null,
        note: condition.note ? condition.note : null,
        categoryId: null,
        campaignStoreId: store.id, // Trải phẳng conditions của từng store, thêm id của store để phân biệt condition của store nào
      }))
    )
  }

  return {
    input:
    {
      ...transformGeneralInfo(),
      stores: transformStores(),
      products: transformProducts(),
      conditions: transformConditions(),
    },
  }
}