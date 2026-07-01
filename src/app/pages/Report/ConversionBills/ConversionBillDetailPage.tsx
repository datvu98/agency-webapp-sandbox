import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Empty, Segmented, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDetailStyles } from './ConversionBillDetailPage.styles';

interface ConversionRecord {
  id: string;
  sku: string;
  item_name: string;
  from_status: string;
  to_status: string;
  quantity: number;
  converted_at: string;
}

interface BillDetail {
  bill_code: string;
  staff_name: string;
  location: string;
  created_at: string;
  records: ConversionRecord[];
}

const MOCK_BILLS: Record<string, BillDetail> = {
  'GSC-2026-001': {
    bill_code: 'GSC-2026-001',
    staff_name: 'Nguyễn Văn A',
    location: 'A-01-01',
    created_at: '27/06/2026 14:32:01',
    records: [
      { id: '1', sku: 'SKU-001', item_name: 'Áo thun nam cổ tròn', from_status: 'AVAILABLE', to_status: 'DAMAGED', quantity: 15, converted_at: '27/06/2026 14:30:12' },
      { id: '2', sku: 'SKU-002', item_name: 'Quần jeans nữ slim fit', from_status: 'AVAILABLE', to_status: 'QUARANTINE', quantity: 8, converted_at: '27/06/2026 14:30:45' },
      { id: '3', sku: 'SKU-003', item_name: 'Giày thể thao unisex', from_status: 'QUARANTINE', to_status: 'AVAILABLE', quantity: 4, converted_at: '27/06/2026 14:31:20' },
      { id: '4', sku: 'SKU-004', item_name: 'Túi xách da nữ', from_status: 'DAMAGED', to_status: 'AVAILABLE', quantity: 2, converted_at: '27/06/2026 14:31:55' },
    ],
  },
  'GSC-2026-002': {
    bill_code: 'GSC-2026-002',
    staff_name: 'Trần Thị B',
    location: 'B-03-02',
    created_at: '27/06/2026 09:15:44',
    records: [
      { id: '1', sku: 'SKU-010', item_name: 'Mũ lưỡi trai', from_status: 'AVAILABLE', to_status: 'DAMAGED', quantity: 10, converted_at: '27/06/2026 09:13:00' },
      { id: '2', sku: 'SKU-011', item_name: 'Vớ thể thao (bộ 3 đôi)', from_status: 'QUARANTINE', to_status: 'AVAILABLE', quantity: 20, converted_at: '27/06/2026 09:14:30' },
    ],
  },
};

const FALLBACK_BILL: BillDetail = {
  bill_code: '',
  staff_name: '',
  location: '',
  created_at: '',
  records: [],
};

type DemoMode = 'data' | 'empty';

const ConversionBillDetailPage = () => {
  const { styles } = useDetailStyles();
  const navigate = useNavigate();
  const { bill_code } = useParams<{ bill_code: string }>();
  const [mode, setMode] = useState<DemoMode>('data');

  const bill = MOCK_BILLS[bill_code ?? ''] ?? { ...FALLBACK_BILL, bill_code: bill_code ?? '' };
  const records = mode === 'data' ? bill.records : [];

  const columns: ColumnsType<ConversionRecord> = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Hàng hoá',
      dataIndex: 'item_name',
      key: 'item_name',
      render: (value) => (
        <Tooltip title={value}>
          <span className={styles.itemName}>{value}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Trạng thái chuyển đổi',
      key: 'status_transition',
      render: (_, record) => (
        <span className={styles.statusTransition}>
          <Tag>{record.from_status}</Tag>
          <ArrowRightOutlined className={styles.arrow} />
          <Tag color="processing">{record.to_status}</Tag>
        </span>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Thời gian chuyển đổi',
      dataIndex: 'converted_at',
      key: 'converted_at',
    },
  ];

  return (
    <div className={styles.page}>
      <div
        className={styles.backLink}
        onClick={() => navigate('/report/conversion-bills')}
      >
        <ArrowLeftOutlined />
        <span>Quay lại danh sách phiếu</span>
      </div>

      <div className={styles.headerCard}>
        <div className={styles.headerTop}>
          <span className={styles.billCode}>{bill.bill_code || bill_code}</span>
          <Segmented
            value={mode}
            onChange={(v) => setMode(v as DemoMode)}
            options={[
              { label: 'Mẫu dữ liệu', value: 'data' },
              { label: 'Trạng thái rỗng', value: 'empty' },
            ]}
          />
        </div>
        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Nhân viên thực hiện</span>
            <span className={styles.metaValue}>{bill.staff_name || '—'}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Vị trí</span>
            <span className={styles.metaValue}>{bill.location || '—'}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Thời gian tạo phiếu</span>
            <span className={styles.metaValue}>{bill.created_at || '—'}</span>
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>Danh sách bản ghi chuyển đổi</span>
        </div>
        <Table
          dataSource={records}
          columns={columns}
          rowKey="id"
          locale={{
            emptyText: <Empty description="Không có bản ghi chuyển đổi thành công" />,
          }}
          pagination={false}
        />
      </div>
    </div>
  );
};

export default ConversionBillDetailPage;
