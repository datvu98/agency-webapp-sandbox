import { useLazyQuery } from "@apollo/client";
import { Modal, Spin, Table } from "antd";
import React, { useEffect } from "react";
import query_inventoryCountingStockDelta from "graphql/queries/query_inventoryCountingStockDelta";

interface Props {
  open: boolean;
  recordId: number;
  locationCode: string;
  sku: string;
  onClose: () => void;
}

const StockDeltaDialog = ({ open, recordId, locationCode, sku, onClose }: Props) => {
  const [fetch, { data, loading }] = useLazyQuery(query_inventoryCountingStockDelta, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (open) {
      fetch({ variables: { recordId, locationCode, sku } });
    }
  }, [open]);

  const delta = data?.inventoryCountingStockDelta?.data;
  const transactions: any[] = delta?.transactions ?? [];

  const columns = [
    { title: "Loại", dataIndex: "type", key: "type" },
    { title: "Số lượng", dataIndex: "qty", key: "qty" },
    { title: "Phiếu liên quan", dataIndex: "relatedCode", key: "relatedCode" },
  ];

  return (
    <Modal
      open={open}
      title="Thông tin thay đổi tồn"
      onCancel={onClose}
      footer={null}
      width={520}
    >
      <Spin spinning={loading}>
        <div style={{ marginBottom: 12 }}>
          <span style={{ marginRight: 16 }}>Mã vị trí: <b>{delta?.locationCode ?? locationCode}</b></span>
          <span style={{ marginRight: 16 }}>Mã SKU: <b>{delta?.sku ?? sku}</b></span>
          <span>Mã GTIN: <b>{delta?.gtin ?? "—"}</b></span>
        </div>
        <Table
          rowKey={(r, i) => `${r?.relatedCode}-${i}`}
          size="small"
          dataSource={transactions}
          columns={columns}
          pagination={false}
        />
      </Spin>
    </Modal>
  );
};

export default StockDeltaDialog;
