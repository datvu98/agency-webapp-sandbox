import { useCallback, useEffect, useMemo, useState } from "react";

type StoreLike = {
  id?: string | number | null;
  storeName?: string | null;
};

type UseCampaignStoreTabsParams<TStore extends StoreLike> = {
  stores?: TStore[] | null;
};

function useCampaignStoreTabs<TStore extends StoreLike>({
  stores,
}: UseCampaignStoreTabsParams<TStore>) {
  const safeStores = stores ?? [];
  const [activeStoreId, setActiveStoreId] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!safeStores.length) {
      setActiveStoreId(undefined);
      return;
    }

    setActiveStoreId((prev) => {
      const exists = safeStores.some((s) => String(s.id) === String(prev));
      return exists ? prev : String(safeStores[0].id);
    });
  }, [safeStores]);

  const activeStoreIndex = useMemo(() => {
    if (!safeStores.length) return 0;
    const foundIndex = safeStores.findIndex(
      (s) => String(s.id) === String(activeStoreId),
    );
    return foundIndex >= 0 ? foundIndex : 0;
  }, [activeStoreId, safeStores]);

  const tabItems = useMemo(() => {
    return safeStores.map((store) => ({
      key: String(store.id),
      label: store.storeName ?? "",
    }));
  }, [safeStores]);

  const handleChangeTab = useCallback((key: string) => {
    setActiveStoreId(key);
  }, []);

  const activeKey = useMemo(() => {
    if (activeStoreId) return activeStoreId;
    return safeStores[0] ? String(safeStores[0].id) : "";
  }, [activeStoreId, safeStores]);

  return {
    activeKey,
    activeStoreId,
    setActiveStoreId,
    activeStoreIndex,
    tabItems,
    handleChangeTab,
    stores: safeStores,
  };
}

export { useCampaignStoreTabs };


