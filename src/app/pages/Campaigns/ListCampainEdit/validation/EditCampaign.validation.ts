import { Rule } from "antd/es/form";
import { ICampaignStore, IConditionItem, IEditCampaignForm } from "app/pages/Campaigns/types";

type RuleFactory = () => Rule[];
type RuleFactoryHasCondition = (hasCondition: boolean) => Rule[];

type EditCampaignRules = Partial<Record<keyof IEditCampaignForm, RuleFactory>>;
type ConditionRules = Partial<
  Record<keyof IConditionItem, RuleFactoryHasCondition>
>;

type StoreRules = Partial<Record<keyof ICampaignStore, RuleFactoryHasCondition>>;

export const advertisingFormatRule =
  (otherFieldName: any): Rule =>
    ({ getFieldValue }) => ({
      validator(_, value) {
        const otherValue = getFieldValue(otherFieldName);

        if (!value && !otherValue) {
          return Promise.reject(
            new Error("Vui lòng chọn ít nhất một hình thức quảng cáo")
          );
        }
        return Promise.resolve();
      },
    });

export const postDemoGreaterThanVideoDemoRule =
  (videoDemoFieldName: any): Rule =>
    ({ getFieldValue }) => ({
      validator(_, value) {
        const videoDemoDeadline = getFieldValue(videoDemoFieldName);

        if (value == null || value === "" || videoDemoDeadline == null || videoDemoDeadline === "") {
          return Promise.resolve();
        }

        if (Number(value) <= Number(videoDemoDeadline)) {
          return Promise.reject(
            new Error("Hạn nhà sáng tạo đăng bài phải lớn hơn hạn gửi video demo")
          );
        }

        return Promise.resolve();
      },
    });

function isQuillEmpty(value?: string) {
  if (!value) return true;
  if (value.includes("<img")) return false;
  const text = value.replace(/<(.|\n)*?>/g, "").trim();
  return text.length === 0;
}

const requiredRule = (message: string): Rule[] => [{ required: true, message }];
export const PRODUCT_REQUIRED_MESSAGES = {
  creatorCommissionRate: "Vui lòng nhập tỷ lệ hoa hồng của nhà sáng tạo",
  referralLink: "Vui lòng nhập Link giới thiệu",
} as const;

export const PRODUCT_COMMISSION_MESSAGES = {
  totalShopAdsRange: "Vui lòng nhập số từ 1 đến 80",
  openCollabShopAdsRange:
    "Vui lòng nhập số từ 1 đến 80",
  creatorLessThanTotal:
    "Vui lòng nhập số nhỏ hơn tổng tỷ lệ hoa hồng",
  creatorShopAdsLessThanTotalShopAds:
    "Vui lòng nhập số nhỏ hơn tổng tỷ lệ hoa hồng quảng cáo cửa hàng",
  creatorShopAdsRange:
    "Vui lòng nhập số từ 1 đến 80",
  requiredValue: "Vui lòng nhập giá trị",
} as const;

const hasValue = (v: unknown) => v !== null && v !== undefined && v !== "";

export const requiredValueRule = (message?: string): Rule => ({
  validator: async (_: unknown, value?: unknown) => {
    if (!hasValue(value)) {
      return Promise.reject(new Error(message ?? PRODUCT_COMMISSION_MESSAGES.requiredValue));
    }
    return Promise.resolve();
  },
});

export const percentRangeRule = (min: number, max: number, message: string): Rule => ({
  validator: async (_: unknown, value?: unknown) => {
    if (!hasValue(value)) return Promise.resolve();
    const n = Number(value);
    if (Number.isNaN(n) || n < min || n > max) {
      return Promise.reject(new Error(message));
    }
    return Promise.resolve();
  },
});

export const creatorCommissionLessThanTotalRule = (getTotal: () => unknown): Rule => ({
  validator: async (_: unknown, value?: unknown) => {
    if (!hasValue(value)) return Promise.resolve();
    const total = getTotal();
    if (!hasValue(total)) return Promise.resolve();
    if (Number(value) >= Number(total)) {
      return Promise.reject(new Error(PRODUCT_COMMISSION_MESSAGES.creatorLessThanTotal));
    }
    return Promise.resolve();
  },
});

export const creatorShopAdsCommissionRule = (getTotalShopAds: () => unknown): Rule => ({
  validator: async (_: unknown, value?: unknown) => {
    if (!hasValue(value)) return Promise.resolve();

    const totalShopAds = getTotalShopAds();
    if (hasValue(totalShopAds)) {
      if (Number(value) >= Number(totalShopAds)) {
        return Promise.reject(
          new Error(PRODUCT_COMMISSION_MESSAGES.creatorShopAdsLessThanTotalShopAds)
        );
      }
      return Promise.resolve();
    }

    const n = Number(value);
    if (Number.isNaN(n) || n < 1 || n > 80) {
      return Promise.reject(new Error(PRODUCT_COMMISSION_MESSAGES.creatorShopAdsRange));
    }

    return Promise.resolve();
  },
});

