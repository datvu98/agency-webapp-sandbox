import { useMutation } from "@apollo/client";
import { Modal } from "antd";
import React from "react";
import mutate_inventoryCountingRemoveItems from "graphql/mutations/mutate_inventoryCountingRemoveItems";
import { showAlert } from "utils/helper";

interface Props {
  open: boolean;
  recordId: number;
  itemIds: number[];
  onClose: () => void;
  onSuccess: () => void;
}

const RemoveItemDialog = ({ open, recordId, itemIds, onClose, onSuccess }: Props) => {
  const [remove, { loading }] = useMutation(mutate_inventoryCountingRemoveItems, {
    onCompleted: (data) => {
      if (data?.inventoryCountingRemoveItems?.success) {
        showAlert.success("Xoá thành công");
        onSuccess();
      } else {
        showAlert.error(data?.inventoryCountingRemoveItems?.message ?? "Xoá thất bại");
      }
    },
    onError: () => showAlert.error("Xoá thất bại"),
  });

  return (
    <Modal
      open={open}
      title="Xoá khỏi phiếu kiểm kê"
      okText="Xoá"
      okButtonProps={{ danger: true, loading }}
      cancelText="Đóng"
      onOk={() => remove({ variables: { input: {recordId, recordItemIds: itemIds }} })}
      onCancel={onClose}
    >
      Bạn có chắc muốn xoá dòng này khỏi phiếu không?
    </Modal>
  );
};

export default RemoveItemDialog;
