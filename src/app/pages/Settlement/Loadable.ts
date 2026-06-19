import { lazyLoad } from "utils/loadable";


export const SettlementManual = lazyLoad(
  () => import("./SettlementManual"),
  (module) => module.default
);

export const HistoryExportFileSettlementPending = lazyLoad(
  () => import("./HistoryExportFileSettlementPending"),
  (module) => module.default
);

export const HistoryExportFileSettlementProcessed = lazyLoad(
  () => import("./HistoryExportFileSettlementProcessed"),
  (module) => module.default
);
