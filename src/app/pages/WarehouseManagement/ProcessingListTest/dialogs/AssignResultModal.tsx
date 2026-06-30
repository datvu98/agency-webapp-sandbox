import React from 'react';
import { Modal, Table, Button, Flex, Typography } from 'antd';
import { useStyles } from './AssignResultModal.styles';

const { Text } = Typography;

export interface AssignError {
  code: string;
  error: string;
}

export interface AssignResult {
  total: number;
  successCount: number;
  failCount: number;
  errors: AssignError[];
}

interface AssignResultModalProps {
  open: boolean;
  onClose: () => void;
  result: AssignResult;
}

const columns = [
  {
    title: 'Mã danh sách xử lý',
    dataIndex: 'code',
    key: 'code',
    width: 200,
  },
  {
    title: 'Lỗi',
    dataIndex: 'error',
    key: 'error',
  },
];

const AssignResultModal: React.FC<AssignResultModalProps> = ({ open, onClose, result }) => {
  const { styles } = useStyles();

  return (
    <Modal
      title="Kết quả xử lý"
      open={open}
      onCancel={onClose}
      footer={
        <Flex justify="end">
          <Button type="primary" onClick={onClose}>
            Đóng
          </Button>
        </Flex>
      }
      width={560}
      centered
      destroyOnClose
    >
      <div className={styles.summaryBlock}>
        <Text className={styles.summaryRow}>
          Số lượng phiếu cần phân công nhân viên: <Text strong>{result.total}</Text>
        </Text>
        <Text className={styles.summaryRow}>
          Số lượng phiếu phân công nhân viên thành công:{' '}
          <Text className={styles.successCount}>{result.successCount}</Text>
        </Text>
        <Text className={styles.summaryRow}>
          Số lượng phiếu phân công nhân viên thất bại:{' '}
          <Text className={styles.failCount}>{result.failCount}</Text>
        </Text>
      </div>

      {result.errors.length > 0 && (
        <div className={styles.tableWrapper}>
          <Table
            dataSource={result.errors}
            columns={columns}
            rowKey="code"
            size="small"
            pagination={{ pageSize: 5, size: 'small' }}
            bordered
          />
        </div>
      )}
    </Modal>
  );
};

export default AssignResultModal;
