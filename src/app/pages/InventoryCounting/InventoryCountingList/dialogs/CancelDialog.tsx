import { useMutation } from "@apollo/client";
import { Modal } from "antd";
import React from "react";
import mutate_inventoryCountingCancel from "graphql/mutations/mutate_inventoryCountingCancel";
import { showAlert } from "utils/helper";

interface Props {
  open: boolean;
  recordId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const CancelDialog = ({ open, recordId, onClose, onSuccess }: Props) => {
  const [cancel, { loading }] = useMutation(mutate_inventoryCountingCancel, {
    onCompleted: (data) => {
      if (data?.inventoryCountingCancel?.success) {
        showAlert.success("Huỷ thành công");
        onSuccess();
      } else {
        showAlert.error(data?.inventoryCountingCancel?.message ?? "Huỷ thất bại");
      }
    },
    onError: () => showAlert.error("Huỷ thất bại"),
  });

  return (
    <Modal
      open={open}
      title="Huỷ phiếu kiểm kê"
      okText="Xác nhận huỷ"
      okButtonProps={{ danger: true, loading }}
      cancelText="Đóng"
      onOk={() => cancel({ variables: { input: { recordId } } })}
      onCancel={onClose}
    >
      Bạn có chắc muốn huỷ phiếu kiểm kê này không?
    </Modal>
  );
};

export default CancelDialog;
