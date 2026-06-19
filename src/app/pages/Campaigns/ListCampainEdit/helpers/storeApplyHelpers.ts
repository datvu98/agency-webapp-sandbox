import { Form } from "antd";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import type { FormInstance } from "antd";
import { useEffect, useRef } from "react";
import type {
  ICampaignStore,
  IEditCampaignForm,
} from "app/pages/Campaigns/types/EditCampaign.type";

type ApplyField =
  | "applyBanner"
  | "applyDescription"
  | "applyBrandInfo"
  | "applyInstruction";

// Gọi khi checkbox "Áp dụng cho toàn bộ cửa hàng" được tick
export const createHandleApplyToAllStores = (
  form: FormInstance<IEditCampaignForm>,
  activeStoreIndex: number
) => {
  return (
    applyField: ApplyField,
    valueFields: (keyof ICampaignStore)[]
  ) =>
    (event: CheckboxChangeEvent) => {
      const checked = event.target.checked;
      if (!checked) return;

      const allStores = (form.getFieldValue("stores") || []) as ICampaignStore[];
      const currentStore = allStores?.[activeStoreIndex];
      if (!currentStore) return;

      const nextStores = allStores.map((store, index) => {
        if (!store) return store;
        if (index === activeStoreIndex) {
          return { ...store, [applyField]: true };
        }

        const updated: Partial<ICampaignStore> = { [applyField]: true };
        valueFields.forEach((field) => {
          (updated as any)[field] = (currentStore as any)[field];
        });

        return { ...store, ...updated } as ICampaignStore;
      });

      form.setFieldsValue({ stores: nextStores });
    };
};

// Tự động đồng bộ khi user chỉnh sửa field ở store đang active
// mà đã bật "Áp dụng cho toàn bộ cửa hàng" từ trước
export const useSyncStoreFields = (
  form: FormInstance<IEditCampaignForm>,
  activeStoreIndex: number
) => {
  const description = Form.useWatch(
    ["stores", activeStoreIndex, "description"],
    form
  );
  const brandInfo = Form.useWatch(
    ["stores", activeStoreIndex, "brandInfo"],
    form
  );
  const instruction = Form.useWatch(
    ["stores", activeStoreIndex, "instruction"],
    form
  );
  const bannerDesktopUrl = Form.useWatch(
    ["stores", activeStoreIndex, "bannerDesktopUrl"],
    form
  );
  const bannerMobileUrl = Form.useWatch(
    ["stores", activeStoreIndex, "bannerMobileUrl"],
    form
  );

  // Dùng ref để phân biệt "tab đổi" vs "user sửa nội dung"
  const prevIndexRef = useRef(activeStoreIndex);

  const syncToOtherStores = (
    applyField: ApplyField,
    valueFields: (keyof ICampaignStore)[]
  ) => {
    const allStores = (form.getFieldValue("stores") || []) as ICampaignStore[];
    const currentStore = allStores?.[activeStoreIndex];
    if (!currentStore || !currentStore[applyField]) return;

    let hasAnyChange = false;

    const nextStores = allStores.map((store, index) => {
      if (!store || index === activeStoreIndex) return store;
      // Chỉ sync sang store nào cũng đang bật cùng applyField
      if (!store[applyField]) return store;

      const updated: Partial<ICampaignStore> = {};
      let changed = false;

      valueFields.forEach((field) => {
        if ((store as any)[field] !== (currentStore as any)[field]) {
          (updated as any)[field] = (currentStore as any)[field];
          changed = true;
        }
      });

      if (!changed) return store;
      hasAnyChange = true;
      return { ...store, ...updated } as ICampaignStore;
    });

    if (hasAnyChange) {
      form.setFieldsValue({ stores: nextStores });
    }
  };

  useEffect(() => {
    if (prevIndexRef.current !== activeStoreIndex) {
      prevIndexRef.current = activeStoreIndex;
      return;
    }
    syncToOtherStores("applyDescription", ["description"]);
  }, [description]);

  useEffect(() => {
    if (prevIndexRef.current !== activeStoreIndex) {
      prevIndexRef.current = activeStoreIndex;
      return;
    }
    syncToOtherStores("applyBrandInfo", ["brandInfo"]);
  }, [brandInfo]);

  useEffect(() => {
    if (prevIndexRef.current !== activeStoreIndex) {
      prevIndexRef.current = activeStoreIndex;
      return;
    }
    syncToOtherStores("applyInstruction", ["instruction"]);
  }, [instruction]);

  useEffect(() => {
    if (prevIndexRef.current !== activeStoreIndex) {
      prevIndexRef.current = activeStoreIndex;
      return;
    }
    syncToOtherStores("applyBanner", ["bannerDesktopUrl", "bannerMobileUrl"]);
  }, [bannerDesktopUrl, bannerMobileUrl]);
};
