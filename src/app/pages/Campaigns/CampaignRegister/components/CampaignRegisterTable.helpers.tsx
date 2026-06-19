import React from 'react';
import { Avatar, Button, Flex, Image, Tag, Tooltip, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { ICampaignRegisterTable } from 'app/pages/Campaigns/types';
import {
  NA,
  REGISTER_SAMPLE_STATUS,
  STATUS_MAP,
  TAB_KEYS,
  TabKey,
} from '../constants/constant';
import CopyText from '../../components/CopyText';

const { Text } = Typography;
const ELLIPSIS_MAX_WIDTH = 200;

const renderRequestTypeTags = (r: ICampaignRegisterTable) => {
  const showLive = (r.ecLiveCount ?? 0) > 0;
  const showVideo = (r.ecVideoCount ?? 0) > 0;

  if (!showLive && !showVideo) {
    return (
      <Flex align="flex-start">
        {NA}
      </Flex>
    );
  }

  return (
    <Flex align="flex-start" gap={4} wrap="wrap">
      {showLive && <Tag style={{ width: 'fit-content', borderRadius: 16, padding: '4px 12px' }}>Live</Tag>}
      {showVideo && <Tag style={{ width: 'fit-content', borderRadius: 16, padding: '4px 12px' }}>Video</Tag>}
    </Flex>
  );
};

const renderEllipsisText = (
  value?: string | number | string[] | null,
  options?: { width?: number; type?: 'secondary' }
) => {
  const content = value == null || value === '' ? NA : String(value);
  return (
    <Text
      type={options?.type}
      style={{ maxWidth: options?.width ?? ELLIPSIS_MAX_WIDTH, display: 'inline-block' }}
      ellipsis={{ tooltip: content }}
    >
      {content}
    </Text>
  );
};

export type IFlattenedRow = ICampaignRegisterTable;

export const buildTableData = (data: ICampaignRegisterTable[]): ICampaignRegisterTable[] => {
  return data ?? [];
};

export const renderStatusIcon = (status?: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    approved: <CheckCircleOutlined style={{ fontSize: 14, color: '#52c41a' }} />,
    rejected: <CloseCircleOutlined style={{ fontSize: 14, color: '#ff4d4f' }} />,
    pending: <ClockCircleOutlined style={{ fontSize: 14, color: '#faad14' }} />,
  };

  return iconMap[status || ''] ?? <ClockCircleOutlined style={{ fontSize: 16, color: '#d9d9d9' }} />;
};

