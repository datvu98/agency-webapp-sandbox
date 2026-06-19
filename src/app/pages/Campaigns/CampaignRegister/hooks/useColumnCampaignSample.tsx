import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import {
  Avatar,
  Button,
  Dropdown,
  Flex,
  Image,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { MenuProps } from "antd/lib/menu";
import {
  EORDER_STATUS,
  ETYPE_PROCESS_STATUS,
  NA,
  ORDER_STATUS_META,
  REGISTER_SAMPLE_STATUS,
  STATUS_MAP,
  TYPE_PROCESS_STATUS_OPTIONS,
} from "app/pages/Campaigns/CampaignRegister/constants/constant";
import {
  CampaignSampleRequestItemModel,
  ECANCEL_BY,
  EORDER_BY_COLUMN,
  ESORT_DIRECTION,
  ICampaignJob,
} from "app/pages/Campaigns/CampaignRegister/types";
import CopyText from "app/pages/Campaigns/components/CopyText";
import {
  formatDate,
  getSubmissionDiff,
  getTimeDiff,
} from "app/pages/Campaigns/utils";
import KOCListVideo from "app/pages/Campaigns/components/KOCListVideo";
import React, { useCallback, useMemo, useState } from "react";

const { Text, Paragraph } = Typography;

// ─── Constants ───────────────────────────────────────────────────────────────

const ELLIPSIS_MAX_WIDTH = 200;

const NEED_PROCESS_ORDER_CANCEL_TOOLTIP =
  "Đơn đã bị hủy, vui lòng liên kết đơn mới ở màn chi tiết để quy trình được tiếp tục";

const STATUS_ICON_MAP: Record<string, React.ReactNode> = {
  [REGISTER_SAMPLE_STATUS.approved]: (
    <CheckCircleOutlined style={{ fontSize: 14, color: "#52c41a" }} />
  ),
  [REGISTER_SAMPLE_STATUS.rejected]: (
    <CloseCircleOutlined style={{ fontSize: 14, color: "#ff4d4f" }} />
  ),
  [REGISTER_SAMPLE_STATUS.pending]: (
    <ClockCircleOutlined style={{ fontSize: 14, color: "#faad14" }} />
  ),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const renderStatusIcon = (status?: string) =>
  STATUS_ICON_MAP[status ?? ""] ?? (
    <ClockCircleOutlined style={{ fontSize: 16, color: "#d9d9d9" }} />
  );

const renderEllipsisText = (
  value?: string | number | string[] | null,
  options?: { width?: number; type?: "secondary" },
  isCopyText?: boolean,
) => {
  const content = value == null || value === "" ? NA : String(value);
  return (
    <CopyText text={content} hideIcon={!isCopyText}>
      <Text
        type={options?.type}
        style={{
          maxWidth: options?.width ?? ELLIPSIS_MAX_WIDTH,
          display: "inline-block",
        }}
        ellipsis={{ tooltip: content }}
      >
        {content}
      </Text>
    </CopyText>
  );
};

const formatDateSafe = (date?: string) => {
  if (!date) return NA;
  const formatted = formatDate(date, "DD/MM/YYYY HH:mm");
  return formatted === "Invalid Date" ? NA : formatted;
};

const getEstimatedPostCountText = (r: ICampaignJob): string => {
  const video = r.videoCount ?? 0;
  const live = r.liveSessionCount ?? 0;
  return `Video: ${video}, Livestream: ${live}`;
};

const openCampaignJobDetail = (jobId: number) => {
  window.open(`/campaign-manage/job/${jobId}`, "_blank");
};

const renderDetailDropdown = (r: ICampaignJob) => {
  const items: MenuProps["items"] = [
    {
      key: "detail",
      label: "Xem chi tiết",
      onClick: () => openCampaignJobDetail(r.id),
    },
  ];

  return (
    <Dropdown trigger={["click"]} menu={{ items }}>
      <Button type="primary" ghost>
        Chọn
      </Button>
    </Dropdown>
  );
};

const getCancelByText = (r: ICampaignJob) => {
  const cancelBy = r.cancelBy ?? ECANCEL_BY.CREATOR;
  if (cancelBy === ECANCEL_BY.CREATOR) return "Hủy bởi nhà sáng tạo";
  if (cancelBy === ECANCEL_BY.AGENCY) return "Hủy bởi nhãn hàng";
  return NA;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

type CampaignSampleProductsCellProps = {
  rowId: number;
  items: CampaignSampleRequestItemModel[];
};

export const CampaignSampleProductsCell = ({
  rowId,
  items = [],
}: CampaignSampleProductsCellProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const visibleItems = isExpanded ? items : items.slice(0, 3);

  if (!items.length) return <Text type="secondary">{NA}</Text>;

  return (
    <Flex vertical gap={8}>
      {visibleItems.map((item, index) => (
        <Flex
          key={String(item.id ?? `${rowId}-${index}`)}
          align="flex-start"
          gap={10}
          style={{ minHeight: 50 }}
        >
          <Image
            src={item.variantImage}
            alt="image"
            width={50}
            height={50}
            style={{ borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
          />
          <Flex vertical gap={2}>
            <Flex align="center" gap={4}>
              <Text
                strong
                style={{ fontSize: 13, maxWidth: 170 }}
                ellipsis={{ tooltip: item.productName || NA }}
              >
                {item.productName || NA}
              </Text>
              {item.status !== REGISTER_SAMPLE_STATUS.pending && (
                <Tooltip title={STATUS_MAP[item.status ?? ""]?.tooltip}>
                  {renderStatusIcon(item.status)}
                </Tooltip>
              )}
            </Flex>
            <Text
              type="secondary"
              style={{ fontSize: 12, maxWidth: 170 }}
              ellipsis={{ tooltip: `SKU: ${item.variantSku ?? "--"}` }}
            >
              SKU: {item.variantSku ?? "--"}
            </Text>
            <Text
              style={{ fontSize: 12, color: "#999", maxWidth: 170 }}
              ellipsis={{
                tooltip: `Phân loại: ${item.variantName ?? "--"}, SL: ${
                  item.quantityPurchased ?? "--"
                }`,
              }}
            >
              Phân loại: {item.variantName ?? "--"}, SL:{" "}
              {item.quantityPurchased ?? "--"}
            </Text>
          </Flex>
        </Flex>
      ))}
      {items.length > 3 && (
        <Button
          type="link"
          style={{
            padding: 0,
            alignSelf: "flex-start",
            height: "auto",
            fontSize: 12,
          }}
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? "Thu gọn" : `Xem thêm (${items.length - 3})`}
        </Button>
      )}
    </Flex>
  );
};

const RequestTypeTags = ({ r }: { r: ICampaignJob }) => {  
  const showLive = (r.liveSessionCount ?? 0) > 0;
  const showVideo = (r.videoCount ?? 0) > 0;
  if (!showLive && !showVideo) return <>{NA}</>;
  return (
    <Flex align="flex-start" wrap="wrap">
      {showLive && <RoundedTag>Live</RoundedTag>}
      {showVideo && <RoundedTag>Video</RoundedTag>}
    </Flex>
  );
};

const RoundedTag = ({ children }: { children: React.ReactNode }) => (
  <Tag style={{ borderRadius: 16, padding: "2px 8px", width: "min-content" }}>
    {children}
  </Tag>
);

const CategoryTags = ({ categories }: { categories: string[] }) => {
  if (!categories.length) return <Text type="secondary">{NA}</Text>;
  return (
    <Flex wrap="wrap" gap={4}>
      {categories.map((c) => (
        <RoundedTag>
          <Text
            ellipsis={{ tooltip: c }}
            style={{ maxWidth: 130, fontSize: 12 }}
          >
            {c}
          </Text>
        </RoundedTag>
      ))}
    </Flex>
  );
};

const ActionDropdown = ({
  r,
  onApprove,
  onReject,
}: {
  r: ICampaignJob;
  onApprove: () => void;
  onReject: () => void;
}) => {
  const items = [
    {
      key: "detail",
      label: "Xem chi tiết",
      onClick: () => openCampaignJobDetail(r.id),
    },
    {
      key: "approve",
      label: "Duyệt",
      onClick: () => onApprove(),
    },
    {
      key: "reject",
      label: "Từ chối",
      onClick: () => onReject(),
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={["click"]}>
      <Button type="primary" ghost>
        Chọn
      </Button>
    </Dropdown>
  );
};

const renderAllTabAction = (
  r: ICampaignJob,
  onApprove: (row: ICampaignJob) => void,
  onReject: (row: ICampaignJob) => void,
  onApproveScript?: (row: ICampaignJob) => void,
  onApproveAcceptance?: (row: ICampaignJob) => void,
) => {
  if (r.status === ETYPE_PROCESS_STATUS.CANCELLED) return null;

  if (r.status === ETYPE_PROCESS_STATUS.PENDING) {
    return (
      <ActionDropdown
        r={r}
        onApprove={() => onApprove(r)}
        onReject={() => onReject(r)}
      />
    );
  }

  const menuItems: MenuProps["items"] = [
    {
      key: "detail",
      label: "Xem chi tiết",
      onClick: () => openCampaignJobDetail(r.id),
    },
  ];

  if (r.status === ETYPE_PROCESS_STATUS.PENDING_REVIEW) {
    menuItems.push({
      key: "approveScript",
      label: "Duyệt demo",
      onClick: () => {
        if (onApproveScript) {
          onApproveScript(r);
          return;
        }
      },
    });
  }

  if (r.status === ETYPE_PROCESS_STATUS.PENDING_ACCEPTANCE) {
    menuItems.push({
      key: "approveAcceptance",
      label: "Nghiệm thu",
      onClick: () => {
        if (onApproveAcceptance) {
          onApproveAcceptance(r);
          return;
        }
      },
    });
  }

  return (
    <Dropdown trigger={["click"]} menu={{ items: menuItems }}>
      <Button type="primary" ghost>
        Chọn
      </Button>
    </Dropdown>
  );
};

// ─── Column builders ──────────────────────────────────────────────────────────

type ColBuilder = (
  handleApproveRow: (r: ICampaignJob) => void,
  handleRejectRow: (r: ICampaignJob) => void,
  handleApproveScriptRow?: (r: ICampaignJob) => void,
  handleApproveAcceptanceRow?: (r: ICampaignJob) => void,
) => TableColumnsType<ICampaignJob>;

const renderCreatorChannelCell = (
  r: ICampaignJob,
  options?: {
    enablePreShippingCancelHint?: boolean;
    onUsernameClick?: (r: ICampaignJob) => void;
  },
) => {
  const req = r.campaignSampleRequest;
  const name = req?.creatorChannelName || NA;
  const username = req?.creatorChannelUsername || NA;
  const showPreShippingCancelHint =
    Boolean(options?.enablePreShippingCancelHint) &&
    Boolean(r.isPreShippingCancel);

  return (
    <Flex align="center" gap={10} style={{ height: 60 }}>
      <Avatar size={36} style={{ flexShrink: 0, backgroundColor: "#1677ff" }}>
        {username.charAt(0).toUpperCase()}
      </Avatar>
      <Flex vertical align="flex-start" style={{ minWidth: 0, flex: 1 }}>
        <Flex align="center" gap={6} style={{ maxWidth: "100%" }}>
          <Text
            strong
            style={{ maxWidth: showPreShippingCancelHint ? 120 : 140 }}
            ellipsis={{ tooltip: name }}
          >
            {name}
          </Text>
          {showPreShippingCancelHint && (
            <Tooltip title={NEED_PROCESS_ORDER_CANCEL_TOOLTIP}>
              <InfoCircleOutlined
                style={{ fontSize: 14, color: "#ff4d4f", flexShrink: 0 }}
              />
            </Tooltip>
          )}
        </Flex>
        <span
          style={{ fontSize: 12, cursor: "pointer", maxWidth: 140 }}
          onClick={(e) => {
            e.stopPropagation();
            if (options?.onUsernameClick) {
              options.onUsernameClick(r);
            } else if (req?.urlCreatorChannel) {
              window.open(req.urlCreatorChannel, "_blank");
            }
          }}
        >
          <CopyText text={`${username}`} hideIcon={false}>
            <Text
              style={{ maxWidth: 140, color: "#006aff" }}
              ellipsis={{ tooltip: `${username}` }}
            >
              {username}
            </Text>
          </CopyText>
        </span>
      </Flex>
    </Flex>
  );
};

const patchCreatorColumn = (
  cols: TableColumnsType<ICampaignJob>,
  onUsernameClick: (r: ICampaignJob) => void,
): TableColumnsType<ICampaignJob> =>
  cols.map((col) => {
    if (col.key !== "creatorChannelName") return col;
    const enableHint = Boolean((col as any)._hint);
    return {
      ...col,
      render: (_: unknown, r: ICampaignJob) =>
        renderCreatorChannelCell(r, {
          enablePreShippingCancelHint: enableHint,
          onUsernameClick,
        }),
    };
  });

const creatorColumn: TableColumnsType<ICampaignJob>[number] & { _hint?: boolean } = {
  title: "Nhà sáng tạo",
  dataIndex: "creatorChannelName",
  key: "creatorChannelName",
  fixed: "left",
  _hint: false,
  render: (_: unknown, r: ICampaignJob) => renderCreatorChannelCell(r),
};

/** Chờ gửi hàng / Cần xử lý: icon cảnh báo khi row có isPreShippingCancel */
const creatorColumnWithPreShippingCancelHint: TableColumnsType<ICampaignJob>[number] & { _hint?: boolean } =
  {
    ...creatorColumn,
    _hint: true,
    render: (_: unknown, r: ICampaignJob) =>
      renderCreatorChannelCell(r, { enablePreShippingCancelHint: true }),
  };

const productColumn: TableColumnsType<ICampaignJob>[number] = {
  title: "Sản phẩm đăng ký",
  key: "product",
  width: 310,
  render: (_: unknown, r: ICampaignJob) => (
    <CampaignSampleProductsCell
      rowId={r.id}
      items={r.campaignSampleRequest?.items ?? []}
    />
  ),
};

const requestTypeColumn: TableColumnsType<ICampaignJob>[number] = {
  title: "Hình thức quảng cáo",
  key: "requestType",
  width: 170,
  render: (_: unknown, r: ICampaignJob) => <RequestTypeTags r={r} />,
};

const buildRegistrationDateColumn =
  (): TableColumnsType<ICampaignJob>[number] => ({
    title: "Thời gian đăng ký",
    key: EORDER_BY_COLUMN.CREATED_AT,
    sorter: true,
    width: 170,
    render: (_: unknown, r: ICampaignJob) =>
      formatDateSafe(r.campaignSampleRequest?.createdAt),
  });

const followCountColumn: TableColumnsType<ICampaignJob>[number] = {
  title: "Lượt theo dõi",
  key: "followCount",
  width: 130,
  render: (_: unknown, r: ICampaignJob) => {
    const val = r.campaignSampleRequest?.followCount;
    return val != null ? val.toLocaleString("vi-VN") : NA;
  },
};

const gmvColumn: TableColumnsType<ICampaignJob>[number] = {
  title: (<Flex align="center" gap={4}><span>GMV</span><Tooltip title="Đối với nhà sáng tạo ẩn dữ liệu, GMV được ước tính (ký hiệu '~') bằng Số món bán × GMV trung bình từ mỗi khách hàng"><InfoCircleOutlined /></Tooltip></Flex>),
  key: "gmv",
  width: 200,
  render: (_: unknown, r: ICampaignJob) => {
    const val = r.campaignSampleRequest?.gmv;
    return val != null
      ? val.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
      : NA;
  },
};

const soldCountColumn: TableColumnsType<ICampaignJob>[number] = {
  title: "Số món bán ra",
  key: "soldCount",
  width: 130,
  render: (_: unknown, r: ICampaignJob) =>
    r.campaignSampleRequest?.soldCount ?? NA,
};

const avgVideoViewsColumn: TableColumnsType<ICampaignJob>[number] = {
  title: "Lượt xem video trung bình",
  key: "avgVideoViews",
  width: 190,
  render: (_: unknown, r: ICampaignJob) => {
    const val = r.campaignSampleRequest?.avgVideoViews;
    return val != null ? val.toLocaleString("vi-VN") : NA;
  },
};

const avgVideoViewsShortColumn: TableColumnsType<ICampaignJob>[number] = {
  ...avgVideoViewsColumn,
  title: "Lượt xem video TB",
  width: 150,
};

const engagementRateColumn: TableColumnsType<ICampaignJob>[number] = {
  title: "Tỷ lệ tương tác",
  key: "engagementRate",
  width: 140,
  render: (_: unknown, r: ICampaignJob) => {
    const val = r.campaignSampleRequest?.engagementRate;
    return val != null ? `${val}%` : NA;
  },
};

const categoryColumn: TableColumnsType<ICampaignJob>[number] = {
  title: "Lĩnh vực",
  key: "category",
  width: 200,
  render: (_: unknown, r: ICampaignJob) => {
    const categories = r.campaignSampleRequest?.category ?? [];
    if (!categories.length) return <Text type="secondary">{NA}</Text>;
    return <CategoryTags categories={categories} />;
  },
};

const buildEstimatedPostCountColumn = (
  width = 240,
): TableColumnsType<ICampaignJob>[number] => ({
  title: "Số lượng bài đăng cam kết",
  key: "estimatedPostCount",
  width,
  render: (_: unknown, r: ICampaignJob) => getEstimatedPostCountText(r),
});

const buildOrderIdColumn = (
  width = 160,
): TableColumnsType<ICampaignJob>[number] => ({
  title: "Mã đơn hàng",
  key: "orderId",
  width,
  render: (_: unknown, r: ICampaignJob) =>
    renderEllipsisText(
      r.campaignSampleRequest?.order?.ref_id ?? NA,
      { width: 140 },
      true,
    ),
});
const orderStatusColumn: TableColumnsType<ICampaignJob>[number] = {
  title: "Trạng thái đơn",
  key: "order.status",
  width: 150,
  render: (_: unknown, r: ICampaignJob) => {
    const order = r.campaignSampleRequest?.order;
    if (!order) return NA;

    const packStatus =
      order.status === EORDER_STATUS.PENDING
        ? EORDER_STATUS.PENDING
        : order.logisticsPackages?.[0]?.pack_status ?? order.status;

    if (!packStatus) return NA;

    const statusText = ORDER_STATUS_META[packStatus];

    return statusText ? <RoundedTag>{statusText?.name}</RoundedTag> : NA;
  },
};

const shippingInfoColumn: TableColumnsType<ICampaignJob>[number] = {
  title: "Vận chuyển",
  key: "logisticsPackages",
  width: 240,
  render: (_: unknown, r: ICampaignJob) => {
    const packages = r.campaignSampleRequest?.order?.logisticsPackages ?? [];
    if (!packages.length) return NA;

    const carriers = Array.from(
      new Set(
        packages
          .map((item) => item.shipping_carrier)
          .filter((value): value is string => Boolean(value)),
      ),
    );
    const trackingNumbers = Array.from(
      new Set(
        packages
          .map((item) => item.tracking_number)
          .filter((value): value is string => Boolean(value)),
      ),
    );

    return (
      <Flex vertical gap={2}>
        <Text
          style={{ maxWidth: 220 }}
          ellipsis={{ tooltip: carriers.join(", ") }}
        >
          DVVC: {carriers.join(", ") || NA}
        </Text>
        <Text
          style={{ maxWidth: 220 }}
          ellipsis={{ tooltip: trackingNumbers.join(", ") }}
        >
          Mã vận đơn: {trackingNumbers.join(", ") || NA}
        </Text>
      </Flex>
    );
  },
};

const approvedAtColumn: TableColumnsType<ICampaignJob>[number] = {
  title: "Thời gian duyệt",
  key: "approvedAt",
  width: 180,
  sorter: true,
  render: (_: unknown, r: ICampaignJob) => formatDateSafe(r.approvedAt),
};

const buildDetailActionColumn = (
  width = 100,
  fixed: "left" | "right" = "right",
): TableColumnsType<ICampaignJob>[number] => ({
  title: "Thao tác",
  key: "action",
  width,
  align: "center",
  fixed,
  render: (_: unknown, r: ICampaignJob) => renderDetailDropdown(r),
});

// cột tất cả
const buildAllTabColumns: ColBuilder = (
  handleApproveRow,
  handleRejectRow,
  handleApproveScriptRow,
  handleApproveAcceptanceRow,
) => [
  creatorColumn,
  {
    title: "Tiến độ",
    width: 180,
    render: (_: unknown, r: ICampaignJob) => {
      const label = TYPE_PROCESS_STATUS_OPTIONS.find(
        (item) => item.value === r.status,
      );
      return <Text>{label?.label ?? NA}</Text>;
    },
  },
  productColumn,
  requestTypeColumn,
  {
    title: "Số lượng bài đăng cam kết",
    key: "videoCount",
    width: 210,
    render: (_: unknown, r: ICampaignJob) => {
      if (r.status === ETYPE_PROCESS_STATUS.CANCELLED) return NA;
      return getEstimatedPostCountText(r);
    },
  },
  { ...buildRegistrationDateColumn(), width: 170 },
  {
    title: "Mã đơn hàng",
    key: "order.ref_id",
    width: 150,
    render: (_: unknown, r: ICampaignJob) => {
      const order = r.campaignSampleRequest?.order;
      return renderEllipsisText(order?.ref_id ?? NA, { width: 140 }, true);
    },
  },
  orderStatusColumn,
  shippingInfoColumn,
  {
    title: "Thao tác",
    key: "action",
    width: 160,
    align: "center",
    fixed: "right",
    render: (_: unknown, r: ICampaignJob) =>
      renderAllTabAction(
        r,
        handleApproveRow,
        handleRejectRow,
        handleApproveScriptRow,
        handleApproveAcceptanceRow,
      ),
  },
];

// chờ duyệt
const buildPendingTabColumns: ColBuilder = (
  handleApproveRow,
  handleRejectRow,
) => [
  creatorColumn,
  productColumn,
  requestTypeColumn,
  buildEstimatedPostCountColumn(210),
  followCountColumn,
  gmvColumn,
  soldCountColumn,
  avgVideoViewsColumn,
  engagementRateColumn,
  categoryColumn,
  buildRegistrationDateColumn(),
  {
    title: "Thao tác",
    key: "action",
    width: 170,
    align: "center",
    fixed: "right",
    render: (_: unknown, r: ICampaignJob) => (
      <ActionDropdown
        r={r}
        onApprove={() => handleApproveRow(r)}
        onReject={() => handleRejectRow(r)}
      />
    ),
  },
];

const buildPendingShipmentTabColumns = (): TableColumnsType<ICampaignJob> => [
  creatorColumnWithPreShippingCancelHint,
  productColumn,
  requestTypeColumn,
  buildEstimatedPostCountColumn(),
  buildOrderIdColumn(),
  orderStatusColumn,
  shippingInfoColumn,
  approvedAtColumn,
  buildDetailActionColumn(100, "right"),
];

// cần xử lý (icon cảnh báo theo isPreShippingCancel trên từng row)
const buildNeedProcessTabColumns = (): TableColumnsType<ICampaignJob> => [
  creatorColumnWithPreShippingCancelHint,
  productColumn,
  requestTypeColumn,
  buildEstimatedPostCountColumn(),
  buildOrderIdColumn(),
  orderStatusColumn,
  shippingInfoColumn,
  approvedAtColumn,
  buildDetailActionColumn(100, "right"),
];

// đang gửi hàng
const buildShippingInProgressTabColumns =
  (): TableColumnsType<ICampaignJob> => [
    creatorColumn,
    productColumn,
    requestTypeColumn,
    buildEstimatedPostCountColumn(),
    buildOrderIdColumn(),
    orderStatusColumn,
    shippingInfoColumn,
    approvedAtColumn,
    buildDetailActionColumn(),
  ];

// chờ lên bài
const buildPendingPostingTabColumns = (): TableColumnsType<ICampaignJob> => [
  creatorColumn,
  productColumn,
  requestTypeColumn,
  buildEstimatedPostCountColumn(),
  {
    title: "Số lượng bài đăng đã duyệt",
    key: "videoApprovedDemoCount",
    width: 220,
    render: (_: unknown, r: ICampaignJob) => {
      return `${r.videoApprovedDemoCount ?? NA}/${r.videoCount ?? NA} video`;
    },
  },
  {
    title: "Hạn gửi demo",
    key: "videoDeadline",
    dataIndex: "videoDeadline",
    sorter: true,
    width: 180,
    render: (_: unknown, r: ICampaignJob) => {
      const result = getTimeDiff(r.videoDeadline);

      if (!result) return NA;
      return (
        <Flex vertical>
          <Text>{result.dateFormat}</Text>
          <Text style={{ fontSize: 12, color: result.color }}>
            {result.formatted}
          </Text>
        </Flex>
      );
    },
  },
  buildOrderIdColumn(), 
  buildDetailActionColumn(),
];

// chờ duyệt demo
const buildPendingReviewTabColumns = (
  onApproveScript?: (row: ICampaignJob) => void,
): TableColumnsType<ICampaignJob> => [
  creatorColumn,
  productColumn,
  requestTypeColumn,
  buildEstimatedPostCountColumn(),
  {
    title: "Số lượng bài đăng đã duyệt",
    key: "videoApprovedDemoCount",
    dataIndex: "videoApprovedDemoCount",
    width: 220,
    render: (_: unknown, r: ICampaignJob) => {
      return `${r.videoApprovedDemoCount ?? NA}/${r.videoCount ?? NA} video`;
    },
  },
  {
    title: "Thời gian gửi demo",
    key: "demoSubmittedAt",
    dataIndex: "demoSubmittedAt",
    width: 170,
    render: (_: unknown, r: ICampaignJob) => {
      const result = getSubmissionDiff(r.videoDeadline, r.demoSubmittedAt);

      return (
        <div>
          <div>{formatDateSafe(r.demoSubmittedAt)}</div>

          <div style={{ marginTop: 4 }}>
            {result ? (
              <Tooltip
                title={
                  result.isLate
                    ? `Hạn: ${result.deadline.format("DD/MM/YYYY")} - Quá ${
                        result.days
                      } ngày`
                    : `Hạn: ${result.deadline.format("DD/MM/YYYY")} - Sớm ${
                        result.days
                      } ngày`
                }
              >
                <span>
                  <RoundedTag>
                    {result.isLate ? "Quá hạn" : "Đúng hạn"}
                  </RoundedTag>
                </span>
              </Tooltip>
            ) : (
              NA
            )}
          </div>
        </div>
      );
    },
  },
  // {
  //   title: "Hạn gửi demo",
  //   key: "videoDeadline",
  //   sorter: true,
  //   dataIndex: "videoDeadline",
  //   width: 170,
  //   render: (_: unknown, r: ICampaignJob) => {
  //     const result = getSubmissionDiff(r.videoDeadline, r.demoSubmittedAt);
  //     if (!result) return NA;

  //     const isLate = result.isLate;
  //     const days = result.days;

  //     const statusText = isLate ? "Quá hạn" : "Đúng hạn";

  //     const tooltip = isLate
  //       ? `Hạn: ${result.deadline.format("DD/MM/YYYY")} - Quá ${days} ngày`
  //       : `Hạn: ${result.deadline.format("DD/MM/YYYY")} - Sớm ${days} ngày`;

  //     return (
  //       <Tooltip title={tooltip}>
  //         <RoundedTag>{statusText}</RoundedTag>
  //       </Tooltip>
  //     );
  //   },
  // },
  buildOrderIdColumn(),
  {
    title: "Thao tác",
    key: "action",
    width: 130,
    align: "center",
    fixed: "right",
    render: (_: unknown, r: ICampaignJob) => {
      const items: MenuProps["items"] = [
        {
          key: "detail",
          label: "Xem chi tiết",
          onClick: () => openCampaignJobDetail(r.id),
        },
        {
          key: "approveScript",
          label: "Duyệt demo",
          onClick: () => {
            if (onApproveScript) {
              onApproveScript(r);
              return;
            }
          },
        },
      ];

      return (
        <Dropdown trigger={["click"]} menu={{ items }}>
          <Button type="primary" ghost>
            Chọn
          </Button>
        </Dropdown>
      );
    },
  },
];

// chờ đăng bài
const buildPendingAiringTabColumns = (): TableColumnsType<ICampaignJob> => [
  creatorColumn,
  productColumn,
  requestTypeColumn,
  buildEstimatedPostCountColumn(),
  {
    title: "Số lượng bài đăng đã nghiệm thu",
    key: "videoApprovedPostCount",
    width: 250,
    render: (_: unknown, r: ICampaignJob) => {
      const videoApproved = r.videoApprovedPostCount ?? NA;
      const videoTotal = r.videoCount ?? NA;
      const liveApproved = r.liveApprovedPostCount ?? NA;
      const liveTotal = r.liveSessionCount ?? NA;

      return `${videoApproved}/${videoTotal} video, ${liveApproved}/${liveTotal} livestream`;
    },
  },
  {
    title: "Hạn đăng bài",
    key: "postDeadline",
    sorter: true,
    width: 170,
    render: (_: unknown, r: ICampaignJob) => {
      const result = getTimeDiff(r.postDeadline);

      if (!result) return NA;
      return (
        <Flex vertical>
          <Text>{result.dateFormat}</Text>
          <Text style={{ fontSize: 12, color: result.color }}>{result.formatted}</Text>
        </Flex>
      );
    },
  },
  buildOrderIdColumn(),
  buildDetailActionColumn(),
];

// chờ nghiệm thu
const buildPendingAcceptanceTabColumns = (
  onApproveAcceptance?: (row: ICampaignJob) => void,
): TableColumnsType<ICampaignJob> => [
  creatorColumn,
  productColumn,
  requestTypeColumn,
  buildEstimatedPostCountColumn(),
  {
    title: "Số lượng bài đăng đã nghiệm thu",
    key: "videoApprovedPostCount",
    width: 250,
    render: (_: unknown, r: ICampaignJob) => {
      const videoApproved = r.videoApprovedPostCount ?? NA;
      const videoTotal = r.videoCount ?? NA;
      const liveApproved = r.liveApprovedPostCount ?? NA;
      const liveTotal = r.liveSessionCount ?? NA;

      return `${videoApproved}/${videoTotal} video, ${liveApproved}/${liveTotal} livestream`;
    },
  },
  {
    title: "Thời gian gửi nghiệm thu",
    key: "postSubmittedAt",
    dataIndex: "postSubmittedAt",
    sorter: true,
    width: 170,
    render: (_: unknown, r: ICampaignJob) => {
      const result = getSubmissionDiff(r.postDeadline, r.postSubmittedAt);

      return (
        <div>
          <div>{formatDateSafe(r.postSubmittedAt)}</div>

          <div style={{ marginTop: 4 }}>
            {result ? (
              <Tooltip
                title={
                  result.isLate
                    ? `Hạn: ${result.deadline.format("DD/MM/YYYY")} - Quá ${
                        result.days
                      } ngày`
                    : `Hạn: ${result.deadline.format("DD/MM/YYYY")} - Sớm ${
                        result.days
                      } ngày`
                }
              >
                <span>
                  <RoundedTag>
                    {result.isLate ? "Quá hạn" : "Đúng hạn"}
                  </RoundedTag>
                </span>
              </Tooltip>
            ) : (
              NA
            )}
          </div>
        </div>
      );
    },
  },
  // {
  //   title: "Hạn đăng bài",
  //   key: "postDeadline",
  //   sorter: true,
  //   width: 170,
  //   render: (_: unknown, r: ICampaignJob) => {
  //     const result = getSubmissionDiff(r.postDeadline, r.postSubmittedAt);

  //     if (!result) return NA;
  //     const statusText = result.isLate ? "Quá hạn" : "Đúng hạn";
  //     const tooltip = result.isLate
  //       ? `Hạn: ${result.deadline.format("DD/MM/YYYY")} - Quá ${
  //           result.days
  //         } ngày`
  //       : `Hạn: ${result.deadline.format("DD/MM/YYYY")} - Sớm ${
  //           result.days
  //         } ngày`;
  //     return (
  //       <Tooltip title={tooltip}>
  //         <RoundedTag>{statusText}</RoundedTag>
  //       </Tooltip>
  //     );
  //   },
  // },
  buildOrderIdColumn(),
  {
    title: "Thao tác",
    key: "action",
    width: 150,
    align: "center",
    fixed: "right",
    render: (_: unknown, r: ICampaignJob) => {
      const items = [
        {
          key: "detail",
          label: "Xem chi tiết",
          onClick: () => openCampaignJobDetail(r.id),
        },
        {
          key: "approveAcceptance",
          label: "Nghiệm thu",
          onClick: () => {
            if (onApproveAcceptance) {
              onApproveAcceptance(r);
              return;
            }
            openCampaignJobDetail(r.id);
          },
        },
      ];

      return (
        <Dropdown trigger={["click"]} menu={{ items }}>
          <Button type="primary" ghost>
            Chọn
          </Button>
        </Dropdown>
      );
    },
  },
];

const buildCompletedTabColumns = (): TableColumnsType<ICampaignJob> => [
  creatorColumn,
  productColumn,
  requestTypeColumn,
  buildOrderIdColumn(),
  { ...buildRegistrationDateColumn(), width: 170 },
  buildDetailActionColumn(),
];

const buildCancelledTabColumns = (): TableColumnsType<ICampaignJob> => [
  creatorColumn,
  productColumn,
  requestTypeColumn,
  // {
  //   title: "Hủy bởi",
  //   key: "cancelBy",
  //   width: 180,
  //   sorter: true,
  //   render: (_: unknown, r: ICampaignJob) => getCancelByText(r),
  // },
  {
    title: "Lý do hủy",
    key: "cancelReason",
    width: 240,
    render: (_: unknown, r: ICampaignJob) =>
      renderEllipsisText(r.cancelReason, { width: 220 }),
  },
  { ...buildRegistrationDateColumn(), width: 170 },
  {
    title: "Thời gian huỷ",
    dataIndex: "cancelAt",
    key: "cancelAt",
    width: 170,
    sorter: true,
    render: (value: string) => formatDateSafe(value),
  },

  buildDetailActionColumn(),
];

// ─── Cross-page row selection (bảng đăng ký mẫu + phân trang) ───────────────

export const getCampaignRegisterSampleRowKey = (record: ICampaignJob): string =>
  String(record.campaignSampleRequest?.id ?? record.id);

/** Cập nhật map dòng đã chọn khi `onChange` selection: giữ dòng các trang khác, gộp dòng trang hiện tại. */
export function mergeCampaignRegisterSampleSelectedRowsByKey(
  prev: Map<string, ICampaignJob>,
  selectedRowKeys: React.Key[],
  rowsFromChange: ICampaignJob[],
): Map<string, ICampaignJob> {
  const keySet = new Set(selectedRowKeys.map(String));
  const next = new Map(prev);
  for (const k of [...next.keys()]) {
    if (!keySet.has(k)) next.delete(k);
  }
  for (const row of rowsFromChange) {
    next.set(getCampaignRegisterSampleRowKey(row), row);
  }
  return next;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/** `subTab=pending` (tab Chờ duyệt): bảng đăng ký mẫu bật cột checkbox và bulk duyệt/từ chối. */
export const isCampaignRegisterSamplePendingSubTab = (
  currentStatus: ETYPE_PROCESS_STATUS,
): boolean => currentStatus === ETYPE_PROCESS_STATUS.PENDING;

export const useColumnCampaignSample = (
  handleApproveRow: (r: ICampaignJob) => void,
  handleRejectRow: (r: ICampaignJob) => void,
  handleApproveScriptRow?: (r: ICampaignJob) => void,
  handleApproveAcceptanceRow?: (r: ICampaignJob) => void,
  status: ETYPE_PROCESS_STATUS[] = [ETYPE_PROCESS_STATUS.PENDING],
  sort?: {
    column?: EORDER_BY_COLUMN;
    direction?: ESORT_DIRECTION;
  },
) => {
  const [kocVideoRecord, setKocVideoRecord] = useState<ICampaignJob | null>(null);

  const handleUsernameClick = useCallback((r: ICampaignJob) => {
    setKocVideoRecord(r);
  }, []);

  const columns = useMemo<TableColumnsType<ICampaignJob>>(() => {
    const isAllTab = status.includes(ETYPE_PROCESS_STATUS.ALL);
    const isPendingTab =
      status.length === 1 && status[0] === ETYPE_PROCESS_STATUS.PENDING;
    const isPendingShipmentTab =
      status.length === 1 &&
      status[0] === ETYPE_PROCESS_STATUS.PENDING_SHIPMENT;
    const isNeedProcessTab =
      status.length === 1 && status[0] === ETYPE_PROCESS_STATUS.NEED_PROCESS;
    const isShippingInProgressTab =
      status.length === 1 &&
      status[0] === ETYPE_PROCESS_STATUS.SHIPPING_IN_PROGRESS;
    const isPendingPostingTab =
      status.length === 1 && status[0] === ETYPE_PROCESS_STATUS.PENDING_POSTING;
    const isPendingReviewTab =
      status.length === 1 && status[0] === ETYPE_PROCESS_STATUS.PENDING_REVIEW;
    const isPendingAiringTab =
      status.length === 1 && status[0] === ETYPE_PROCESS_STATUS.PENDING_AIRING;
    const isPendingAcceptanceTab =
      status.length === 1 &&
      status[0] === ETYPE_PROCESS_STATUS.PENDING_ACCEPTANCE;
    const isCompletedTab =
      status.length === 1 && status[0] === ETYPE_PROCESS_STATUS.COMPLETED;
    const isCancelledTab =
      status.length === 1 && status[0] === ETYPE_PROCESS_STATUS.CANCELLED;

    let rawCols: TableColumnsType<ICampaignJob>;
    if (isAllTab)
      rawCols = buildAllTabColumns(
        handleApproveRow,
        handleRejectRow,
        handleApproveScriptRow,
        handleApproveAcceptanceRow,
      );
    else if (isPendingTab)
      rawCols = buildPendingTabColumns(handleApproveRow, handleRejectRow);
    else if (isPendingShipmentTab) rawCols = buildPendingShipmentTabColumns();
    else if (isNeedProcessTab) rawCols = buildNeedProcessTabColumns();
    else if (isShippingInProgressTab) rawCols = buildShippingInProgressTabColumns();
    else if (isPendingPostingTab) rawCols = buildPendingPostingTabColumns();
    else if (isPendingReviewTab)
      rawCols = buildPendingReviewTabColumns(handleApproveScriptRow);
    else if (isPendingAiringTab) rawCols = buildPendingAiringTabColumns();
    else if (isPendingAcceptanceTab)
      rawCols = buildPendingAcceptanceTabColumns(handleApproveAcceptanceRow);
    else if (isCompletedTab) rawCols = buildCompletedTabColumns();
    else if (isCancelledTab) rawCols = buildCancelledTabColumns();
    else
      rawCols = buildAllTabColumns(
        handleApproveRow,
        handleRejectRow,
        handleApproveScriptRow,
        handleApproveAcceptanceRow,
      );

    return patchCreatorColumn(rawCols, handleUsernameClick);
  }, [
    handleApproveRow,
    handleRejectRow,
    handleApproveScriptRow,
    handleApproveAcceptanceRow,
    handleUsernameClick,
    status,
    sort?.column,
    sort?.direction,
  ]);

  const kocListVideoNode = (
    <KOCListVideo
      open={kocVideoRecord != null}
      onCancel={() => setKocVideoRecord(null)}
      creatorId={kocVideoRecord?.creatorId ?? kocVideoRecord?.campaignSampleRequest?.creatorId}
    />
  );

  return { columns, kocListVideoNode };
};
