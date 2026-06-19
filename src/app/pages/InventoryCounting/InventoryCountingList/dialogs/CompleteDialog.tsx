import { useMutation } from "@apollo/client";
import { Modal } from "antd";
import React from "react";
import mutate_inventoryCountingComplete from "graphql/mutations/mutate_inventoryCountingComplete";
import { showAlert } from "utils/helper";

interface Props {
  open: boolean;
  recordId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const CompleteDialog = ({ open, recordId, onClose, onSuccess }: Props) => {
  const [complete, { loading }] = useMutation(mutate_inventoryCountingComplete, {
    onCompleted: (data) => {
      if (data?.inventoryCountingComplete?.success) {
        showAlert.success("Hoàn thành phiếu thành công");
        onSuccess();
      } else {
        showAlert.error(data?.inventoryCountingComplete?.message ?? "Hoàn thành thất bại");
      }
    },
    onError: () => showAlert.error("Hoàn thành thất bại"),
  });

  return (
    <Modal
      open={open}
      title="Hoàn thành phiếu kiểm kê"
      okText="Xác nhận"
      confirmLoading={loading}
      cancelText="Đóng"
      onOk={() => complete({ variables: { recordId } })}
      onCancel={onClose}
    >
      Xác nhận hoàn thành phiếu kiểm kê này?
    </Modal>
  );
};

export default CompleteDialog;
