export const CAMPAIGN_STATUS_ONGOING = 'ONGOING';
export const CAMPAIGN_STATUS_UPCOMING = 'UPCOMING';
export const CAMPAIGN_STATUS_CLOSED = 'CLOSED';

export const CAMPAIGN_STATUS_OPTIONS = [
  {
    label: 'Sắp tới',
    value: CAMPAIGN_STATUS_UPCOMING,
    color: 'orange',
  },
  {
    label: 'Đang diễn ra',
    value: CAMPAIGN_STATUS_ONGOING,
    color: 'green',
  },
  {
    label: 'Đã đóng',
    value: CAMPAIGN_STATUS_CLOSED,
    color: 'gray',
  }
];


export const CAMPAIGN_STORE_VISIBLE_ON = 1
export const CAMPAIGN_STORE_VISIBLE_OFF = 0

export const VISIBLE_TO_CREATORS_FILTER_OPTIONS = [
  { label: 'Hiển thị với nhà sáng tạo', value: CAMPAIGN_STORE_VISIBLE_ON },
  { label: 'Không hiển thị với nhà sáng tạo', value: CAMPAIGN_STORE_VISIBLE_OFF },
]

export const REVIEW_DEMO_STATUS_OPTIONS = [
  { label: "Không yêu cầu duyệt demo", value: 0 },
  { label: "Yêu cầu duyệt demo", value: 1 },
];