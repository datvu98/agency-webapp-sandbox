import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Flex,
  Switch,
  Tooltip,
  Typography,
  Tag,
  theme,
  Dropdown,
  Alert,
} from 'antd';
import { MenuProps } from 'antd/lib/menu';
import {
  InfoCircleOutlined,
  WarningOutlined,
  DownOutlined,
  TeamOutlined,
  RightOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { useLayoutContext } from 'app/contexts/LayoutContext';
import { CampaignWrapper } from '../Campaign.styles';
import {
  CAMPAIGN_STATUS_OPTIONS,
  CAMPAIGN_STORE_VISIBLE_ON,
  CAMPAIGN_STORE_VISIBLE_OFF,
  CAMPAIGN_STATUS_CLOSED,
} from '../constants';
import { formatCommissionRate } from '../Campaign.helper';
import useCampaignList from './hooks/useCampaignList';
import useReloadCampaign from './hooks/useReloadCampaign';
import { ChannelAndStoreFilters } from './components/ListCampaignFilter';
import { useNavigate } from 'react-router-dom';
import ModalSyncCampaign from './components/modal/ModalSyncCampaign';
import Pagination from 'app/components/Pagination';
import ModalShowCampaign from './components/modal/ModalShowCampaign';
import CopyText from '../components/CopyText';
import { ChannelLogo } from '../components';

const { Text } = Typography;

const ListCampaign = () => {
  const { token } = theme.useToken();
  const { appendBreadcrumb } = useLayoutContext();
  const { handleLoadCampaigns, handleLoadCampaignsByIds, dataPartnerAccount, trackingData,
    clearTracking, isTracking, isCompleted,
    dataGetCampaign, loadingGetCampaigns, paginationData, refetchCampaigns,
    handleUpdateCampaignStoreVisible, loadingUpdateCampaignStoreVisible,
    totalEligibleCount, isLoadingInitial } = useCampaignList();
  const { reloadCampaign, loadingReloadCampaign } = useReloadCampaign();
  const navigate = useNavigate();

  const [showModalSyncCampaign, setShowModalSyncCampaign] = useState(false);

  const [showModalShowCampaign, setShowModalShowCampaign] = useState(false);
  const [pendingVisibleChange, setPendingVisibleChange] = useState<{
    campaignStoreId: number;
    checked: boolean;
  } | null>(null);

  const [reloadingCampaignId, setReloadingCampaignId] = useState<number | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<(string | number)[]>([]);

  useLayoutEffect(() => {
    appendBreadcrumb([
      {
        title: 'Quản lý tiếp thị liên kết',
        pathname: '/campaign-manage',
      },
      {
        title: 'Danh sách chiến dịch',
        pathname: '/campaign-manage/list-campaign',
      },
    ]);
  }, []);

  useEffect(() => {
    if (isCompleted) {
      refetchCampaigns();
    }
  }, [isCompleted, refetchCampaigns]);

  const tableData = useMemo(() => {
    if (!dataGetCampaign || !Array.isArray(dataGetCampaign)) return [];

    return dataGetCampaign.map((campaign: any) => {
      const stores = campaign?.stores ?? campaign?.store ?? [];
      const childRows = (Array.isArray(stores) ? stores : []).map((store: any) => {
        const hasError = !!store?.messageError;

        // Tạo row error nếu có messageError
        if (hasError) {
          const errorRow = {
            key: `error-${campaign?.id}-${store?.id}`,
            isCampaign: false,
            isErrorRow: true,
            errorMessage: store.messageError,
            store,
            campaign,
          };

          // Trả về mảng gồm store row và error row
          return [
            {
              key: `store-${campaign?.id}-${store?.id}`,
              isCampaign: false,
              isErrorRow: false,
              store,
              campaign,
            },
            errorRow,
          ];
        }

        // Không có error thì chỉ trả về store row
        return {
          key: `store-${campaign?.id}-${store?.id}`,
          isCampaign: false,
          isErrorRow: false,
          store,
          campaign,
        };
      }).flat(); // flatten mảng để có các row riêng biệt

      const normalizedChildRows = childRows.length
        ? childRows
        : [
          {
            key: `empty-store-${campaign?.id}`,
            isCampaign: false,
            isErrorRow: false,
            isEmptyStoreRow: true,
            campaign,
          },
        ];

      return {
        key: `campaign-${campaign?.id}`,
        isCampaign: true,
        campaign,
        children: normalizedChildRows,
      };
    });
  }, [dataGetCampaign]);

  // Mặc định mở tất cả chiến dịch khi đổi danh sách (phân trang / filter)
  useEffect(() => {
    if (!dataGetCampaign?.length) {
      setExpandedRowKeys([]);
      return;
    }

    const keys = dataGetCampaign
      .map((c: any) => c?.id)
      .filter((id: any) => id != null)
      .map((id: any) => `campaign-${id}`);

    setExpandedRowKeys(keys);
  }, [dataGetCampaign]);

  const formatCampaignDateRange = (campaign: any) => {
    const start = campaign?.startTime;
    const end = campaign?.endTime;
    if (!start && !end) return '--';
    const fmt = 'DD/MM/YYYY';
    const a = start ? dayjs(start).format(fmt) : '--';
    const b = end ? dayjs(end).format(fmt) : '--';
    return `${a} - ${b}`;
  };

  const renderStoreRowLead = (store: any, connectorChannelCode?: string) => {
    const storeName = store?.storeName ?? '--';
    return (
      <Flex gap={2} align="center" style={{ marginBottom: 4 }}>
        <div style={{ width: "20%" }}></div>
        <Flex gap={8} align="center" style={{ width: "100%" }}>
          <ChannelLogo
            code={connectorChannelCode}
            size={20}
            tooltip
            fallbackAsTag
          />
          <Text strong style={{ fontSize: 13 }}> {storeName ?? '--'}</Text>
        </Flex>
      </Flex>
    );
  };

  const renderCommission = (min?: number, max?: number, opts?: { emphasize?: boolean }) => {
    const formatted = formatCommissionRate(min, max);
    if (formatted === '--') {
      return <Text type="secondary">--</Text>;
    }
    return (
      <Text style={{ margin: 0, ...(opts?.emphasize ? { color: token.colorPrimary, fontWeight: 600 } : {}) }}>
        {formatted}
      </Text>
    );
  };

  const columns = [
    {
      title: 'Gian hàng',
      key: 'storeOrCampaignLead',
      width: 280,
      ellipsis: true,
      onCell: (record: any) => ({
        colSpan: record.isCampaign
          ? columns.length - 1
          : (record.isErrorRow ? columns.length : 1),
      }),
      render: (_: any, record: any) => {
        if (record.isCampaign) {
          const status = CAMPAIGN_STATUS_OPTIONS.find(
            (s: any) => s.value == record.campaign?.status
          );
          const expanded = expandedRowKeys.includes(record.key);

          return (
            <Flex align="center" gap={8} wrap="nowrap">
              {/* Icon expand */}
              {record.children?.length > 0 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    if (expanded) {
                      setExpandedRowKeys(expandedRowKeys.filter(key => key !== record.key));
                    } else {
                      setExpandedRowKeys([...expandedRowKeys, record.key]);
                    }
                  }}
                  className="custom-expand-icon"
                >
                  {expanded ?
                    <DownOutlined style={{ fontSize: 12 }} /> :
                    <RightOutlined style={{ fontSize: 12 }} />
                  }
                </span>
              )}

              <Flex vertical style={{ marginRight: 8 }}>
                <Text strong ellipsis={{ tooltip: record.campaign?.name || '--' }} style={{ fontSize: 14, flexShrink: 0 }}>
                  {record.campaign?.name || '--'}
                </Text>
                <Text type="secondary" style={{ fontSize: 12, flexShrink: 0 }}>ID: <CopyText hideIcon={false} text={record.campaign?.refCampaignId ?? '--'}>{record.campaign?.refCampaignId ?? '--'}</CopyText></Text>
              </Flex>
              {status ? (
                <Tag
                  color={status.color}
                  style={{ margin: 0, border: 'none', borderRadius: 14, padding: '4px 8px', flexShrink: 0 }}
                >
                  {status.label}
                </Tag>
              ) : null}
              <Text type="secondary" style={{ fontSize: 13, flexShrink: 0 }}>
                {formatCampaignDateRange(record.campaign)}
              </Text>
            </Flex>
          );
        }

        // Row error
        if (record.isErrorRow) {
          return (
            <Alert
              message={record.errorMessage}
              type="error"
              showIcon
              icon={<WarningOutlined />}
              style={{ padding: '8px 16px', borderRadius: 0 }}
            />
          );
        }

        if (record.isEmptyStoreRow) {
          return renderStoreRowLead({ storeName: 'Không có gian hàng đối tác' });
        }

        // Store row
        return renderStoreRowLead(record.store, record.campaign?.connectorChannelCode);
      },
    },
    {
      title: 'Tên chiến dịch',
      key: 'campaignNameOrMeta',
      width: 260,
      ellipsis: true,
      onCell: (record: any) => ({
        colSpan: record.isCampaign ? 0 : (record.isErrorRow ? 0 : 1),
      }),
      render: (_: any, record: any) => {
        if (record.isErrorRow) return null;
        if (record.isEmptyStoreRow) return <Text type="secondary">--</Text>;
        return <Text>{record.store?.campaignName ?? record.campaign?.name ?? '--'}</Text>;
      },
    },
    {
      title: (
        <Flex gap={4} align="center" justify="center">
          <Text>Hiển thị với nhà sáng tạo</Text>
          <Tooltip title="Khi bật hiển thị với nhà sáng tạo, nhà sáng tạo có thể thấy được thông tin chiến dịch.">
            <InfoCircleOutlined />
          </Tooltip>
        </Flex>
      ),
      key: 'displayCreator',
      align: 'center' as const,
      width: 150,
      onCell: (record: any) => ({
        colSpan: record.isCampaign ? 0 : (record.isErrorRow ? 0 : 1),
      }),
      render: (_: any, record: any) => {
        if (record.isCampaign || record.isErrorRow) return null;
        if (record.isEmptyStoreRow) return <Text type="secondary">--</Text>;

        const isClosed = record?.campaign?.status == CAMPAIGN_STATUS_CLOSED;
        const hasStoreError = !!record?.store?.messageError;
        const isVisibleOn =
          record?.store?.visibleToCreator == CAMPAIGN_STORE_VISIBLE_ON;
        const disableSwitchWhenError = hasStoreError && !isVisibleOn;

        return (
          <Flex align="center" justify="center" style={{ position: 'relative', width: '100%' }}>
            <Switch
              checked={isVisibleOn}
              disabled={isClosed || !record.store || disableSwitchWhenError}
              onChange={(checked) => {
                if (!record.store) return;
                setShowModalShowCampaign(true);
                setPendingVisibleChange({ campaignStoreId: record.store.id, checked: checked });
              }}
            />
          </Flex>
        );
      },
    },
    {
      title: 'Nhà sáng tạo tham gia',
      key: 'creatorJoinedCount',
      align: 'center' as const,
      width: 150,
      onCell: (record: any) => ({
        colSpan: record.isCampaign ? 0 : (record.isErrorRow ? 0 : 1),
      }),
      render: (_: any, record: any) => {
        if (record.isCampaign || record.isErrorRow) return null;
        if (record.isEmptyStoreRow) return <Text type="secondary">--</Text>;
        const creatorJoinedCount =
          record.store?.creatorJoinedCount ?? record.store?.creatorIdsJoinedCount;
        return <Text>{creatorJoinedCount}</Text>;
      },
    },
    {
      title: 'Sản phẩm đã duyệt',
      key: 'products',
      align: 'center' as const,
      width: 150,
      onCell: (record: any) => ({
        colSpan: record.isCampaign ? 0 : (record.isErrorRow ? 0 : 1),
      }),
      render: (_: any, record: any) => {
        if (record.isCampaign || record.isErrorRow) return null;
        if (record.isEmptyStoreRow) return <Text type="secondary">--</Text>;

        const productCount = record.store?.approvedProductCount;
        if (productCount == undefined || productCount == null) {
          return <Text type="secondary">--</Text>;
        }
        return <Text>{productCount}</Text>;
      },
    },
    {
      title: (
        <Flex gap={4} align="center" justify="center">
          <Text>Tổng tỷ lệ hoa hồng</Text>
        </Flex>
      ),
      key: 'agencyCommission',
      align: 'center' as const,
      width: 150,
      onCell: (record: any) => ({
        colSpan: record.isCampaign ? 0 : (record.isErrorRow ? 0 : 1),
      }),
      render: (_: any, record: any) => {
        if (record.isCampaign || record.isErrorRow) return null;
        if (record.isEmptyStoreRow) return <Text type="secondary">--</Text>;
        if (!record.store) return <Text type="secondary">--</Text>;
        return renderCommission(record.store.minTotalCommissionRate, record.store.maxTotalCommissionRate, { emphasize: true });
      },
    },
    {
      title: (
        <Flex gap={4} align="center" justify="center">
          <Text>Tổng tỉ lệ hoa hồng Quảng cáo cửa hàng</Text>
        </Flex>
      ),
      key: 'qcAgencyCommission',
      align: 'center' as const,
      width: 150,
      onCell: (record: any) => ({
        colSpan: record.isCampaign ? 0 : (record.isErrorRow ? 0 : 1),
      }),
      render: (_: any, record: any) => {
        if (record.isCampaign || record.isErrorRow) return null;
        if (record.isEmptyStoreRow) return <Text type="secondary">--</Text>;
        if (!record.store) return <Text type="secondary">--</Text>;
        return renderCommission(record.store.minTotalShopAdsCommissionRate, record.store.maxTotalShopAdsCommissionRate);
      },
    },
    {
      title: (
        <Flex gap={4} align="center" justify="center">
          <Text>Tỷ lệ hoa hồng của nhà sáng tạo </Text>
        </Flex>
      ),
      key: 'creatorCommission',
      align: 'center' as const,
      width: 150,
      onCell: (record: any) => ({
        colSpan: record.isCampaign ? 0 : (record.isErrorRow ? 0 : 1),
      }),
      render: (_: any, record: any) => {
        if (record.isCampaign || record.isErrorRow) return null;
        if (record.isEmptyStoreRow) return <Text type="secondary">--</Text>;
        if (!record.store) return <Text type="secondary">--</Text>;
        return renderCommission(record.store.minCreatorCommissionRate, record.store.maxCreatorCommissionRate);
      },
    },
    {
      title: (
        <Flex gap={4} align="center" justify="center">
          <Text>Tỷ lệ hoa hồng Quảng cáo cửa hàng của nhà sáng tạo</Text>
        </Flex>
      ),
      key: 'qcCreatorCommission',
      align: 'center' as const,
      width: 180,
      onCell: (record: any) => ({
        colSpan: record.isCampaign ? 0 : (record.isErrorRow ? 0 : 1),
      }),
      render: (_: any, record: any) => {
        if (record.isCampaign || record.isErrorRow) return null;
        if (record.isEmptyStoreRow) return <Text type="secondary">--</Text>;
        if (!record.store) return <Text type="secondary">--</Text>;
        return renderCommission(record.store.minCreatorShopAdsCommissionRate, record.store.maxCreatorShopAdsCommissionRate);
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      align: 'center' as const,
      width: 150,
      onCell: (record: any) => ({ colSpan: record.isErrorRow ? 0 : 1 }),
      render: (_: any, record: any) => {
        if (record.isErrorRow || record.isEmptyStoreRow) return null;

        if (!record.isCampaign) {
          return (
            <Tooltip title="Danh sách nhà sáng tạo">
              <Button
                type="text"
                icon={<TeamOutlined />}
                onClick={() => {
                  const campaignName = record.store?.campaignName || record.campaign?.name || '--';

                  const query = new URLSearchParams({
                    campaignName,
                    smeId: String(record.store?.smeId ?? ''),
                  });

                  window.open(`/campaign-manage/store/${record.store?.id}/register-campaign?${query.toString()}`, '_blank');
                }}
              />
            </Tooltip>
          );
        }

        const isClosed = record?.campaign?.status === CAMPAIGN_STATUS_CLOSED;

        const items: MenuProps["items"] = [
          !isClosed ? { label: "Tải lại chiến dịch", key: "reload" } : null,
          { label: "Chỉnh sửa chiến dịch", key: "edit" },
        ].filter(Boolean) as MenuProps["items"];

        const menuProps: MenuProps = {
          items,
          onClick: async ({ key }) => {
            if (key === "reload") {
              if (!record?.campaign?.id) return;

              try {
                setReloadingCampaignId(record.campaign.id);
                await reloadCampaign(record.campaign.id);
              } finally {
                setReloadingCampaignId(null);
              }
            }

            if (key === "edit") {
              navigate(`/campaign-manage/edit-campaign/${record.campaign?.id}`);
            }
          },
        };

        return (
          <Flex justify="center" align="center">
            <Dropdown menu={menuProps} trigger={["click"]}>
              <Button className="btn-base color-base" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} loading={reloadingCampaignId == record?.campaign?.id}>
                <Text className="color-base">Chọn</Text>
                <DownOutlined style={{ fontSize: 10 }} />
              </Button>
            </Dropdown>
          </Flex>
        );
      },
    },
  ];

  return (
    <CampaignWrapper>
      <Helmet
        titleTemplate="Danh sách chiến dịch"
        defaultTitle="Danh sách chiến dịch"
      >
        <meta
          name="description"
          content="Danh sách chiến dịch"
        />
      </Helmet>
      <ModalSyncCampaign
        show={showModalSyncCampaign}
        onHide={() => {
          setShowModalSyncCampaign(false);
          clearTracking();
        }}
        handleSyncCampaign={() => {
          const account = dataPartnerAccount?.[0];
          if (!account) return;
          const connectorChannelCode = account?.connector_channel_code;
          handleLoadCampaigns(connectorChannelCode, account?.id);
        }}
        handleSyncCampaignByIds={(ids) => {
          const account = dataPartnerAccount?.[0];
          if (!account) return;
          handleLoadCampaignsByIds(ids, account?.id, account?.connector_channel_code);
        }}
        isTracking={isTracking}
        isCompleted={isCompleted}
        trackingData={trackingData}
        totalEligibleCount={totalEligibleCount}
        isLoadingInitial={isLoadingInitial}
      />
      <ModalShowCampaign
        show={showModalShowCampaign}
        onHide={() => {
          setShowModalShowCampaign(false);
          setPendingVisibleChange(null);
        }}
        checked={pendingVisibleChange?.checked ?? false}
        onConfirm={() => {
          if (pendingVisibleChange) {
            handleUpdateCampaignStoreVisible({
              campaignStoreId: pendingVisibleChange.campaignStoreId,
              visibleToCreator: pendingVisibleChange.checked ? CAMPAIGN_STORE_VISIBLE_ON : CAMPAIGN_STORE_VISIBLE_OFF
            });
          }
          setShowModalShowCampaign(false);
          setPendingVisibleChange(null);
        }}
      />
      <Card>
        <ChannelAndStoreFilters />

        <Row>
          <Col
            span={24}
            style={{
              display: 'flex',
              justifyContent: 'end',
              margin: '16px 0',
            }}
          >
            <Button type="primary" onClick={() => {
              setShowModalSyncCampaign(true);
            }}>Tải chiến dịch</Button>
          </Col>
        </Row>

        <Table
          className="list-campaign-table"
          columns={columns as any}
          dataSource={tableData}
          pagination={false}
          scroll={{ x: 1600 }}
          bordered
          sticky={{ offsetHeader: 0 }}
          rowKey="key"
          expandable={{
            expandedRowKeys,
            onExpandedRowsChange: (keys) =>
              setExpandedRowKeys(keys.map(String) as (string | number)[]),
            indentSize: 0,
            expandIcon: () => null, // Tắt hoàn toàn expand icon mặc định
          }}
          rowClassName={(record: any) => {
            if (record.isCampaign) return 'campaign-parent-row';
            if (record.isErrorRow) return 'campaign-store-row-error';
            return 'campaign-store-row';
          }}
          loading={loadingGetCampaigns || loadingUpdateCampaignStoreVisible}
        />
        {paginationData && (
          <Pagination
            page={paginationData.page}
            totalPage={paginationData.totalPage}
            loading={loadingGetCampaigns}
            limit={paginationData.limit}
            totalRecord={paginationData.total}
            count={paginationData.count}
            basePath="/campaign-manage/list-campaign"
          />
        )}
      </Card>
    </CampaignWrapper>
  );
};

export default ListCampaign;
