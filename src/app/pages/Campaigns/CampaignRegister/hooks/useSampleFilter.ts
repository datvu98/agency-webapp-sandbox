// useSampleFilter.ts

import {
  CANCELLED_BY_AGENCY,
  ETYPE_PROCESS_STATUS,
  ETYPE_TIME,
} from "app/pages/Campaigns/CampaignRegister/constants/constant";
import {
  CampaignJobExportExcelInput,
  CampaignSampleFilterValues,
  EORDER_BY_COLUMN,
  ESORT_DIRECTION,
  ICampaignJob,
} from "app/pages/Campaigns/CampaignRegister/types";
import { useCallback, useMemo } from "react";
import { useQueryParams } from "./useQueryParams";
import type { TablePaginationConfig } from "antd";
import {
  formatDateRange,
  toArrayRangeTime,
  toArrayRangeTimeFromPicker,
  toRangePickerValue,
} from "app/pages/Campaigns/utils";
import { SorterResult } from "antd/es/table/interface";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const DEFAULT_SORT = {
  column: EORDER_BY_COLUMN.CREATED_AT,
  direction: ESORT_DIRECTION.DESC,
};

function firstQueryStringValue(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (Array.isArray(v)) return v[0] != null ? String(v[0]) : undefined;
  return String(v);
}

