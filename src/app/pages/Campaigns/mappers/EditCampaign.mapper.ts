import { EJoinType } from "app/pages/Campaigns/ListCampainEdit/constants";
import {
  ICampaignConditionModel,
  ICampaignProduct,
  ICampaignProductModel,
  IConditionItem,
  IDetailCampaignModel,
  IEditCampaignForm,
} from "app/pages/Campaigns/types";
import dayjs, { Dayjs } from "dayjs";
import { get } from "lodash";

const parseJsonArray = <T = unknown>(value: unknown): T[] => {
  if (!value) return [];

  if (Array.isArray(value)) return value as T[];

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  return [];
};

function toDateRange(
  start?: string,
  end?: string,
  format?: string
): [Dayjs, Dayjs] | undefined {
  if (!start || !end) return undefined;
  return format
    ? [dayjs(start, format), dayjs(end, format)]
    : [dayjs(start), dayjs(end)];
}

const hasArrayValue = (arr?: unknown[]) => Array.isArray(arr) && arr.length > 0;

/**
 * Parse chuỗi dạng "[[min,max]]" hoặc "[[min]]" từ API.
 * [[1000]]        → [1000, null]  (không có max)
 * [[1000, null]]  → [1000, null]
 * [[1, 1000]]     → [1, 1000]
 */
const parseMetricRangeMatrix = (value: unknown): (number | null)[][] => {
  if (value == null || value === "") return [];

  let parsed: unknown = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsed) || !parsed.length) return [];
  if (!Array.isArray(parsed[0])) return [];

  return (parsed as unknown[]).map((row) => {
    const pair = row as unknown[];
    const min = pair[0] == null ? null : Number(pair[0]);
    const max = pair.length < 2 || pair[1] == null ? null : Number(pair[1]);
    return [min, max];
  });
};

/**
 * [[1000]]        → min=1000, max=null, no_limit=true  (Không giới hạn, format mới)
 * [[1000, null]]  → min=1000, max=null, no_limit=true  (format cũ vẫn tương thích)
 * [[1000, 10000000]] → min=1000, max=10000000, no_limit=false
 */
const mapMetricRangeFormFields = (
  metricKey: string,
  ranges: (number | null)[][],
): Partial<IConditionItem> => {
  const [min, max] = ranges[0] ?? [null, null];
  const hasMin = min != null && !Number.isNaN(min);
  const hasMax = max != null && !Number.isNaN(max);
  const noLimit = hasMin && !hasMax;

  return {
    [`${metricKey}_min`]: hasMin ? min : null,
    [`${metricKey}_max`]: hasMax ? max : null,
    [`${metricKey}_no_limit`]: noLimit,
  } as Partial<IConditionItem>;
};

const hasMetricRangeValue = (ranges: (number | null)[][]) =>
  ranges.some((row) => row?.[0] != null || row?.[1] != null);

const mapProduct = (product: ICampaignProductModel): ICampaignProduct => {
  const creatorCommissionRate = get(product, "creatorCommissionRate");
  const creatorShopAdsCommissionRate = get(product, "creatorShopAdsCommissionRate", null);
  const id = get(product, "id");
  const price = get(product, "price");
  const productImageUrl = get(product, "productImageUrl", "");
  const productName = get(product, "productName", "");
  //const rating = get(product, "rating", null);
  const refProductId = get(product, "refProductId", "");
  const referralLink = get(product, "referralLink", null);
  const registerDate = get(product, "registerDate", null);
  const scProductId = get(product, "scProductId", null);
  // const smeId = get(product, "smeId", null);
  const soldCount = get(product, "soldCount");
  const status = get(product, "status", "");
  const stock = get(product, "stock");
  const stockSample = get(product, "stockSample");
  const rawTotalCommissionRate = get(product, "totalCommissionRate");
  const totalCommissionRate =
    rawTotalCommissionRate == null ? undefined : rawTotalCommissionRate;
  const totalShopAdsCommissionRate = get(product, "totalShopAdsCommissionRate") ?? null;
  const storeId = get(product, "storeId", null);
  const openCollaborationCommissionRate = get(product, "openCollaborationCommissionRate");
  const openCollaborationShopAdsRate = get(product, "openCollaborationShopAdsRate");
  const hiddenVariantIds = get(product, "hiddenVariantIds", []) ?? [];
  // const updatedAt = get(product, "updatedAt", "");

  return {
    creatorCommissionRate,
    creatorShopAdsCommissionRate,
    id,
    price,
    productImageUrl,
    productName,
    // rating,
    refProductId,
    referralLink,
    registerDate,
    scProductId,
    // smeId,
    soldCount,
    status,
    stock,
    stockSample,
    totalCommissionRate,
    totalShopAdsCommissionRate,
    storeId,
    // updatedAt,
    openCollaborationCommissionRate,
    openCollaborationShopAdsRate,
    hiddenVariantIds,
  }
}

