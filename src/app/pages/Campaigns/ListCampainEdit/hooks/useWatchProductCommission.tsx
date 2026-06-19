import { Form } from "antd";
import { ICampaignProduct, ICampaignStore } from "app/pages/Campaigns/types";

const useWatchProductCommission = (form: any, activeStoreIndex: number) => {
  const storesValue = Form.useWatch("stores", form);
  const storeValue = storesValue?.[activeStoreIndex];
  const fallbackStoreValue =
    form?.getFieldValue?.(["stores", activeStoreIndex]) || {};

  return {
    activeStore: (storeValue || fallbackStoreValue) as ICampaignStore | undefined,
    wageAmount: (storeValue?.wageAmount ??
      fallbackStoreValue?.wageAmount) as number | undefined,
    products: (storeValue?.products ??
      fallbackStoreValue?.products) as
      | ICampaignProduct[]
      | undefined,
  };
};

export { useWatchProductCommission };
