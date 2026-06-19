export enum EJoinType {
  CONDITION = "condition",
  SPECIFIED = "specified",
}

export const JOIN_TYPE_OPTIONS = [
  { value: EJoinType.CONDITION, label: "Theo điều kiện" },
  {
    value: EJoinType.SPECIFIED,
    label: "Theo chỉ định",
    disabled: true,
    tooltipTitle: "Hiện tại chưa hỗ trợ",
    tooltipPlacement: "top",
  },
];

export const FOLLOWER_REQUIREMENT_OPTIONS = [
  { value: 1, label: "Số lượng người theo dõi" },
  { value: 2, label: "Độ tuổi người theo dõi" },
  { value: 3, label: "Giới tính người theo dõi" },
];

export const PERFORMANCE_REQUIREMENT_OPTIONS = [
  { value: 1, label: "GMV" },
  { value: 2, label: "Số món bán ra" },
  { value: 3, label: "Số lượt xem trung bình mỗi video" },
  { value: 4, label: "Số lượt xem trung bình mỗi LIVE" },
  { value: 5, label: "Tỷ lệ tương tác" },
  { value: 6, label: "Tỷ lệ hoa hồng trung bình" },
];

export const FOLLOWER_AGE_OPTIONS = [
  { value: [14, 24], label: "14 - 24" },
  { value: [25, 34], label: "25 - 34" },
  { value: [35, 44], label: "35 - 44" },
  { value: [44, 54], label: "44 - 54" },
  { value: [55], label: "Hơn 55" },
];

export const FOLLOWER_COUNT_OPTIONS = [
  { value: [0, 1000], label: "0 - 1,000" },
  { value: [1000, 10000], label: "1,000 - 10,000" },
  { value: [10000, 50000], label: "10,000 - 50,000" },
  { value: [50000, 100000], label: "50,000 - 100,000" },
  { value: [100000, 1000000], label: "100,000 - 1 triệu" },
  { value: [1000000, 1000000000], label: "1 triệu - 1 tỷ" },
  { value: [1000000000], label: "Trên 1 tỷ" },
];

export const FOLLOWER_GENDER_OPTIONS = [
  { value: "female", label: "Nữ (tỉ lệ nữ >50%)" },
  { value: "male", label: "Nam (tỉ lệ nam >50%)" },
];

export const PERFORMANCE_GMV_OPTIONS = [
  { value: [0, 1000000], label: "≤ 1 Triệu VNĐ" },
  { value: [1000000, 5000000], label: "1 - 5 Triệu VNĐ" },
  { value: [5000000, 10000000], label: "5 - 10 Triệu VNĐ" },
  { value: [10000000, 50000000], label: "10 - 50 Triệu VNĐ" },
  { value: [50000000, 100000000], label: "50 - 100 Triệu VNĐ" },
  { value: [100000000, 500000000], label: "100 - 500 Triệu VNĐ" },
  { value: [500000000, 1000000000], label: "500 Triệu - 1 Tỷ VNĐ" },
  { value: [1000000000, 10000000000], label: "1 - 10 Tỷ VNĐ" },
  { value: [10000000000], label: "≥ 10 Tỷ VNĐ" },
];

export const PERFORMANCE_PRODUCT_SOLD_OPTIONS = [
  { value: [0, 100], label: "0 - 100" },
  { value: [100, 1000], label: "100 - 1,000" },
  { value: [1000, 10000], label: "1,000 - 10,000" },
  { value: [10000, 100000], label: "10,000 - 100,000" },
  { value: [100000], label: "Hơn 100,000" },
];

export const PERFORMANCE_VIDEO_VIEW_OPTIONS = [
  { value: [0, 100], label: "0 - 100" },
  { value: [100, 1000], label: "100 - 1,000" },
  { value: [1000, 10000], label: "1,000 - 10,000" },
  { value: [10000, 100000], label: "10,000 - 100,000" },
  { value: [100000], label: "Hơn 100,000" },
];

export const PERFORMANCE_LIVE_VIEW_OPTIONS = [
  { value: [0, 100], label: "0 - 100" },
  { value: [100, 1000], label: "100 - 1,000" },
  { value: [1000, 10000], label: "1,000 - 10,000" },
  { value: [10000, 100000], label: "10,000 - 100,000" },
  { value: [100000], label: "Hơn 100,000" },
];

export const PERFORMANCE_ENGAGEMENT_OPTIONS = [
  { value: [0, 5], label: "0 - 5%" },
  { value: [5, 10], label: "5 - 10%" },
  { value: [10, 20], label: "10 - 20%" },
  { value: [20], label: "Hơn 20%" },
];
