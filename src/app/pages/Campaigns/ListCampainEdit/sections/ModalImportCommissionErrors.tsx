import { Flex, Modal, Table, Typography } from "antd";
import { IListCommission } from "app/pages/Campaigns/types";
import React, { useMemo } from "react";

const { Text } = Typography;

interface ModalImportCommissionErrorsProps {
  show: boolean;
  onHide: () => void;
  data: IListCommission[];
  totalSuccess: number;
  totalFailed: number;
}

const ModalImportCommissionErrors = ({
  show,
  onHide,
  data,
  totalSuccess,
  totalFailed,
}: ModalImportCommissionErrorsProps) => {
  const columns = useMemo(
    () => [
      {
        title: "ID sản phẩm",
        dataIndex: "refProductId",
        key: "refProductId",
        width: 180,
      },
      {
        title: "Tên sản phẩm",
        dataIndex: "productName",
        key: "productName",
        width: 260,
      },
      {
        title: "Lỗi",
        dataIndex: "errors",
        key: "errors",
        render: (errors: string[] | null) =>
          errors?.length
            ? errors.map((error, index) => (
                <div key={`${error}-${index}`}>{error}</div>
              ))
            : "-",
      },
    ],
    [],
  );

  const dataSource = useMemo(
    () =>
      data.map((item, index) => ({
        key: `${item.rowNumber ?? index}-${item.refProductId ?? index}`,
        ...item,
      })),
    [data],
  );

  return (
    <Modal
      open={show}
      onCancel={onHide}
      onOk={onHide}
      width={740}
      title="Danh sách tải sản phẩm"
      okText="Đóng"
      cancelButtonProps={{ style: { display: "none" } }}
      destroyOnClose
      centered
    >
      <Flex vertical gap={8} style={{ marginBottom: 16 }}>
        <Text>
          Tổng số sản phẩm tải thành công:{" "}
          <Text strong type="success">
            {totalSuccess}
          </Text>
        </Text>
        <Text>
          Tổng số sản phẩm tải thất bại:{" "}
          <Text strong type="danger">
            {totalFailed}
          </Text>
        </Text>
      </Flex>

      {dataSource.length > 0 && (
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} dòng`,
          }}
          scroll={{ y: 420 }}
        />
      )}
    </Modal>
  );
};

export default ModalImportCommissionErrors;