const mapCondition = (condition: ICampaignConditionModel): IConditionItem => {
  const rangeAge = parseJsonArray<string>(get(condition, "rangeAge"));

  const followersRanges = parseMetricRangeMatrix(get(condition, "followers"));
  const gmv = parseMetricRangeMatrix(get(condition, "gmv"));
  const sold = parseMetricRangeMatrix(get(condition, "sold"));
  const avgVideoViews = parseMetricRangeMatrix(get(condition, "avgVideoViews"));
  const avgLiveViews = parseMetricRangeMatrix(get(condition, "avgLiveViews"));

  const engagementRate = parseJsonArray<number[]>(
    get(condition, "engagementRate")
  );

  const gender = get(condition, "gender");

  const rawVideoCount = get(condition, "videoCount");
  const rawLiveSessionCount = get(condition, "liveSessionCount");
  const hasVideoCount = rawVideoCount !== undefined && rawVideoCount !== null && rawVideoCount !== "";
  const hasLiveSessionCount =
    rawLiveSessionCount !== undefined &&
    rawLiveSessionCount !== null &&
    rawLiveSessionCount !== "";

  const videoCount = hasVideoCount ? Number(rawVideoCount) : 0;
  const liveSessionCount = hasLiveSessionCount ? Number(rawLiveSessionCount) : 0;
  const rawVideoDemoDeadline = get(condition, "creatorDemoVideoDeadlineDays");
  const rawPostDemoDeadline = get(condition, "creatorPostDeadlineDays");
  const videoDemoDeadline =
    rawVideoDemoDeadline == null || rawVideoDemoDeadline === "" || Number(rawVideoDemoDeadline) < 1
      ? 5
      : Number(rawVideoDemoDeadline);
  const postDemoDeadline =
    rawPostDemoDeadline == null || rawPostDemoDeadline === "" || Number(rawPostDemoDeadline) < 1
      ? 10
      : Number(rawPostDemoDeadline);
  return {
    join_type: EJoinType.CONDITION,
    note: get(condition, "note"),

    followers: followersRanges,
    followers_enabled: hasMetricRangeValue(followersRanges),
    ...mapMetricRangeFormFields("followers", followersRanges),

    range_age: rangeAge,
    range_age_enabled: hasArrayValue(rangeAge),

    gender,
    gender_enabled: !!gender,

    gmv,
    gmv_enabled: hasMetricRangeValue(gmv),
    ...mapMetricRangeFormFields("gmv", gmv),

    sold,
    sold_enabled: hasMetricRangeValue(sold),
    ...mapMetricRangeFormFields("sold", sold),

    avg_video_views: avgVideoViews,
    avg_video_views_enabled: hasMetricRangeValue(avgVideoViews),
    ...mapMetricRangeFormFields("avg_video_views", avgVideoViews),

    avg_live_views: avgLiveViews,
    avg_live_views_enabled: hasMetricRangeValue(avgLiveViews),
    ...mapMetricRangeFormFields("avg_live_views", avgLiveViews),

    engagement_rate_enabled: hasArrayValue(engagementRate),
    engagement_rate: engagementRate,

    video_count: videoCount,
    live_session_count: liveSessionCount,
    video_enabled: hasVideoCount,
    livestream_enabled: hasLiveSessionCount,
    video_demo_deadline: videoDemoDeadline,
    post_demo_deadline: postDemoDeadline,
  };
};