export function useSampleFilter() {
  const { params, setParams } = useQueryParams<CampaignSampleFilterValues>();

  const subTabFromUrl = useMemo(
    () => firstQueryStringValue(params.subTab as unknown),
    [params.subTab]
  );

  const cancelByFromUrl = useMemo(
    () => firstQueryStringValue(params.cancelBy as unknown),
    [params.cancelBy]
  );

  const advertisingTypes = useMemo(() => {
    return Array.isArray(params.advertisingTypes)
      ? params.advertisingTypes
      : typeof params.advertisingTypes === "string"
      ? [params.advertisingTypes]
      : undefined;
  }, [params.advertisingTypes]);

  const sort = useMemo(() => {
    if (!params.column || !params.direction) return undefined;

    return {
      column: params.column,
      direction: params.direction,
    };
  }, [params.column, params.direction]);

  const onSubmit = useCallback(
    (values: CampaignSampleFilterValues) => {
      const { q, rangeTime, key_time, advertisingTypes, registeredProductCountType } = values;

      const parsedRangeTime = toArrayRangeTimeFromPicker(rangeTime);
      const resolvedSubTab = subTabFromUrl ?? ETYPE_PROCESS_STATUS.ALL;
      const resolvedCancelBy =
        resolvedSubTab === ETYPE_PROCESS_STATUS.CANCELLED
          ? cancelByFromUrl ?? CANCELLED_BY_AGENCY
          : undefined;

      setParams({
        q: q || undefined,
        rangeTime: parsedRangeTime || undefined,
        key_time: key_time || undefined,
        advertisingTypes: advertisingTypes || undefined,
        registeredProductCountType: registeredProductCountType || undefined,
        subTab: resolvedSubTab,
        cancelBy: resolvedCancelBy,
        page: DEFAULT_PAGE,
        limit: params.limit ?? DEFAULT_LIMIT,
      });
    },
    [setParams, params.limit, subTabFromUrl, cancelByFromUrl]
  );

  const onSubTabChange = useCallback(
    (nextSubTab: string) => {
      setParams({
        ...params,
        subTab: nextSubTab,
        cancelBy:
          nextSubTab === ETYPE_PROCESS_STATUS.CANCELLED
            ? cancelByFromUrl ?? CANCELLED_BY_AGENCY
            : undefined,
        page: DEFAULT_PAGE,
        column: DEFAULT_SORT.column,
        direction: DEFAULT_SORT.direction,
      });
    },
    [setParams, params, cancelByFromUrl]
  );

  const onCancelByChange = useCallback(
    (nextCancelBy: string) => {
      setParams({
        ...params,
        cancelBy: nextCancelBy,
        page: DEFAULT_PAGE,
      });
    },
    [setParams, params]
  );

  const onTableChange = (
    pagination: TablePaginationConfig,
    _filters: unknown,
    sorter: SorterResult<ICampaignJob> | SorterResult<ICampaignJob>[]
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    const resolvedPage = Number(
      pagination.current ?? params.page ?? DEFAULT_PAGE
    );
    const resolvedLimit = Number(
      pagination.pageSize ?? params.limit ?? DEFAULT_LIMIT
    );

    setParams({
      ...params,
      page: resolvedPage,
      limit: resolvedLimit,
      ...(s.order
        ? {
            column: s.columnKey as EORDER_BY_COLUMN,
            direction:
              s.order === "ascend"
                ? ESORT_DIRECTION.ASC
                : ESORT_DIRECTION.DESC,
          }
        : {
            column: undefined,
            direction: undefined,
          }),
    });
  };

  const initValues = useCallback(() => {
    const rangePickerValue = toRangePickerValue(params.rangeTime);
    const resolvedSubTab = subTabFromUrl ?? ETYPE_PROCESS_STATUS.ALL;
    const cancelBy =
      resolvedSubTab === ETYPE_PROCESS_STATUS.CANCELLED
        ? cancelByFromUrl ?? CANCELLED_BY_AGENCY
        : undefined;

    return {
      ...params,
      rangeTime: rangePickerValue,
      key_time: params.key_time ?? ETYPE_TIME.CREATED_AT,
      cancelBy,
    };
  }, [params, subTabFromUrl, cancelByFromUrl]);

  const apiParams = useCallback(() => {
    const formattedRangeTime = params.rangeTime
      ? formatDateRange(
          toArrayRangeTimeFromPicker(params.rangeTime) as string[]
        )
      : undefined;
    const rangeTime = formattedRangeTime?.filter(
      (value): value is string => typeof value === "string"
    );
    const resolvedSubTab = subTabFromUrl ?? ETYPE_PROCESS_STATUS.ALL;
    const resolvedCancelBy =
      resolvedSubTab === ETYPE_PROCESS_STATUS.CANCELLED
        ? cancelByFromUrl ?? CANCELLED_BY_AGENCY
        : undefined;
    const isNeedProcessTab = resolvedSubTab === ETYPE_PROCESS_STATUS.NEED_PROCESS;

    const listStatus = isNeedProcessTab
      ? undefined
      : resolvedSubTab === ETYPE_PROCESS_STATUS.ALL
        ? undefined
        : [resolvedSubTab];

    return {
      q: params.q,
      rangeTime: toArrayRangeTime(rangeTime),
      key_time: params.key_time ?? ETYPE_TIME.CREATED_AT,
      advertisingTypes: advertisingTypes,
      registeredProductCountType: params.registeredProductCountType || undefined,
      listStatus,
      ...(resolvedCancelBy ? { cancelBy: resolvedCancelBy } : {}),
      ...(isNeedProcessTab ? { isPreShippingCancel: true } : {}),
      page: Number(params.page ?? DEFAULT_PAGE),
      limit: Number(params.limit ?? DEFAULT_LIMIT),
      order_by: sort,
    };
  }, [params, subTabFromUrl, advertisingTypes, sort]);

  const apiPayload = useMemo(() => apiParams(), [apiParams]);

  const countFilterPayload = useMemo(() => {
    const formattedRangeTime = params.rangeTime
      ? formatDateRange(
          toArrayRangeTimeFromPicker(params.rangeTime) as string[],
        )
      : undefined;
    const rangeTime = formattedRangeTime?.filter(
      (value): value is string => typeof value === "string",
    );

    return {
      q: params.q,
      rangeTime: toArrayRangeTime(rangeTime),
      key_time: params.key_time ?? ETYPE_TIME.CREATED_AT,
      advertisingTypes,
      registeredProductCountType:
        params.registeredProductCountType || undefined,
    };
  }, [
    params.q,
    params.rangeTime,
    params.key_time,
    params.registeredProductCountType,
    advertisingTypes,
  ]);

  const exportPayload = useMemo((): Omit<
    CampaignJobExportExcelInput,
    "campaignStoreId"
  > => {
    const formattedRangeTime = params.rangeTime
      ? formatDateRange(
          toArrayRangeTimeFromPicker(params.rangeTime) as string[],
        ) 
      : undefined;
    const rangeTime = formattedRangeTime?.filter(
      (value): value is string => typeof value === "string",
    );
    const resolvedSubTab = subTabFromUrl ?? ETYPE_PROCESS_STATUS.ALL;
    const resolvedCancelBy =
      resolvedSubTab === ETYPE_PROCESS_STATUS.CANCELLED
        ? cancelByFromUrl ?? CANCELLED_BY_AGENCY
        : undefined;
    const isNeedProcessTab = resolvedSubTab === ETYPE_PROCESS_STATUS.NEED_PROCESS;
    const listStatus = isNeedProcessTab
      ? undefined
      : resolvedSubTab === ETYPE_PROCESS_STATUS.ALL
        ? undefined
        : [resolvedSubTab];

    return {
      q: params.q,
      rangeTime: toArrayRangeTime(rangeTime),
      key_time: params.key_time ?? ETYPE_TIME.CREATED_AT,
      registeredProductCountType: params.registeredProductCountType || undefined,
      ...(listStatus ? { listStatus } : {}),
      ...(resolvedCancelBy ? { cancelBy: resolvedCancelBy } : {}),
      ...(isNeedProcessTab ? { isPreShippingCancel: true } : {}),
    };
  }, [params.q, params.rangeTime, params.key_time, params.registeredProductCountType, cancelByFromUrl, subTabFromUrl]);

  const pagination: TablePaginationConfig = {
    current: Number(params.page ?? DEFAULT_PAGE),
    pageSize: Number(params.limit ?? DEFAULT_LIMIT),
    showSizeChanger: true,
  };

  const subTab = subTabFromUrl ?? ETYPE_PROCESS_STATUS.ALL;

  return {
    initValues,
    onSubmit,
    onSubTabChange,
    onCancelByChange,
    onTableChange,
    apiPayload,
    countFilterPayload,
    exportPayload,
    pagination,
    subTab,
    cancelBy: cancelByFromUrl ?? (subTab === ETYPE_PROCESS_STATUS.CANCELLED ? "agency" : undefined),
  };
}