export function validateProductField(
  field: string,
  value: unknown,
  record: { totalCommissionRate?: unknown; totalShopAdsCommissionRate?: unknown },
  required = false
): string | null {
  if (required && !hasValue(value)) {
    return field === "referralLink"
      ? PRODUCT_REQUIRED_MESSAGES.referralLink
      : PRODUCT_REQUIRED_MESSAGES.creatorCommissionRate
  }

  if (field === "totalShopAdsCommissionRate" || field === "openCollaborationShopAdsRate") {
    if (hasValue(value)) {
      const n = Number(value)
      if (Number.isNaN(n) || n < 1 || n > 80) {
        return field === "totalShopAdsCommissionRate"
          ? PRODUCT_COMMISSION_MESSAGES.totalShopAdsRange
          : PRODUCT_COMMISSION_MESSAGES.openCollabShopAdsRange
      }
    }
  }

  if (field === "creatorCommissionRate" && hasValue(value)) {
    if (hasValue(record.totalCommissionRate) && Number(value) >= Number(record.totalCommissionRate)) {
      return PRODUCT_COMMISSION_MESSAGES.creatorLessThanTotal
    }
  }

  if (field === "creatorShopAdsCommissionRate" && hasValue(value)) {
    if (hasValue(record.totalShopAdsCommissionRate)) {
      if (Number(value) >= Number(record.totalShopAdsCommissionRate)) {
        return PRODUCT_COMMISSION_MESSAGES.creatorShopAdsLessThanTotalShopAds
      }
    } else {
      const n = Number(value)
      if (Number.isNaN(n) || n < 1 || n > 80) return PRODUCT_COMMISSION_MESSAGES.creatorShopAdsRange
    }
  }

  return null
}

export function validateCampaignProductCommission(product: any): string | null {
  const creatorCommissionRate = product?.creatorCommissionRate;
  const referralLink = (product?.referralLink || "").trim();
  if (!hasValue(creatorCommissionRate)) return PRODUCT_REQUIRED_MESSAGES.creatorCommissionRate;
  if (!referralLink) return PRODUCT_REQUIRED_MESSAGES.referralLink;

  const totalCommissionRate = product?.totalCommissionRate;
  const totalShopAdsCommissionRate = product?.totalShopAdsCommissionRate;
  const openCollaborationShopAdsRate = product?.openCollaborationShopAdsRate;
  const creatorShopAdsCommissionRate = product?.creatorShopAdsCommissionRate;

  if (hasValue(totalShopAdsCommissionRate)) {
    const n = Number(totalShopAdsCommissionRate);
    if (Number.isNaN(n) || n < 1 || n > 80) return PRODUCT_COMMISSION_MESSAGES.totalShopAdsRange;
  }

  if (hasValue(openCollaborationShopAdsRate)) {
    const n = Number(openCollaborationShopAdsRate);
    if (Number.isNaN(n) || n < 1 || n > 80) return PRODUCT_COMMISSION_MESSAGES.openCollabShopAdsRange;
  }

  if (hasValue(creatorCommissionRate) && hasValue(totalCommissionRate)) {
    if (Number(creatorCommissionRate) >= Number(totalCommissionRate)) {
      return PRODUCT_COMMISSION_MESSAGES.creatorLessThanTotal;
    }
  }

  if (hasValue(creatorShopAdsCommissionRate)) {
    if (hasValue(totalShopAdsCommissionRate)) {
      if (Number(creatorShopAdsCommissionRate) >= Number(totalShopAdsCommissionRate)) {
        return PRODUCT_COMMISSION_MESSAGES.creatorShopAdsLessThanTotalShopAds;
      }
    } else {
      const n = Number(creatorShopAdsCommissionRate);
      if (Number.isNaN(n) || n < 1 || n > 80) return PRODUCT_COMMISSION_MESSAGES.creatorShopAdsRange;
    }
  }

  return null;
}

export const campaignNameRule: RuleFactory = () =>
  requiredRule("Vui lòng nhập tên chiến dịch");

export const connectorChannelCodeRule: RuleFactory = () =>
  requiredRule("Sàn là bắt buộc");

export const creatorCommissionRateRule: RuleFactory = () =>
  requiredRule(PRODUCT_REQUIRED_MESSAGES.creatorCommissionRate);

export const referralLinkRule: RuleFactory = () =>
  requiredRule(PRODUCT_REQUIRED_MESSAGES.referralLink);

export const followersRule: RuleFactory = () =>
  requiredRule("Vui lòng chọn số lượng người theo dõi");

export const rangeAgeRule: RuleFactory = () =>
  requiredRule("Vui lòng chọn độ tuổi người theo dõi");

export const genderRule: RuleFactory = () =>
  requiredRule("Vui lòng chọn giới tính người theo dõi");

export const gmvRule: RuleFactory = () =>
  requiredRule("Vui lòng chọn GMV người theo dõi");

