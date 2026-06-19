import { Form } from "antd";
import { ICampaignStore } from "app/pages/Campaigns/types";
import { useMemo } from "react";

type UseStoreLockStatusParams = {
  form: any;
  activeStoreIndex: number;
  initialStores?: ICampaignStore[];
};

export const isCampaignStoreLocked = (store?: {
  creatorIdsJoinedCount?: number;
} | null) => Number(store?.creatorIdsJoinedCount ?? 0) > 0;

const useStoreLockStatus = ({
  form,
  activeStoreIndex,
  initialStores,
}: UseStoreLockStatusParams) => {
  const watchedCreatorIdsJoinedCount = Form.useWatch(
    ["stores", activeStoreIndex, "creatorIdsJoinedCount"],
    form
  );

  return useMemo(() => {
    const fallbackStore = initialStores?.[activeStoreIndex];
    const creatorIdsJoinedCount = Number(
      watchedCreatorIdsJoinedCount ?? fallbackStore?.creatorIdsJoinedCount ?? 0
    );

    return isCampaignStoreLocked({ creatorIdsJoinedCount });
  }, [activeStoreIndex, initialStores, watchedCreatorIdsJoinedCount]);
};

export { useStoreLockStatus };
