import { lazyLoad } from "utils/loadable";


export const ReportOverview = lazyLoad(
  () => import("./Operation"),
  (module) => module.default
);

export const FullfillmentReport = lazyLoad(
  () => import("./FullfillmentReport"),
  (module) => module.default
);