export const soldRule: RuleFactory = () =>
  requiredRule("Vui lòng chọn số món bán ra");

export const avgVideoViewsRule: RuleFactory = () =>
  requiredRule("Vui lòng chọn số lượt xem trung bình mỗi video");

export const avgLiveViewsRule: RuleFactory = () =>
  requiredRule("Vui lòng chọn số lượt xem trung bình mỗi LIVE");

export const engagementRateRule: RuleFactory = () =>
  requiredRule("Vui lòng chọn tỷ lệ tham gia trung bình");

export const videoCountRule: RuleFactory = () =>
  requiredRule("Vui lòng chọn số lượng video tối thiểu");

export const liveSessionCountRule: RuleFactory = () =>
  requiredRule("Vui lòng chọn số lượng phiên live tối thiểu");

export const noteRule: RuleFactory = () => [
  {
    validator: async (_: unknown, value?: string) => {
      if (isQuillEmpty(value)) {
        return Promise.reject("Vui lòng nhập nội dung");
      }

      const hasImage = value!.includes("<img");
      const textOnly = value!.replace(/<[^>]*>/g, "").trim();

      if (!hasImage && textOnly.length < 9) {
        return Promise.reject("Nội dung không được ít hơn 9 ký tự");
      }

      if (textOnly.length > 5000) {
        return Promise.reject("Nội dung không được vượt quá 5000 ký tự");
      }

      return Promise.resolve();
    },
  },
];

export const videoDemoDeadlineRule: RuleFactory = () =>
  requiredRule("Vui lòng chọn thời hạn gửi video demo");

export const postDemoDeadlineRule: RuleFactory = () =>
  requiredRule("Vui lòng chọn thời hạn đăng bài");

export const descriptionRule: RuleFactory = () => [
  {
    validator: async (_: unknown, value?: string) => {
      if (isQuillEmpty(value)) {
        return Promise.reject("Vui lòng nhập thông tin chiến dịch");
      }

      const hasImage = value!.includes("<img");
      const textOnly = value!.replace(/<[^>]*>/g, "").trim();

      if (!hasImage && textOnly.length < 9) {
        return Promise.reject("Thông tin chiến dịch không được ít hơn 9 ký tự hoặc 1 ảnh");
      }

      if (textOnly.length > 1000) {
        return Promise.reject("Thông tin chiến dịch không được vượt quá 1000 ký tự");
      }

      return Promise.resolve();
    },
  },
];

export const brandInfoRule: RuleFactory = () => [
  {
    validator: async (_: unknown, value?: string) => {
      if (isQuillEmpty(value)) {
        return Promise.reject("Vui lòng nhập thông tin nhãn hàng");
      }

      const hasImage = value!.includes("<img");
      const textOnly = value!.replace(/<[^>]*>/g, "").trim();

      if (!hasImage && textOnly.length < 9) {
        return Promise.reject("Thông tin nhãn hàng không được ít hơn 9 ký tự hoặc 1 ảnh");
      }

      if (textOnly.length > 5000) {
        return Promise.reject("Thông tin nhãn hàng không được vượt quá 5000 ký tự");
      }

      return Promise.resolve();
    },
  },
];

export const instructionRule: RuleFactory = () => [
  {
    validator: async (_: unknown, value?: string) => {
      if (isQuillEmpty(value)) {
        return Promise.reject("Vui lòng nhập hướng dẫn chiến dịch");
      }

      const hasImage = value!.includes("<img");
      const textOnly = value!.replace(/<[^>]*>/g, "").trim();

      if (textOnly.length < 9) {
        return Promise.reject("Hướng dẫn chiến dịch không được ít hơn 9 ký tự");
      }

      if (textOnly.length > 5000) {
        return Promise.reject("Hướng dẫn chiến dịch không được vượt quá 5000 ký tự");
      }

      return Promise.resolve();
    },
  },
];

export const editCampaignRules: EditCampaignRules = {
  connectorChannelCode: connectorChannelCodeRule,
};

const withCondition =
  (factory: RuleFactory): RuleFactoryHasCondition =>
    (hasCondition) =>
      hasCondition ? factory() : [];

export const conditionRules: ConditionRules = {
  followers: withCondition(followersRule),
  range_age: withCondition(rangeAgeRule),
  gender: withCondition(genderRule),
  gmv: withCondition(gmvRule),
  sold: withCondition(soldRule),
  avg_video_views: withCondition(avgVideoViewsRule),
  avg_live_views: withCondition(avgLiveViewsRule),
  engagement_rate: withCondition(engagementRateRule),
  video_count: withCondition(videoCountRule),
  live_session_count: withCondition(liveSessionCountRule),
  note: noteRule,
  video_demo_deadline: withCondition(videoDemoDeadlineRule),
  post_demo_deadline: withCondition(postDemoDeadlineRule),
};

export const storeRules: StoreRules = {
  description: withCondition(descriptionRule),
  brandInfo: withCondition(brandInfoRule),
  instruction: withCondition(instructionRule),
};