export const getTableColumns = (
  tab: TabKey,
  options?: {
    expandedProductKeys?: Set<React.Key>;
    onToggleProducts?: (rowKey: React.Key) => void;
    onRejectRow?: (row: IFlattenedRow) => void;
    onApproveRow?: (row: IFlattenedRow) => void;
    onUsernameClick?: (row: IFlattenedRow) => void;
    /** Tab add_showcase: ảnh SP theo ScGetSmeProducts (map key = scProductId) */
    productImageByScProductId?: ReadonlyMap<number, string | null>;
  }
): TableColumnsType<IFlattenedRow> => {
  const productColumn: TableColumnsType<IFlattenedRow>[number] = {
    title: 'Sản phẩm đăng ký',
    key: 'product',
    width: 310,
    render: (_: unknown, r: IFlattenedRow) => {
      const items = r.items ?? [];
      const isExpanded = options?.expandedProductKeys?.has(r.key) ?? false;
      const visibleItems = isExpanded ? items : items.slice(0, 3);

      return (
        <Flex vertical gap={8}>
          {visibleItems.map((item) => {
            const scId = item.scProductId;
            const showcaseImage =
              tab === TAB_KEYS.ADD_SHOWCASE &&
                options?.productImageByScProductId &&
                typeof scId === 'number'
                ? options.productImageByScProductId.get(scId)
                : undefined;
            const imageSrc =
              showcaseImage != null && String(showcaseImage).trim() !== ''
                ? showcaseImage
                : item.variantImage;

            return (
              <Flex key={item.id} align="flex-start" justify="space-between" style={{ width: '100%' }}>
                <Flex align="flex-start" justify="center" gap={10} style={{ minHeight: '50px' }}>
                  <Image src={imageSrc} alt='image' width={50} height={50} style={{ borderRadius: 8, objectFit: 'cover' }} />
                  <Flex vertical gap={2}>
                    <Flex align="center" gap={8}>
                      <Text
                        strong
                        style={{ fontSize: 13, maxWidth: 170 }}
                        ellipsis={{ tooltip: item.productName || NA }}
                      >
                        {item.productName || NA}
                      </Text>
                      {tab === TAB_KEYS.REGISTER_SAMPLE && <Tooltip title={STATUS_MAP[item.status]?.tooltip}>
                        {item.status !== REGISTER_SAMPLE_STATUS.pending && renderStatusIcon(item.status)}
                      </Tooltip>}
                    </Flex>
                    {tab === TAB_KEYS.REGISTER_SAMPLE && (
                      <>
                        <Text
                          type="secondary"
                          style={{ fontSize: 12, maxWidth: 170 }}
                          ellipsis={{ tooltip: `SKU: ${item.variantSku ?? '--'}` }}
                        >
                          SKU: {item.variantSku ?? '--'}
                        </Text>
                        <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <span
                            style={{ fontSize: 12, color: '#999', maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            title={`Phân loại: ${item.variantName ?? '--'}${tab === TAB_KEYS.REGISTER_SAMPLE ? `, SL: ${item.quantityPurchased ?? '--'}` : ''}`}
                          >
                            Phân loại: {item.variantName ?? '--'}
                            {tab === TAB_KEYS.REGISTER_SAMPLE && `, SL: ${item.quantityPurchased ?? '--'}`}
                          </span>
                        </span>
                      </>
                    )}
                  </Flex>
                </Flex>
              </Flex>
            );
          })}
          {!r.items?.length && <Text type="secondary">{NA}</Text>}
          {items.length > 3 && (
            <Button
              type="link"
              style={{ padding: 0, alignSelf: 'flex-start', height: 'auto', fontSize: 12 }}
              onClick={() => options?.onToggleProducts?.(r.key)}
            >
              {isExpanded ? 'Thu gọn' : `Xem thêm (${items.length - 3})`}
            </Button>
          )}
        </Flex>
      )
    },
  };

  const kocColumn: TableColumnsType<IFlattenedRow>[number] = {
    title: 'Nhà sáng tạo',
    key: 'creatorChannelName',
    width: 240,
    fixed: 'left',
    render: (_: unknown, r: IFlattenedRow) => {
      const initial = (r.creatorChannelUsername || r.creatorChannelName || '?').charAt(0).toUpperCase();
      return (
        <Flex align="center" gap={10} style={{ height: '60px' }}>
          <Avatar size={36} style={{ flexShrink: 0, backgroundColor: '#1677ff', fontSize: 16 }}>
            {initial}
          </Avatar>
          <Flex vertical align='flex-start'>
            <Text strong style={{ maxWidth: 140 }} ellipsis={{ tooltip: r.creatorChannelName || NA }}>
              {r.creatorChannelName || NA}
            </Text>
            <span
              style={{ fontSize: 12, cursor: 'pointer', padding: 0, margin: 0, maxWidth: 140 }}
              title={`@${r.creatorChannelUsername || NA}`}
              onClick={(e) => {
                e.stopPropagation();
                if (options?.onUsernameClick) {
                  options.onUsernameClick(r);
                } else if (r.urlCreatorChannel) {
                  window.open(r.urlCreatorChannel, '_blank');
                }
              }}
            >
              <CopyText text={`${r.creatorChannelUsername || NA}`} hideIcon={false}>
                <Text
                  style={{ maxWidth: 140, color: '#006aff' }}
                  ellipsis={{ tooltip: `${r.creatorChannelUsername || NA}` }}
                >
                  {r.creatorChannelUsername || NA}
                </Text>
              </CopyText>
            </span>
          </Flex>
        </Flex>
      );
    },
  };

  const registerSampleColumns: TableColumnsType<IFlattenedRow> = [
    {
      title: 'Trạng thái duyệt',
      key: 'sampleStatus',
      width: 160,
      align: 'center',
      render: (_: unknown, r: IFlattenedRow) => {
        const cfg = STATUS_MAP[r.status] ?? { label: r.status || NA, color: 'default' };
        return (
          <Flex align="center" justify="center" style={{ height: '60px' }}>
            <Tag color={cfg.color} style={{ width: 'fit-content', borderRadius: 16, padding: '4px 12px' }}>{cfg.label}</Tag>
          </Flex>
        );
      },
    },
    productColumn,
    {
      title: 'Địa chỉ',
      key: 'fullAddress',
      width: 220,
      render: (_: unknown, r: IFlattenedRow) => renderEllipsisText(r.fullAddress, { width: 200 }),
    },
    {
      title: 'Số điện thoại',
      key: 'phone',
      width: 130,
      render: (_: unknown, r: IFlattenedRow) => renderEllipsisText(r.phone, { width: 110 }),
    },
    {
      title: 'Hình thức',
      key: 'requestType',
      width: 150,
      render: (_: unknown, r: IFlattenedRow) => renderRequestTypeTags(r),
    },
    {
      title: 'Số lượng bài đăng',
      key: 'postCount',
      width: 160,
      render: (_: unknown, r: IFlattenedRow) => {
        if (!Array.isArray(r.postCount) || r.postCount.length === 0) return NA;
        const postCount = r.postCount[0];
        return `${postCount.video} video, ${postCount.Live} live`;
      },
    },
    {
      title: 'Lượt theo dõi',
      key: 'followCount',
      width: 130,
      render: (_: unknown, r: IFlattenedRow) => (r.followCount != null ? r.followCount.toLocaleString('vi-VN') : NA),
    },
    {
      title: (
        <Flex align="center" gap={4}>
          <span>GMV</span>
          <Tooltip title="Đối với nhà sáng tạo ẩn dữ liệu, GMV được ước tính (ký hiệu '~') bằng Số món bán × GMV trung bình từ mỗi khách hàng">
            <InfoCircleOutlined />
          </Tooltip>
        </Flex>
      ),
      key: 'gmv',
      width: 200,
      render: (_: unknown, r: IFlattenedRow) => (
        r.gmv != null ? r.gmv.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : NA
      ),
    },
    {
      title: 'Số món bán ra',
      key: 'soldCount',
      width: 130,
      render: (_: unknown, r: IFlattenedRow) => (r.soldCount != null ? r.soldCount : NA),
    },
    {
      title: 'Lượt xem video TB',
      key: 'avgVideoViews',
      width: 150,
      render: (_: unknown, r: IFlattenedRow) => (r.avgVideoViews != null ? r.avgVideoViews.toLocaleString('vi-VN') : NA),
    },
    {
      title: 'Tỷ lệ tương tác',
      key: 'engagementRate',
      width: 140,
      render: (_: unknown, r: IFlattenedRow) => (r.engagementRate != null ? `${r.engagementRate}%` : NA),
    },
    {
      title: 'Lĩnh vực',
      key: 'category',
      width: 200,
      render: (_: unknown, r: IFlattenedRow) => {
        const categories = Array.isArray(r.category)
          ? r.category
          : r.category
            ? [r.category]
            : [];
        if (categories.length === 0) return <Text type="secondary">{NA}</Text>;
        return (
          <Flex vertical gap={4}>
            {categories.map((c) => <Tag key={c} style={{ width: 'fit-content', borderRadius: 16, padding: '4px 12px' }}>
              <Text ellipsis={{ tooltip: c }} style={{ maxWidth: 130, fontSize: 12 }}>{c}</Text>
            </Tag>)}
          </Flex>
        );
      },
    },
    {
      title: 'Thời gian đăng ký',
      key: 'createdAt',
      width: 160,
      render: (_: unknown, r: IFlattenedRow) => dayjs(r.createdAt).format('DD/MM/YYYY HH:mm') ?? NA,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 160,
      align: 'center',
      render: (_: unknown, r: IFlattenedRow) => {
        if (r.status !== REGISTER_SAMPLE_STATUS.pending) return null;

        return (
          <Flex gap={4} justify="center">
            <Button
              size="small"
              type="link"
              onClick={() => options?.onApproveRow?.(r)}
              style={{ color: 'green' }}
            >
              Chấp nhận
            </Button>
            <Button
              size="small"
              type="link"
              danger
              onClick={() => options?.onRejectRow?.(r)}
            >
              Từ chối
            </Button>
          </Flex>
        );
      },
    },
  ];

  const addShowcaseColumns: TableColumnsType<IFlattenedRow> = [
    kocColumn,
    productColumn,
    {
      title: 'Lượt theo dõi',
      key: 'followCount',
      width: 130,
      align: 'center',
      render: (_: unknown, r: IFlattenedRow) => (r.followCount != null ? r.followCount.toLocaleString('vi-VN') : NA),
    },
    {
      title: (<Flex align="center" gap={4}><span>GMV</span><Tooltip title="Đối với nhà sáng tạo ẩn dữ liệu, GMV được ước tính (ký hiệu '~') bằng Số món bán × GMV trung bình từ mỗi khách hàng"><InfoCircleOutlined /></Tooltip></Flex>),
      key: 'gmv',
      width: 200,
      align: 'center',
      render: (_: unknown, r: IFlattenedRow) => (
        r.gmv != null ? r.gmv.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : NA
      ),
    },
    {
      title: 'Số món bán',
      key: 'soldCount',
      width: 130,
      align: 'center',
      render: (_: unknown, r: IFlattenedRow) => (r.soldCount != null ? r.soldCount : NA),
    },
    {
      title: 'Lượt xem video TB',
      key: 'avgVideoViews',
      width: 150,
      align: 'center',
      render: (_: unknown, r: IFlattenedRow) => (r.avgVideoViews != null ? r.avgVideoViews.toLocaleString('vi-VN') : NA),
    },
    {
      title: 'Tỷ lệ tương tác',
      key: 'engagementRate',
      width: 140,
      align: 'center',
      render: (_: unknown, r: IFlattenedRow) => (r.engagementRate != null ? `${r.engagementRate}%` : NA),
    },
    {
      title: 'Lĩnh vực',
      key: 'category',
      width: 200,
      render: (_: unknown, r: IFlattenedRow) => {
        const categories = Array.isArray(r.category)
          ? r.category
          : r.category
            ? [r.category]
            : [];
        if (categories.length === 0) return <Text type="secondary">{NA}</Text>;
        return (
          <Flex vertical gap={4}>
            {categories.map((c) => <Tag key={c} style={{ width: 'fit-content', borderRadius: 16, padding: "2px 8px" }}>
              <Text ellipsis={{ tooltip: c }} style={{ maxWidth: 130, fontSize: 12 }}>{c}</Text>
            </Tag>)}
          </Flex>
        );
      },
    },
    {
      title: 'Thời gian đăng ký',
      key: 'createdAt',
      width: 160,
      render: (_: unknown, r: IFlattenedRow) => dayjs(r.createdAt).format('DD/MM/YYYY HH:mm') ?? NA,
    }
  ];

  return tab === TAB_KEYS.ADD_SHOWCASE ? addShowcaseColumns : [kocColumn, ...registerSampleColumns];
};

export const getScrollX = (tab: TabKey) => (tab === TAB_KEYS.ADD_SHOWCASE ? 1250 : 1900);

export {
  getCampaignRegisterSampleRowKey,
  mergeCampaignRegisterSampleSelectedRowsByKey,
} from '../hooks/useColumnCampaignSample';
