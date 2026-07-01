import { Empty, Segmented, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStyles } from './ConversionBillListPage.styles';

interface ConversionBill {
  bill_code: string;
  staff_name: string;
  record_count: number;
  created_at: string;
}

const MOCK_BILLS: ConversionBill[] = [
  { bill_code: 'GSC-2026-001', staff_name: 'Nguyễn Văn A', record_count: 12, created_at: '27/06/2026 14:32:01' },
  { bill_code: 'GSC-2026-002', staff_name: 'Trần Thị B', record_count: 5, created_at: '27/06/2026 09:15:44' },
  { bill_code: 'GSC-2026-003', staff_name: 'Lê Quang C', record_count: 8, created_at: '26/06/2026 16:50:22' },
  { bill_code: 'GSC-2026-004', staff_name: 'Phạm Minh D', record_count: 3, created_at: '26/06/2026 11:04:17' },
  { bill_code: 'GSC-2026-005', staff_name: 'Hoàng Thị E', record_count: 20, created_at: '25/06/2026 08:30:59' },
];

type DemoMode = 'data' | 'empty';

const ConversionBillListPage = () => {
  const { styles } = useStyles();
  const navigate = useNavigate();
  const [mode, setMode] = useState<DemoMode>('data');

  const data = mode === 'data' ? MOCK_BILLS : [];

  const columns: ColumnsType<ConversionBill> = [
    {
      title: 'Mã phiếu',
      dataIndex: 'bill_code',
      key: 'bill_code',
      render: (value) => <span className={styles.billCode}>{value}</span>,
    },
    {
      title: 'Nhân viên thực hiện',
      dataIndex: 'staff_name',
      key: 'staff_name',
      render: (value) => (
        <Tooltip title={value}>
          <span className={styles.staffName}>{value}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Số lượng bản ghi',
      dataIndex: 'record_count',
      key: 'record_count',
    },
    {
      title: 'Thời gian tạo phiếu',
      dataIndex: 'created_at',
      key: 'created_at',
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.title}>Báo cáo chuyển đổi trạng thái</span>
          <Segmented
            value={mode}
            onChange={(v) => setMode(v as DemoMode)}
            options={[
              { label: 'Mẫu dữ liệu', value: 'data' },
              { label: 'Trạng thái rỗng', value: 'empty' },
            ]}
          />
        </div>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="bill_code"
          locale={{
            emptyText: <Empty description="Chưa có phiếu chuyển đổi trạng thái nào" />,
          }}
          pagination={{ pageSize: 20, showSizeChanger: false }}
          onRow={(record) => ({
            onClick: () => navigate(`/report/conversion-bills/${record.bill_code}`),
            style: { cursor: 'pointer' },
          })}
        />
      </div>
    </div>
  );
};

export default ConversionBillListPage;
