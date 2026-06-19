import { Dayjs } from "dayjs";

export enum ESORT_DIRECTION {
  ASC = "asc",
  DESC = "desc",
}

export enum EORDER_BY_COLUMN {
  CREATED_AT = "createdAt",
}

export interface CampaignSampleFilterValues {
  q?: string;
  rangeTime?: string[] | [Dayjs, Dayjs];
  key_time?: string;
  advertisingTypes?: string[];
  listStatus?: string[];
  isPreShippingCancel?: boolean;
  subTab?: string;
  cancelBy?: string;
  page?: number;
  limit?: number;
  column?: EORDER_BY_COLUMN;
  direction?: ESORT_DIRECTION;
  order_by?: {
    column?: EORDER_BY_COLUMN;
    direction?: ESORT_DIRECTION;
  };
  registeredProductCountType?: string;
}

export interface CampaignJobExportExcelInput {
  advertisingTypes?: string[];
  campaignJobIds?: number[];
  campaignStoreId?: number;
  cancelBy?: string;
  key_time?: string;
  listStatus?: string[];
  isPreShippingCancel?: boolean;
  q?: string;
  rangeTime?: string[];
  registeredProductCountType?: string;
}
