// utils.ts
import dayjs, { Dayjs } from "dayjs";

export const FORMAT_DATE_TIME = "YYYY-MM-DD HH:mm:ss";

export const formatDate = (date: string, format: string = FORMAT_DATE_TIME) => {
  return dayjs(date).format(format);
};

export const formatDateRange = (
  date: string[],
  format: string = FORMAT_DATE_TIME,
) => {
  return [
    date[0] ? dayjs(date[0]).startOf("day").format(format) : null,
    date[1] ? dayjs(date[1]).endOf("day").format(format) : null,
  ];
};

const toArrayRangeTime = (rangeTime?: unknown): string[] | undefined => {
  if (Array.isArray(rangeTime)) {
    const result = rangeTime
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
    return result.length ? result : undefined;
  }

  if (typeof rangeTime === "string") {
    const result = rangeTime
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    return result.length ? result : undefined;
  }

  return undefined;
};

const toArrayRangeTimeFromPicker = (
  rangeTime?: unknown,
): string[] | undefined => {
  if (!Array.isArray(rangeTime)) return undefined;

  const result = rangeTime
    .map((item) => {
      if (!item) return undefined;

      if (dayjs.isDayjs(item)) {
        return item.format(FORMAT_DATE_TIME);
      }

      if (item instanceof Date) {
        return dayjs(item).format(FORMAT_DATE_TIME);
      }

      if (typeof item === "string") {
        const trimmed = item.trim();
        if (!trimmed) return undefined;
        const parsed = dayjs(trimmed);
        return parsed.isValid() ? parsed.format(FORMAT_DATE_TIME) : undefined;
      }

      return undefined;
    })
    .filter((item): item is string => Boolean(item));

  return result.length ? result : undefined;
};

/**
 * Convert string[] từ params → Dayjs[] để đưa vào RangePicker
 */
const toRangePickerValue = (
  rangeTime?: unknown,
): [Dayjs, Dayjs] | undefined => {
  const arr = toArrayRangeTime(rangeTime);
  if (!arr || arr.length < 2) return undefined;

  const start = dayjs(arr[0]);
  const end = dayjs(arr[1]);

  if (!start.isValid() || !end.isValid()) return undefined;

  return [start, end];
};

export type TimeDiffResult = {
  isPast: boolean;
  days: number;
  formatted: string;
  dateFormat: string;
  color: string;
};

const TIME_DIFF_COLOR = {
  onTime: "#389E0D",
  overdue: "#ff4d4f",
} as const;

export const getTimeDiff = (
  input: string | Date | undefined,
  format: string = "DD/MM/YYYY",
): TimeDiffResult | null => {
  if (!input) return null;

  const date = dayjs(input);
  if (!date.isValid()) return null;

  const today = dayjs().startOf("day");
  const target = date.startOf("day");

  const isPast = target.isBefore(today);
  const days = Math.abs(target.diff(today, "day"));

  return {
    isPast,
    days,
    formatted: isPast ? `Quá hạn ${days} ngày` : `Còn ${days} ngày`,
    dateFormat: date.format(format),
    color: isPast ? TIME_DIFF_COLOR.overdue : TIME_DIFF_COLOR.onTime,
  };
};

type SubmissionDiffResult = {
  isLate: boolean;
  days: number;
  deadline: dayjs.Dayjs;
  submitted: dayjs.Dayjs;
};

export const getSubmissionDiff = (
  deadline: string | Date | undefined,
  submittedAt: string | Date | undefined,
): SubmissionDiffResult | null => {
  if (!deadline || !submittedAt) return null;

  const d = dayjs(deadline).startOf("day");
  const s = dayjs(submittedAt).startOf("day");

  if (!d.isValid() || !s.isValid()) return null;

  return {
    isLate: s.isAfter(d),
    days: Math.abs(s.diff(d, "day")),
    deadline: d,
    submitted: s,
  };
};

export {
  dayjs,
  toArrayRangeTime,
  toArrayRangeTimeFromPicker,
  toRangePickerValue,
};
