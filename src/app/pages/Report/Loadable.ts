import { lazyLoad } from "utils/loadable";


export const ReportOverview = lazyLoad(
  () => import("./ReportOverview"),
  (module) => module.default
);
