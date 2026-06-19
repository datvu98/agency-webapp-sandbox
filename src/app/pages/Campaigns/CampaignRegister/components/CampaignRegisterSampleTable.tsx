import { Button, Divider, Dropdown, Flex, Popover, Table, TableProps, Typography } from "antd";
import { TableRowSelection } from "antd/es/table/interface";
import Pagination from "app/components/Pagination";
import {
  useCampaignSampleApproveReject,
  useCampaignJobsExcelExport,
  useColumnCampaignSample,
  isCampaignRegisterSamplePendingSubTab,
  getCampaignRegisterSampleRowKey,
  mergeCampaignRegisterSampleSelectedRowsByKey,
} from "app/pages/Campaigns/CampaignRegister/hooks";
import type { CampaignJobExportExcelInput } from "app/pages/Campaigns/CampaignRegister/types";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { ICampaignJob } from "../types/CampaignRegisterTable.types";
import ModalApprove from "./modal/ModalApprove";
import ModalBulkApprove from "./modal/ModalBulkApprove";
import ModalBulkReject from "./modal/ModalBulkReject";
import ModalResultBulkApprove from "./modal/ModalResultBulkApprove";
import { ETYPE_PROCESS_STATUS } from "app/pages/Campaigns/CampaignRegister/constants/constant";
import {
  EORDER_BY_COLUMN,
  ESORT_DIRECTION,
} from "app/pages/Campaigns/CampaignRegister/types";
import ApprovedDemoModal from "app/pages/Campaigns/Job/sections/ApprovedModal";
import ApprovedAirModal from "app/pages/Campaigns/Job/sections/ApprovedAirModal";
// import ModalOptionExport from "./modal/ModalOptionExport";

const { Text } = Typography;
const IS_STOCK_CHECK = 0;

/** Tạm thời xuất thẳng Thông tin nhà sáng tạo, không mở popup */
const EXPORT_BY_OPTION_DEFAULT = {
  includeCreatorInfo: true,
  includeVideoLivestreamInfo: false,
};

type CampaignRegisterSampleTableProps = {
  data: ICampaignJob[];
  basePath: string;
  currentStatus: ETYPE_PROCESS_STATUS;
  loading?: boolean;
  total?: number;
  page?: number;
  sort?: {
    column?: EORDER_BY_COLUMN;
    direction?: ESORT_DIRECTION;
  };
  limit?: number;
  onPageChange?: (page: number, pageSize: number) => void;
  refetch: () => Promise<unknown>;
  handleTableChange: TableProps<ICampaignJob>["onChange"];
  exportFilter: CampaignJobExportExcelInput;
};

