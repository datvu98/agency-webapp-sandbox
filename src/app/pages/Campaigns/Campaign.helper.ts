// Hàm ghép name cho field chỉnh sửa trong bảng

import { IConditionItem } from "app/pages/Campaigns/types";

// Ghép name = commisstion-{id}
export const getCommissionName = (id: string) => {
  return `commission-${id}`;
};

/**
 * Tính min/max commission rate từ danh sách stores
 * @param stores - Danh sách stores
 * @param minField - Tên field chứa giá trị min
 * @param maxField - Tên field chứa giá trị max
 * @returns Object {min, max}
 */
export const calculateCommissionRange = (
  stores: any[],
  minField: string,
  maxField: string
): { min?: number; max?: number } => {
  if (!stores || stores.length === 0) {
    return { min: undefined, max: undefined };
  }

  const minValues = stores
    .map((s: any) => s[minField])
    .filter((v: any) => v != null);
  const maxValues = stores
    .map((s: any) => s[maxField])
    .filter((v: any) => v != null);

  return {
    min: minValues.length > 0 ? Math.min(...minValues) : undefined,
    max: maxValues.length > 0 ? Math.max(...maxValues) : undefined,
  };
};

/**
 * Format commission rate thành string với format min-max
 * @param min - Giá trị min
 * @param max - Giá trị max
 * @returns String đã format
 */
export const formatCommissionRate = (min?: number, max?: number): string => {
  if (min == undefined && max == undefined) {
    return "--";
  }
  if (min == max) {
    return min != undefined ? `${min}%` : "--";
  }
  const minStr = min != undefined ? `${min}%` : "--";
  const maxStr = max != undefined ? `${max}%` : "--";
  return `${minStr} - ${maxStr}`;
};

/**
 * Đếm số stores visible to creator
 * @param stores - Danh sách stores
 * @returns Object {visibleCount, totalCount}
 */
export const countVisibleStores = (
  stores: any[]
): { visibleCount: number; totalCount: number } => {
  if (!stores || stores.length === 0) {
    return { visibleCount: 0, totalCount: 0 };
  }

  const visibleCount = stores.filter((s: any) => s.visibleToCreator).length;
  return { visibleCount, totalCount: stores.length };
};

export const makeNestedName = <Parent extends string, T extends string>(
  parent: Parent,
  field: T,
  index = 0
): [Parent, number, T] => [parent, index, field];
