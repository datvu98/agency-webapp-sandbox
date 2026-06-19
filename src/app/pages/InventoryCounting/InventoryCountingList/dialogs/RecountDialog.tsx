import { useMutation } from "@apollo/client";
import { Modal } from "antd";
import React from "react";
import mutate_inventoryCountingRequestRecount from "graphql/mutations/mutate_inventoryCountingRequestRecount";
import { showAlert } from "utils/helper";

interface Props {
  open: boolean;
  recordId: number;
  sessionCount: number;
  onClose: () => void;
  onSuccess: () => void;
}

const RecountDialog = ({ open, recordId, sessionCount, onClose, onSuccess }: Props) => {
  const [recount, { loading }] = useMutation(mutate_inventoryCountingRequestRecount, {
    onCompleted: (data) => {
      if (data?.inventoryCountingRequestRecount?.success) {
        showAlert.success("Yêu cầu kiểm đếm lại thành công");
        onSuccess();
      } else {
        showAlert.error(data?.inventoryCountingRequestRecount?.message ?? "Kiểm đếm lại thất bại");
      }
    },
    onError: () => showAlert.error("Kiểm đếm lại thất bại"),
  });

  const maxReached = sessionCount >= 3;

  return (
    <Modal
      open={open}
      title="Kiểm đếm lại"
      okText="Xác nhận"
      okButtonProps={{ loading, disabled: maxReached }}
      cancelText="Đóng"
      onOk={() => recount({ variables: { recordId } })}
      onCancel={onClose}
    >
      {maxReached
        ? "Phiếu đã đạt tối đa 3 lần kiểm kê, không thể yêu cầu thêm."
        : `Xác nhận yêu cầu kiểm kê lần ${sessionCount + 1}?`}
    </Modal>
  );
};

export default RecountDialog;