const CampaignRegisterSampleTable = ({
  refetch,
  data,
  sort,
  basePath,
  currentStatus,
  loading,
  total = 0,
  page = 1,
  limit = 10,
  handleTableChange,
  exportFilter,
}: CampaignRegisterSampleTableProps) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRowsByKey, setSelectedRowsByKey] = useState<
    Map<string, ICampaignJob>
  >(() => new Map());
  const [rejectRow, setRejectRow] = useState<ICampaignJob | null>(null);
  const [openModalApprove, setOpenModalApprove] = useState(false);
  const [openModalReject, setOpenModalReject] = useState(false);
  const [openModalApproveRow, setOpenModalApproveRow] = useState(false);
  const [approveRow, setApproveRow] = useState<ICampaignJob | null>(null);
  const [openApprovedModal, setOpenApprovedModal] = useState(false);
  const [selectedApprovedJobId, setSelectedApprovedJobId] = useState<
    number | undefined
  >(undefined);
  const [openApprovedAirModal, setOpenApprovedAirModal] = useState(false);
  const [selectedApprovedAirJobId, setSelectedApprovedAirJobId] = useState<
    number | undefined
  >(undefined);
  // const [openModalOptionExport, setOpenModalOptionExport] = useState(false);
  const {
    runBulkApprove,
    cancelBulkApprove,
    closeBulkApproveModal,
    bulkApproveProgress,
    runBulkReject,
    bulkRejectLoading,
    approveRowItems,
    approveRowLoading,
    checkItemsStock,
  } = useCampaignSampleApproveReject(refetch);

  const { exporting, exportByFilter, exportByOptions } =
    useCampaignJobsExcelExport(exportFilter);

  const selectedDisplayCount = selectedRowKeys.length;
  const hasSelected = selectedRowKeys.length > 0;
  const totalPage = Math.ceil(total / limit);
  const isPendingTab = isCampaignRegisterSamplePendingSubTab(currentStatus);

  const clearRowSelection = useCallback(() => {
    setSelectedRowKeys([]);
    setSelectedRowsByKey(new Map());
  }, []);

  const rowSelection: TableRowSelection<ICampaignJob> = {
    selectedRowKeys,
    preserveSelectedRowKeys: true,
    onChange: (keys, rows) => {
      setSelectedRowKeys(keys);
      setSelectedRowsByKey((prev) =>
        mergeCampaignRegisterSampleSelectedRowsByKey(prev, keys, rows),
      );
    },
    columnWidth: 80,
    fixed: "left",
    // getCheckboxProps: (record) => ({
    //   disabled:
    //     isPendingTab &&
    //     record.campaignSampleRequest?.status !== REGISTER_SAMPLE_STATUS.pending,
    // }),
  };

  const onApproveRow = (row: ICampaignJob) => {
    setApproveRow(row);
    setOpenModalApproveRow(true);
  };

  const onRejectRow = (row: ICampaignJob) => {
    setRejectRow(row);
    setOpenModalReject(true);
  };

  const onApproveScriptRow = (row: ICampaignJob) => {
    setSelectedApprovedJobId(row.id);
    setOpenApprovedModal(true);
  };

  const onApproveAcceptanceRow = (row: ICampaignJob) => {
    setSelectedApprovedAirJobId(row.id);
    setOpenApprovedAirModal(true);
  };

  useEffect(() => {
    clearRowSelection();
    setRejectRow(null);
    setOpenModalReject(false);
    setOpenModalApprove(false);
    setOpenModalApproveRow(false);
    setApproveRow(null);
    setSelectedApprovedJobId(undefined);
    setOpenApprovedAirModal(false);
    setSelectedApprovedAirJobId(undefined);
  }, [currentStatus, clearRowSelection]);

  const { columns, kocListVideoNode } = useColumnCampaignSample(
    onApproveRow,
    onRejectRow,
    onApproveScriptRow,
    onApproveAcceptanceRow,
    [currentStatus ?? ETYPE_PROCESS_STATUS.PENDING],
    sort
  );
  const selectedRows = useMemo(
    () =>
      selectedRowKeys
        .map((k) => selectedRowsByKey.get(String(k)))
        .filter((r): r is ICampaignJob => r != null),
    [selectedRowKeys, selectedRowsByKey],
  );

  const handleExportByOption = useCallback(() => {
    if (!hasSelected) return;
    const campaignJobIds = selectedRows.map((row) => row.id);
    void exportByOptions(EXPORT_BY_OPTION_DEFAULT, campaignJobIds);
  }, [exportByOptions, hasSelected, selectedRows]);

  return (
    <Flex vertical gap={10}>
      <Flex align="center" justify="space-between">

        <Flex align="center" gap={10}>
          <Text>
            Đã chọn: <span className="text-count">{selectedDisplayCount}</span>
          </Text>
          {isPendingTab && (
            <Flex align="center" gap={10}>
              <Divider type="vertical" />
              <Button
                type="primary"
                disabled={!hasSelected || bulkApproveProgress.isProcessing}
                onClick={() => {
                  setOpenModalApprove(true);
                }}
              >
                Duyệt
              </Button>
              <Button
                type="default"
                disabled={!hasSelected || bulkRejectLoading}
                onClick={() => {
                  setRejectRow(null);
                  setOpenModalReject(true);
                }}
              >
                Từ chối
              </Button>
            </Flex>
          )}
        </Flex>

        <Dropdown
          placement="bottomRight"
          disabled={exporting}
          menu={{
            items: [
              {
                key: "export-filter",
                label: "Xuất theo bộ lọc",
                onClick: () => {
                  void exportByFilter();
                },
              },
              {
                key: "export-option",
                label: "Xuất theo tùy chọn",
                disabled: !hasSelected,
                onClick: handleExportByOption,
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button type="primary" loading={exporting}>
            Xuất file
          </Button>
        </Dropdown>
      </Flex>

      <Table<ICampaignJob>
        className="campaign-register-table"
        rowKey={(record) => getCampaignRegisterSampleRowKey(record)}
        dataSource={data}
        columns={columns}
        loading={loading}
        scroll={{ x: "max-content" }}
        pagination={false}
        rowSelection={rowSelection}
        onChange={handleTableChange ?? undefined}
      />

      <Pagination
        page={page}
        totalPage={totalPage}
        loading={loading}
        limit={limit}
        totalRecord={total}
        count={data.length}
        basePath={basePath}
      />

      <ModalBulkApprove
        open={openModalApprove}
        onCancel={() => {
          if (bulkApproveProgress.isProcessing) return;
          setOpenModalApprove(false);
        }}
        onConfirm={async () => {
          await runBulkApprove(selectedRows);
          setOpenModalApprove(false);
          clearRowSelection();
        }}
        loading={bulkApproveProgress.isProcessing}
      />
      <ModalResultBulkApprove
        open={bulkApproveProgress.isOpen}
        onCancel={closeBulkApproveModal}
        total={bulkApproveProgress.total}
        processed={bulkApproveProgress.processed}
        totalSuccess={bulkApproveProgress.approvedCount}
        totalError={bulkApproveProgress.errorCount}
        dataError={bulkApproveProgress.dataError}
        isProcessing={bulkApproveProgress.isProcessing}
        onCancelProcessing={cancelBulkApprove}
        onRetryApproveRow={async (row) => {
          const requestId = row.campaignSampleRequest?.id ?? row.id;
          await approveRowItems(
            requestId,
            (row.campaignSampleRequest?.items ?? []).map((i) => i.id),
            IS_STOCK_CHECK
          );
        }}
      />
      <ModalBulkReject
        open={openModalReject}
        onCancel={() => {
          if (bulkRejectLoading) return;
          setOpenModalReject(false);
          setRejectRow(null);
        }}
        onConfirm={async (rejectMessage) => {
          const rowsToReject = rejectRow ? [rejectRow] : selectedRows;
          await runBulkReject(rowsToReject, rejectMessage);
          setOpenModalReject(false);
          setRejectRow(null);
          // Chỉ reset checkbox khi reject theo bulk selection.
          if (!rejectRow) clearRowSelection();
        }}
        loading={bulkRejectLoading}
      />
      <ModalApprove
        open={openModalApproveRow}
        onCancel={() => {
          if (approveRowLoading) return;
          setOpenModalApproveRow(false);
        }}
        loading={approveRowLoading}
        dataProduct={(approveRow?.campaignSampleRequest?.items ?? []).map(
          (p) => ({
            id: p.id,
            productName: p.productName ?? "--",
            image: p.variantImage ?? "",
            variantSku: p.variantSku ?? "--",
            variantName: p.variantName ?? "--",
            variantImage: p.variantImage ?? "",
            quantityPurchased: p.quantityPurchased ?? 0,
          })
        )}
        onConfirm={async (remainingRequestItemIds, shouldCheckStock) => {
          if (!approveRow) return;
          const requestId =
            approveRow.campaignSampleRequest?.id ?? approveRow.id;
          await approveRowItems(
            requestId,
            remainingRequestItemIds,
            shouldCheckStock
          );
          setOpenModalApproveRow(false);
        }}
        checkItemsStock={checkItemsStock}
      />
      {openApprovedModal && (
        <ApprovedDemoModal
          id={selectedApprovedJobId}
          open={openApprovedModal}
          onCancel={() => setOpenApprovedModal(false)}
          onApprovedSuccess={refetch}
        />
      )}
      {openApprovedAirModal && (
        <ApprovedAirModal
          id={selectedApprovedAirJobId}
          open={openApprovedAirModal}
          onCancel={() => setOpenApprovedAirModal(false)}
          onApprovedSuccess={refetch}
        />
      )}
      {/* Tạm ẩn popup chọn loại xuất — xuất thẳng Thông tin nhà sáng tạo qua handleExportByOption */}
      {/* <ModalOptionExport
        open={openModalOptionExport}
        loading={exporting}
        onCancel={() => {
          if (exporting) return;
          setOpenModalOptionExport(false);
        }}
        onConfirm={async (options) => {
          const campaignJobIds = selectedRows.map((row) => row.id);
          const ok = await exportByOptions(options, campaignJobIds);
          if (ok) setOpenModalOptionExport(false);
        }}
      /> */}
      {kocListVideoNode}
    </Flex>
  );
};

export type { CampaignRegisterSampleTableProps };
export default CampaignRegisterSampleTable;
