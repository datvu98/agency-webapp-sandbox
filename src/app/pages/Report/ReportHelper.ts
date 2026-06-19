import { DATE_RANGE_TYPE, FORMAT_DATE_RANGE, MAX_DAYS_IN_MONTH, MAX_DAYS_IN_WEEK, MAX_MONTHS_IN_YEAR, TIMESTAMP_PER_DAY, TIMESTAMP_PER_HOURS } from "./ReportConstants";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);

const generateTypeDate = (from: number | null, to: number | null) => {
  if (!from || !to) return DATE_RANGE_TYPE.DAY;

  const formattedDateRange = [dayjs.unix(from).format('YYYY-MM-DD'), dayjs.unix(to).format('YYYY-MM-DD')]
  const rangeDays = dayjs(formattedDateRange[1]).diff(formattedDateRange[0], 'days');

  if (rangeDays == 0)
    return DATE_RANGE_TYPE.HOURS
  if (rangeDays <= MAX_DAYS_IN_MONTH)
    return DATE_RANGE_TYPE.DAY
  if (rangeDays <= MAX_DAYS_IN_MONTH * MAX_DAYS_IN_WEEK)
    return DATE_RANGE_TYPE.WEEK
  if (rangeDays <= MAX_DAYS_IN_MONTH * MAX_DAYS_IN_MONTH)
    return DATE_RANGE_TYPE.MONTH
  if (rangeDays <= MAX_DAYS_IN_MONTH * MAX_DAYS_IN_MONTH * MAX_MONTHS_IN_YEAR)
    return DATE_RANGE_TYPE.YEAR

  return DATE_RANGE_TYPE.DAY
}

const generateDateDefault = (range: number = 7, showHours: boolean = false) => {
  return {
    from: dayjs().subtract(range, 'day').startOf('day').unix(),
    to: dayjs().subtract(showHours ? 0 : 1, 'day').endOf('day').unix(),
  }
};

const caculateStepRange = (type) => {
  switch (type) {
    case DATE_RANGE_TYPE.HOURS:
      return TIMESTAMP_PER_HOURS;
    case DATE_RANGE_TYPE.DAY:
      return TIMESTAMP_PER_DAY;
    case DATE_RANGE_TYPE.WEEK:
      return TIMESTAMP_PER_DAY * MAX_DAYS_IN_WEEK;
    case DATE_RANGE_TYPE.MONTH:
      return TIMESTAMP_PER_DAY * MAX_DAYS_IN_MONTH;
    case DATE_RANGE_TYPE.YEAR:
      return TIMESTAMP_PER_DAY * MAX_DAYS_IN_MONTH * MAX_MONTHS_IN_YEAR;
    default:
      return TIMESTAMP_PER_DAY;
  }
};

const generateDateRange = (from: number, to: number, type: string) => {
  const dates = [] as any;

  let timestamp = from;

  while (timestamp <= to) {
    const date = dayjs.unix(timestamp);
    dates.push(date);

    timestamp += caculateStepRange(type);
  }

  const mappedData = {
    date: dates.map(date => date.format(FORMAT_DATE_RANGE[type])),
    range: dates.map((date, index) => {
      let fromDate, toDate;

      if (type == DATE_RANGE_TYPE.WEEK) {
        if (index == 0) {
          fromDate = dayjs(date).format('DD/MM');
        } else {
          fromDate = dayjs(date).startOf('week').format('DD/MM');
        }

        if (index == dates?.length - 1) {
          toDate = dayjs.unix(to).format('DD/MM');
        } else {
          toDate = dayjs(date).endOf('week').format('DD/MM');
        }

        return `${fromDate} - ${toDate}`
      }

      return date.format(FORMAT_DATE_RANGE[type]);
    })
  };

  return mappedData
};

const generateAvgTimestamp = (timestamp: number) => {
  const hours = Math.floor(timestamp / 3600);
  const minutes = Math.floor((timestamp % 3600) / 60) || '00';
  const seconds = Math.floor(timestamp % 60) || '00';

  return [hours, minutes, seconds].join(':')
}

export { generateDateDefault, generateTypeDate, generateDateRange, generateAvgTimestamp };