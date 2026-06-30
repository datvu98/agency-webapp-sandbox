import React, { useState } from 'react';
import { Modal, Select, Button, Flex } from 'antd';
import { useStyles } from './AssignPICBulkModal.styles';

interface OptionItem {
  value: string;
  label: string;
}

interface AssignPICBulkModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (staffId: string) => void;
  loading: boolean;
  optionPIC: OptionItem[];
}

const AssignPICBulkModal: React.FC<AssignPICBulkModalProps> = ({
  open,
  onCancel,
  onConfirm,
  loading,
  optionPIC,
}) => {
  const { styles } = useStyles();
  const [selectedStaff, setSelectedStaff] = useState<string | undefined>(undefined);

  const handleCancel = () => {
    setSelectedStaff(undefined);
    onCancel();
  };

  const handleConfirm = () => {
    if (selectedStaff) {
      onConfirm(selectedStaff);
      setSelectedStaff(undefined);
    }
  };

  return (
    <Modal
      title="Phân công nhân viên"
      open={open}
      onCancel={handleCancel}
      footer={
        <Flex justify="end" gap={8}>
          <Button type="default" onClick={handleCancel} disabled={loading}>
            Huỷ
          </Button>
          <Button
            type="primary"
            onClick={handleConfirm}
            loading={loading}
            disabled={!selectedStaff}
          >
            Đồng ý
          </Button>
        </Flex>
      }
      width={480}
      centered
      destroyOnClose
    >
      <div className={styles.body}>
        <span className={styles.label}>Chọn nhân viên xử lý</span>
        <Select
          style={{ width: '100%' }}
          placeholder="Chọn nhân viên xử lý"
          options={optionPIC}
          value={selectedStaff}
          onChange={setSelectedStaff}
          showSearch
          optionFilterProp="label"
          allowClear
        />
      </div>
    </Modal>
  );
};

export default AssignPICBulkModal;
