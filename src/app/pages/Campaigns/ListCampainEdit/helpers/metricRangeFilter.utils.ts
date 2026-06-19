import type { FormInstance } from "antd";
import type { NamePath } from "antd/es/form/interface";
import type { IConditionItem } from "app/pages/Campaigns/types";

export const METRIC_RANGE_MAX = 999999999999;

export const formatCurrency = (value?: string | number | null) => {
  if (value == null || value === "") return "";
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const parseCurrency = (value?: string) => {
  if (!value) return null as any;
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : null;
};

export const formatRangeDisplay = (value?: number | null) => {
  if (!Number.isFinite(Number(value))) return "--";
  const num = Number(value);
  if (num >= 1_000_000_000) {
    const amount = num / 1_000_000_000;
    return `${Number.isInteger(amount) ? amount : amount.toFixed(1)} tỉ`;
  }
  if (num >= 1_000_000) {
    const amount = num / 1_000_000;
    return `${Number.isInteger(amount) ? amount : amount.toFixed(1)} triệu`;
  }
  if (num >= 1_000) {
    const amount = num / 1_000;
    return `${Number.isInteger(amount) ? amount : amount.toFixed(1)} nghìn`;
  }
  return formatCurrency(num);
};

export const createValidateMinRange = (
  form: FormInstance,
  nameNoLimit: NamePath,
  nameMax: NamePath,
) =>
  (_: unknown, value?: number) => {
    if (value == null) return Promise.reject(new Error("Vui lòng nhập giá trị"));
    if (!Number.isInteger(value) || value < 0) {
      return Promise.reject(new Error("Giá trị tối thiểu không được nhỏ hơn 0"));
    }
    if (value > METRIC_RANGE_MAX) {
      return Promise.reject(new Error("Giá trị tối thiểu không được lớn hơn 999.999.999.999"));
    }
    const isNoLimit = form.getFieldValue(nameNoLimit);
    if (isNoLimit && value < 1) {
      return Promise.reject(new Error("Giá trị tối thiểu phải lớn hơn 0"));
    }
    const maxVal = form.getFieldValue(nameMax);
    if (!isNoLimit && Number.isInteger(maxVal) && value >= Number(maxVal)) {
      return Promise.reject(new Error("Giá trị tối thiểu phải nhỏ hơn tối đa"));
    }
    return Promise.resolve();
  };

export const createValidateMaxRange =
  (
    form: FormInstance,
    nameMin: NamePath,
    nameNoLimit: NamePath,
  ) =>
  (_: unknown, value?: number) => {
    const isNoLimit = form.getFieldValue(nameNoLimit);
    if (isNoLimit) return Promise.resolve();

    const minVal = form.getFieldValue(nameMin);
    if (value == null) return Promise.reject(new Error("Vui lòng nhập giá trị"));
    if (!Number.isInteger(value) || value < 0) {
      return Promise.reject(new Error("Giá trị tối đa không được nhỏ hơn 0"));
    }
    if (value > METRIC_RANGE_MAX) {
      return Promise.reject(new Error("Giá trị tối đa không được lớn hơn 999.999.999.999"));
    }
    if (Number.isInteger(minVal) && value <= Number(minVal)) {
      return Promise.reject(new Error("Giá trị tối đa phải lớn hơn tối thiểu"));
    }
    return Promise.resolve();
  };

/**
 * Ghi lại matrix field (gmv, followers, …) dựa trên các trường min / max / no_limit.
 * Nguồn sự thật là _min, _max, _no_limit — matrix chỉ là output phục vụ save.
 */
export const syncMetricRange = ({
  form,
  nameMatrix,
  nameMin,
  nameMax,
  nameNoLimit,
  enabled,
  minValue,
  maxValue,
  noLimitValue,
}: {
  form: FormInstance;
  nameMatrix: NamePath;
  nameMin: NamePath;
  nameMax: NamePath;
  nameNoLimit: NamePath;
  enabled: boolean;
  minValue?: number | null;
  maxValue?: number | null;
  noLimitValue?: boolean;
}) => {
  if (!enabled) return;

  if (noLimitValue) {
    if (maxValue != null) {
      form.setFieldValue(nameMax, null);
    }
    const min = minValue ?? null;
    form.setFieldValue(nameMatrix, min != null ? [[min]] : []);
    return;
  }

  const hasMin = minValue != null && !Number.isNaN(Number(minValue));
  const hasMax = maxValue != null && !Number.isNaN(Number(maxValue));
  if (!hasMin && !hasMax) {
    form.setFieldValue(nameMatrix, []);
    return;
  }

  form.setFieldValue(nameMatrix, [
    hasMax
      ? [hasMin ? minValue : null, maxValue]
      : [hasMin ? minValue : null],
  ]);
};