export const editCampaignMapper = {
  mapToForm: (data: IDetailCampaignModel): IEditCampaignForm => {
    const startTime = get(data, "startTime");
    const endTime = get(data, "endTime");

    const registrationStartTime = get(data, "registrationStartTime");
    const registrationEndTime = get(data, "registrationEndTime");

    const eventTime = toDateRange(startTime, endTime, "YYYY-MM-DD");

    const registrationTime = toDateRange(
      registrationStartTime,
      registrationEndTime,
      "YYYY-MM-DD"
    );
    const type = get(data, "type", "");

    const stores = get(data, "stores", []).map((store: any) => ({
      applyDescription: get(store, "applyDescription", false),
      applyBrandInfo: get(store, "applyBrandInfo", false),
      applyInstruction: get(store, "applyInstruction", false),
      applyBanner: get(store, "applyBanner", false),

      bannerDesktopUrl: get(store, "bannerDesktopUrl", ""),
      bannerMobileUrl: get(store, "bannerMobileUrl", ""),
      brandInfo: get(store, "brandInfo", ""),
      campaignId: get(store, "campaignId", 0),
      campaignName: get(store, "campaignName", ""),
      createdAt: get(store, "createdAt"),
      description: get(store, "description", ""),
      id: get(store, "id", 0),
      instruction: get(store, "instruction"),
      maxCreatorCommissionRate: get(store, "maxCreatorCommissionRate", 0),
      maxCreatorShopAdsCommissionRate: get(
        store,
        "maxCreatorShopAdsCommissionRate",
        null
      ),
      maxTotalCommissionRate: get(store, "maxTotalCommissionRate", 0),
      maxTotalShopAdsCommissionRate: get(
        store,
        "maxTotalShopAdsCommissionRate",
        null
      ),
      minCreatorCommissionRate: get(store, "minCreatorCommissionRate", 0),
      minCreatorShopAdsCommissionRate: get(
        store,
        "minCreatorShopAdsCommissionRate",
        null
      ),
      minTotalCommissionRate: get(store, "minTotalCommissionRate", 0),
      minTotalShopAdsCommissionRate: get(
        store,
        "minTotalShopAdsCommissionRate",
        null
      ),
      smeId: get(store, "smeId", null),
      storeCode: get(store, "storeCode", ""),
      storeId: get(store, "storeId", null),
      storeName: get(store, "storeName", ""),
      totalProduct: get(store, "totalProduct", 0),
      updatedAt: get(store, "updatedAt", ""),
      visibleToCreator: get(store, "visibleToCreator"),
      has_demo_approval: Number(get(store, "hasDemoApproval", 1)) === 0 ? 0 : 1,
      creatorIdsJoinedCount: get(store, "creatorIdsJoinedCount", 0),
      wageAmount: get(store, "wageAmount"),

      conditions: (() => {
        const mapped = get(store, "conditions", []).map(mapCondition);
        // Đảm bảo luôn có 1 phần tử conditions[0] để SectionRequirement bind đúng path.
        if (mapped.length) return mapped;
        return [
          mapCondition({
            joinType: EJoinType.CONDITION,
            note: "",
          } as any),
        ];
      })(),
      products: get(store, "products", []).map(mapProduct),
    }));

    return {
      name: get(data, "name", ""),
      description: get(data, "description", ""),
      refCampaignId: get(data, "refCampaignId", ""),
      connectorChannelCode: get(data, "connectorChannelCode", ""),
      eventTime: eventTime as any,
      registrationTime: registrationTime as unknown as string,

      imageCampaign: "",
      productCommission: "",
      productCommissionTable: [],

      stores,
      type,
    };
  },
};