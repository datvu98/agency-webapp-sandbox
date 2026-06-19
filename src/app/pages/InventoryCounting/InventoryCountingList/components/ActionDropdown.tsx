import { useMutation } from "@apollo/client";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import mutate_inventoryCountingCopy from "graphql/mutations/mutate_inventoryCountingCopy";
import { showAlert } from "utils/helper";
import ApproveDialog from "../dialogs/ApproveDialog";
import CancelDialog from "../dialogs/CancelDialog";
import DeleteDialog from "../dialogs/DeleteDialog";
import ReassignDialog from "../dialogs/ReassignDialog";
import CompleteDialog from "../dialogs/CompleteDialog";
import RecountDialog from "../dialogs/RecountDialog";

interface RecordShape {
  id: number;
  code: string;
  status: string;
  allSessionsEnded: boolean;
  sessionCount: number;
}

interface Props {
  record: RecordShape;
  activeTab: string;
  onRefetch: () => void;
}

type DialogKey = "approve" | "cancel" | "delete" | "reassign" | "complete" | "recount" | null;

const ActionDropdown = ({ record, activeTab, onRefetch }: Props) => {
  const navigate = useNavigate();
  const [dialog, setDialog] = useState<DialogKey>(null);

  const [copy, { loading: copying }] = useMutation(mutate_inventoryCountingCopy, {
    onCompleted: (data) => {
      const id = data?.inventoryCountingCopy?.data?.id;
      if (id) navigate(`/inventory-counting/${id}`);
      else showAlert.error(data?.inventoryCountingCopy?.message ?? "Sao chép thất bại");
    },
    onError: () => showAlert.error("Sao chép thất bại"),
  });

  const handleCopy = () => copy({ variables: { input: {recordId: record?.id} } });

  const menuItems = (): MenuProps["items"] => {
    switch (activeTab) {
      case "new":
        return [
          { key: "approve", label: "Duyệt", onClick: () => setDialog("approve") },
          { key: "edit", label: "Chỉnh sửa", onClick: () => navigate(`/inventory-counting/${record.id}`) },
          { key: "copy", label: "Sao chép", onClick: handleCopy, disabled: copying },
          { key: "cancel", label: "Huỷ", onClick: () => setDialog("cancel") },
          { key: "delete", label: "Xoá", onClick: () => setDialog("delete"), danger: true },
        ];

      case "approved":
        return [
          { key: "reassign", label: "Phân công lại", onClick: () => setDialog("reassign") },
          { key: "copy", label: "Sao chép", onClick: handleCopy, disabled: copying },
          { key: "cancel", label: "Huỷ", onClick: () => setDialog("cancel") },
        ];

      case "counting": {
        const canAct = record.allSessionsEnded;
        return [
          { key: "complete", label: "Hoàn thành phiếu", onClick: () => setDialog("complete"), disabled: !canAct },
          { key: "cancel", label: "Huỷ", onClick: () => setDialog("cancel"), disabled: !canAct },
        ];
      }

      case "counted": {
        const canCancel = record.allSessionsEnded;
        return [
          { key: "recount", label: "Kiểm đếm lại", onClick: () => setDialog("recount") },
          { key: "cancel", label: "Huỷ", onClick: () => setDialog("cancel"), disabled: !canCancel },
        ];
      }

      case "completed":
      case "cancelled":
        return [
          { key: "copy", label: "Sao chép", onClick: handleCopy, disabled: copying },
        ];

      default:
        return [];
    }
  };

  const closeAndRefetch = () => {
    setDialog(null);
    onRefetch();
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Dropdown menu={{ items: menuItems() }} trigger={["click"]}>
        <a>Thao tác ▾</a>
      </Dropdown>

      {dialog === "approve" && (
        <ApproveDialog
          open
          recordId={record.id}
          onClose={() => setDialog(null)}
          onSuccess={closeAndRefetch}
        />
      )}
      {dialog === "reassign" && (
        <ReassignDialog
          open
          recordId={record.id}
          onClose={() => setDialog(null)}
          onSuccess={closeAndRefetch}
        />
      )}
      {dialog === "cancel" && (
        <CancelDialog
          open
          recordId={record.id}
          onClose={() => setDialog(null)}
          onSuccess={closeAndRefetch}
        />
      )}
      {dialog === "delete" && (
        <DeleteDialog
          open
          recordId={record.id}
          onClose={() => setDialog(null)}
          onSuccess={closeAndRefetch}
        />
      )}
      {dialog === "complete" && (
        <CompleteDialog
          open
          recordId={record.id}
          onClose={() => setDialog(null)}
          onSuccess={closeAndRefetch}
        />
      )}
      {dialog === "recount" && (
        <RecountDialog
          open
          recordId={record.id}
          sessionCount={record.sessionCount}
          onClose={() => setDialog(null)}
          onSuccess={closeAndRefetch}
        />
      )}
    </div>
  );
};

export default ActionDropdown;
