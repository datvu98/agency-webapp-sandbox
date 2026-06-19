import { Form } from "antd";

const useWatchConditions = (form: any, activeStoreIndex: number) => {
  const basePath: (string | number)[] = [
    "stores",
    activeStoreIndex,
    "conditions",
    0,
  ];

  const names = {
    followers_enabled: [...basePath, "followers_enabled"],
    range_age_enabled: [...basePath, "range_age_enabled"],
    gender_enabled: [...basePath, "gender_enabled"],
    gmv_enabled: [...basePath, "gmv_enabled"],
    sold_enabled: [...basePath, "sold_enabled"],
    avg_video_views_enabled: [...basePath, "avg_video_views_enabled"],
    avg_live_views_enabled: [...basePath, "avg_live_views_enabled"],
    engagement_rate_enabled: [...basePath, "engagement_rate_enabled"],
    video_enabled: [...basePath, "video_enabled"],
    livestream_enabled: [...basePath, "livestream_enabled"],
  };

  return {
    followers_enabled: Form.useWatch(names.followers_enabled, form),
    range_age_enabled: Form.useWatch(names.range_age_enabled, form),
    gender_enabled: Form.useWatch(names.gender_enabled, form),
    gmv_enabled: Form.useWatch(names.gmv_enabled, form),
    sold_enabled: Form.useWatch(names.sold_enabled, form),
    avg_video_views_enabled: Form.useWatch(names.avg_video_views_enabled, form),
    avg_live_views_enabled: Form.useWatch(names.avg_live_views_enabled, form),
    engagement_rate_enabled: Form.useWatch(names.engagement_rate_enabled, form),
    video_enabled: Form.useWatch(names.video_enabled, form),
    livestream_enabled: Form.useWatch(names.livestream_enabled, form),
  };
};

export { useWatchConditions };
