/**
 * Tạm thời không dùng — xuất theo tùy chọn gọi thẳng exportByOptions (Thông tin nhà sáng tạo)
 * từ CampaignRegisterSampleTable.handleExportByOption.
 */
/*
import { Button, Checkbox, Flex, Modal } from "antd";
import React, { useEffect, useState } from "react";
import type { CampaignJobsExcelExportOptions } from "../../hooks";

type ModalOptionExportProps = {
  open: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (options: CampaignJobsExcelExportOptions) => void | Promise<void>;
};

const DEFAULT_OPTIONS: CampaignJobsExcelExportOptions = {
  includeCreatorInfo: false,
  includeVideoLivestreamInfo: false,
};

const ModalOptionExport = ({
  open,
  loading,
  onCancel,
  onConfirm,
}: ModalOptionExportProps) => {
  const [options, setOptions] =
    useState<CampaignJobsExcelExportOptions>(DEFAULT_OPTIONS);

  useEffect(() => {
    if (open) {
      setOptions(DEFAULT_OPTIONS);
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm(options);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title="Chọn file xuất"
      footer={null}
      centered
      destroyOnClose
    >
      <Flex vertical gap={8} style={{ margin: "20px 0" }}>
        <Checkbox
          checked={options.includeCreatorInfo}
          onChange={(e) =>
            setOptions((prev) => ({
              ...prev,
              includeCreatorInfo: e.target.checked,
            }))
          }
        >
          Thông tin nhà sáng tạo
        </Checkbox>
      </Flex>
      <Flex align="center" justify="flex-end" gap={8}>
        <Button type="default" onClick={onCancel} disabled={loading}>
          Hủy
        </Button>
        <Button
          type="primary"
          onClick={handleConfirm}
          loading={loading}
          disabled={!options.includeCreatorInfo}
        >
          Xuất file
        </Button>
      </Flex>
    </Modal>
  );
};

export default ModalOptionExport;
*/

export {};