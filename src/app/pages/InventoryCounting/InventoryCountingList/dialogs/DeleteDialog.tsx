import { useMutation } from "@apollo/client";
import { Modal } from "antd";
import React from "react";
import mutate_inventoryCountingDelete from "graphql/mutations/mutate_inventoryCountingDelete";
import { showAlert } from "utils/helper";

interface Props {
  open: boolean;
  recordId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const DeleteDialog = ({ open, recordId, onClose, onSuccess }: Props) => {
  const [del, { loading }] = useMutation(mutate_inventoryCountingDelete, {
    onCompleted: (data) => {
      if (data?.inventoryCountingDelete?.success) {
        showAlert.success("Xoá thành công");
        onSuccess();
      } else {
        showAlert.error(data?.inventoryCountingDelete?.message ?? "Xoá thất bại");
      }
    },
    onError: () => showAlert.error("Xoá thất bại"),
  });

  return (
    <Modal
      open={open}
      title="Xoá phiếu kiểm kê"
      okText="Xoá"
      okButtonProps={{ danger: true, loading }}
      cancelText="Đóng"
      onOk={() => del({ variables: { input: {recordId} } })}
      onCancel={onClose}
    >
      Bạn có chắc muốn xoá phiếu kiểm kê này không? Hành động này không thể hoàn tác.
    </Modal>
  );
};

export default DeleteDialog;
