import { useMutation, useQuery } from "@apollo/client";
import { Modal, Select, Spin } from "antd";
import React, { useState } from "react";
import mutate_inventoryCountingApprove from "graphql/mutations/mutate_inventoryCountingApprove";
import query_agencyGetSubUsers from "graphql/queries/query_agencyGetSubUsers";
import { showAlert } from "utils/helper";

interface Props {
  open: boolean;
  recordId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const ApproveDialog = ({ open, recordId, onClose, onSuccess }: Props) => {
  const [assignedTo, setAssignedTo] = useState<string | undefined>(undefined);

  const { data: subUserData, loading: loadingUsers } = useQuery(query_agencyGetSubUsers, {
    variables: { status: { _eq: 10 } },
    fetchPolicy: "cache-and-network",
  });

  const subUserOptions = (subUserData?.agencyGetSubUsers?.items ?? []).map((u: any) => ({
    value: `${u?.id}`,
    label: u?.username,
  }));

  const [approve, { loading }] = useMutation(mutate_inventoryCountingApprove, {
    onCompleted: (data) => {
      if (data?.inventoryCountingApprove?.success) {
        showAlert.success("Duyệt thành công");
        onSuccess();
      } else {
        showAlert.error(data?.inventoryCountingApprove?.message ?? "Duyệt thất bại");
      }
    },
    onError: () => showAlert.error("Duyệt thất bại"),
  });

  const handleOk = () => {
    if (!assignedTo) {
      showAlert.error("Vui lòng chọn nhân viên kiểm kê");
      return;
    }
    approve({ variables: { input: {recordId, staffId: Number(assignedTo)} } });
  };

  return (
    <Modal
      open={open}
      title="Duyệt phiếu kiểm kê"
      okText="Duyệt"
      cancelText="Huỷ"
      confirmLoading={loading}
      onOk={handleOk}
      onCancel={onClose}
      afterClose={() => setAssignedTo(undefined)}
    >
      <Spin spinning={loadingUsers}>
        <Select
          style={{ width: "100%" }}
          placeholder="Chọn nhân viên kiểm kê"
          showSearch
          optionFilterProp="label"
          allowClear
          options={subUserOptions}
          value={assignedTo}
          onChange={(val) => setAssignedTo(val)}
        />
      </Spin>
    </Modal>
  );
};

export default ApproveDialog;
