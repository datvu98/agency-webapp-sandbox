import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import queryString from "querystring";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ActionDropdown from "./ActionDropdown";

interface Record {
  id: number;
  code: string;
  status: string;
  warehouseName: string;
  sessionCount: number;
  assignedTo: string;
  totalLocationRequest: number;
  totalLocationCounted: number;
  totalSkuRequest: number;
  totalSkuCounted: number;
  avgDiff: number;
  totalAnomalyCount: number;
  startedAt: string;
  endedAt: string;
  createdAt: string;
  allSessionsEnded: boolean;
  createdById:number
}

interface Props {
  records: Record[];
  loading: boolean;
  activeTab: string;
  page: number;
  limit: number;
  total: number;
  onRefetch: () => void;
}

const formatDate = (v?: string) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—");

const baseColumns = (onRefetch: () => void, activeTab: string): ColumnsType<Record> => [
  {
    title: "Mã KK",
    dataIndex: "code",
    key: "code",
  },
  {
    title: "Kho",
    dataIndex: "warehouseName",
    key: "warehouseName",
  },
  {
    title: "Ngày tạo",
    dataIndex: "createdAt",
    key: "createdAt",
    render: formatDate,
  },
  {
    title: "Tổng vị trí",
    dataIndex: "totalLocationRequest",
    key: "totalLocationRequest",
  },
  {
    title: "SL hàng hoá",
    dataIndex: "totalSkuRequest",
    key: "totalSkuRequest",
  },
  {
    title: "Nhân viên",
    dataIndex: "assignedTo",
    key: "assignedTo",
    render: (item, record) => {
      return record?.createdById ?? "—"
    },
  },
  {
    title: "Thao tác",
    key: "action",
    render: (_: any, record: Record) => (
      <ActionDropdown record={record} activeTab={activeTab} onRefetch={onRefetch} />
    ),
  },
];

const countingExtraColumns: ColumnsType<Record> = [
  {
    title: "Thời gian bắt đầu",
    dataIndex: "startedAt",
    key: "startedAt",
    render: formatDate,
  },
  {
    title: "TG kết thúc",
    dataIndex: "endedAt",
    key: "endedAt",
    render: formatDate,
  },
  {
    title: "Lệch",
    dataIndex: "avgDiff",
    key: "avgDiff",
    render: (v?: number) => (v !== undefined ? v : "—"),
  },
];

const lateExtraColumns: ColumnsType<Record> = [
  {
    title: "Vị trí KK",
    key: "location",
    render: (_: any, r: Record) => (
      <span>
        <span
          style={{
            color: r.totalLocationCounted < r.totalLocationRequest ? "#ff4d4f" : undefined,
          }}
        >
          {r.totalLocationCounted}
        </span>
        /{r.totalLocationRequest}
      </span>
    ),
  },
  {
    title: "SL hàng hoá",
    key: "sku",
    render: (_: any, r: Record) => (
      <span>
        <span
          style={{
            color: r.totalSkuCounted < r.totalSkuRequest ? "#ff4d4f" : undefined,
          }}
        >
          {r.totalSkuCounted}
        </span>
        /{r.totalSkuRequest}
      </span>
    ),
  },
  {
    title: "TG bắt đầu",
    dataIndex: "startedAt",
    key: "startedAt",
    render: formatDate,
  },
  {
    title: "TG kết thúc",
    dataIndex: "endedAt",
    key: "endedAt",
    render: formatDate,
  },
  {
    title: "Hàng bất thường",
    dataIndex: "totalAnomalyCount",
    key: "totalAnomalyCount",
  },
  {
    title: "Lệch",
    dataIndex: "avgDiff",
    key: "avgDiff",
    render: (v?: number) => (v !== undefined ? v : "—"),
  },
];

const buildColumns = (activeTab: string, onRefetch: () => void): ColumnsType<Record> => {
  const base = baseColumns(onRefetch, activeTab);
  const actionCol = base[base.length - 1];
  const withoutAction = base.slice(0, -1);

  if (activeTab === "counting") {
    return [...withoutAction, ...countingExtraColumns, actionCol];
  }

  if (activeTab === "counted" || activeTab === "completed" || activeTab === "cancelled") {
    const withoutSkuAndLocation = withoutAction.filter(
      (c) => c.key !== "totalLocationRequest" && c.key !== "totalSkuRequest"
    );
    return [...withoutSkuAndLocation, ...lateExtraColumns, actionCol];
  }

  return base;
};

const InventoryCountingTable = ({
  records,
  loading,
  activeTab,
  page,
  limit,
  total,
  onRefetch,
}: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = queryString.parse(location.search.slice(1, 100000)) as any;

  const columns = buildColumns(activeTab, onRefetch);

  return (
    <Table
      rowKey="id"
      loading={loading}
      dataSource={records}
      columns={columns}
      onRow={(record) => ({
        onClick: () => navigate(`/inventory-counting/${record.id}`),
        style: { cursor: "pointer" },
      })}
      pagination={{
        current: page,
        pageSize: limit,
        total,
        showSizeChanger: true,
        onChange: (p, ps) => {
          navigate(
            `${location.pathname}?${queryString.stringify({
              ...params,
              page: p,
              limit: ps,
            })}`
          );
        },
      }}
    />
  );
};

export default InventoryCountingTable;
