import { lazyLoad } from "utils/loadable";

export const InventoryCountingList = lazyLoad(
  () => import("./InventoryCountingList"),
  (module) => module.default
);

export const InventoryCountingDetail = lazyLoad(
  () => import("./InventoryCountingDetail"),
  (module) => module.default
);
