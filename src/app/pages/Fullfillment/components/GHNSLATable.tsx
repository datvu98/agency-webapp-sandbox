import { Flex, Table, Tooltip, Typography, Select } from "antd";
import { useFullfillmentContext } from "app/contexts/FullfillmentContext";
import React, { useCallback, useMemo, useState } from "react";
import type { TableProps } from "antd";
import { useLocation } from "react-router-dom";
import queryString from "querystring";
import dayjs from "dayjs";
import ModalQuantityStatusGHN from "./ModalQuantityStatusGHN";

const { Text } = Typography;

const STATUS = {
  total_order: "total_order",
  total_packing: "packing",
  total_packed: "packed",
  total_shipped: "shipping",
  total_unprocessed: "unprocessed",
};

const GHNSLATable = (props: { title: string; data: any; type: string; variables: any }) => {
  const { optionsStore } = useFullfillmentContext();
  const [selectedTimeRange, setSelectedTimeRange] = useState<string[]>([]);
  const [selectedRateFilter, setSelectedRateFilter] = useState<string>("all");

  const params = queryString.parse(useLocation().search.slice(1, 100000));
  const time_from = params?.from ? Number(params?.from) : dayjs().startOf("day").unix();
  const time_to = params?.to ? Number(params?.to) : dayjs().endOf("day").unix();
  const fulfillment_by = params?.services ? Number(params?.services) : 2;
  const channel_codes = params?.channel_codes as string;

  const passThreshold = channel_codes?.includes('tiktok') ? 95 : 85;

  const rateFilterOptions = useMemo(() => {
    return [
      { label: "Tất cả", value: "all" },
      { label: 'Đã đạt', value: "pass" },
      { label: 'Chưa đạt', value: "fail" },
    ];
  }, [passThreshold]);

  const [dataModal, setDataModal] = useState<any | null>(null);
  const [status, setStatus] = useState<string | undefined>();
  const [pivot, setPivot] = useState<string | undefined>();

  const openModal = useCallback(
    (statusKey: string, record: any) => {
      const statusValue = (STATUS as any)[statusKey];
      if (!statusValue || !record?.store) return;

      setStatus(statusValue);
      setPivot(record?.label);

      setDataModal({
        filter: {
          connector_channel_code: record?.store?.connector_channel_code,
          fulfillment_by: [fulfillment_by],
          list_source: props?.variables?.filter?.list_source,
          range_time: [time_from, time_to],
          list_store: [record.store.id],
          pack_status: statusValue,
          time_slot: record?.time_range_key,
        },
      });
    },
    [fulfillment_by, props?.variables?.filter, time_from, time_to]
  );

  // Base data (không filter)
  const baseDataTable = useMemo(() => {
    return (props?.data?.report_fast_delivery_by_store || []).flatMap((item: any) => {
      const store = optionsStore?.find((op: any) => op?.value == item?.store_id);
      const allSlots = item?.store_time_slots_report || [];

      return allSlots.map((slot: any, index: number) => {
        return {
          _fast_delivery_rate: item?.fast_delivery_rate,
          store_id: item?.store_id,
          ...slot,
          index,
          rowSpan: allSlots.length,
          store,
        };
      });
    });
  }, [props?.data?.report_fast_delivery_by_store, optionsStore]);

  // Filtered data (có áp dụng bộ lọc)
  const filteredDataTable = useMemo(() => {
    return (props?.data?.report_fast_delivery_by_store || []).flatMap((item: any) => {
      const store = optionsStore?.find((op: any) => op?.value == item?.store_id);
      const allSlots = item?.store_time_slots_report || [];

      const slots = allSlots.filter((slot: any) => {
        const matchTime =
          selectedTimeRange.length === 0 || selectedTimeRange.includes(slot?.label);

        const rate = slot?.fast_delivery_rate;

        if (selectedRateFilter === "all") return matchTime;
        if (rate == null || rate == undefined) return false;

        if (selectedRateFilter === "pass") {
          return matchTime && rate >= passThreshold;
        }

        if (selectedRateFilter === "fail") {
          return matchTime && rate < passThreshold;
        }

        return matchTime;
      });

      return slots.map((slot: any, index: number) => {
        return {
          _fast_delivery_rate: item?.fast_delivery_rate,
          store_id: item?.store_id,
          ...slot,
          index,
          rowSpan: slots.length,
          store,
        };
      });
    });
  }, [
    props?.data?.report_fast_delivery_by_store,
    optionsStore,
    selectedTimeRange,
    selectedRateFilter,
    passThreshold,
  ]);

  // Map để kiểm tra filter theo store
  const storeFilterMap = useMemo(() => {
    const map = new Map<string, { base: number; filtered: number }>();

    // base
    (baseDataTable || []).forEach((row: any) => {
      const key = row.store_id;
      if (!map.has(key)) { map.set(key, { base: 0, filtered: 0 }); }
      map.get(key)!.base += 1;
    });

    // filtered
    (filteredDataTable || []).forEach((row: any) => {
      const key = row.store_id;
      if (!map.has(key)) { map.set(key, { base: 0, filtered: 0 }); }
      map.get(key)!.filtered += 1;
    });

    return map;
  }, [baseDataTable, filteredDataTable]);

  const isFilteredByStore = useCallback(
    (storeId: string) => {
      const info = storeFilterMap.get(storeId);
      if (!info) return false;

      return info.filtered < info.base;
    },
    [storeFilterMap]
  );

  const timeRangeOptions = useMemo(() => {
    const set = new Set<string>();

    (props?.data?.report_fast_delivery_by_store || []).forEach((item: any) => {
      item?.store_time_slots_report?.forEach((slot: any) => {
        if (slot?.label) set.add(slot.label);
      });
    });

    return Array.from(set).map((label) => ({ label, value: label }));
  }, [props?.data?.report_fast_delivery_by_store]);

  /** Color theo rate */
  const getLabelRate = (value?: number, channel?: string) => {
    if (value == undefined || value == null) return <span>-</span>;

    let color = "";

    if (channel == "shopee") {
      if (value >= 85) color = "#41E432";
      else if (value >= 80) color = "#FFCC00";
      else color = "#ff4d4f";
    }

    if (channel == "tiktok") {
      if (value >= 95) color = "#41E432";
      else if (value >= 90) color = "#FFCC00";
      else color = "#ff4d4f";
    }

    return <span style={{ color }}>{value}%</span>;
  };

  /** Render clickable value with color */
  const valueItem = useCallback(
    (item: number, statusKey: string, record: any) => {
      return (
        <span
          style={{ color: item > 0 ? "#ff4d4f" : "#000", cursor: item > 0 ? "pointer" : "default" }}
          onClick={() => {
            if (item <= 0) return;
            openModal(statusKey, record);
          }}
        >
          {item}
        </span>
      );
    },
    [openModal]
  );

  const columns: TableProps<any>["columns"] = useMemo(() => {
    const rowSpanCell = (record: any) => {
      if (record?.index == 0) return { rowSpan: record?.rowSpan };
      return { rowSpan: 0 };
    };

    return [
      {
        title: "Gian hàng",
        dataIndex: "store_id",
        width: "18%",
        key: "store_id",
        fixed: true,
        render: (_: any, record: any) => (
          <div>
            {!!record?.store?.channel?.logo_asset_url && (
              <img
                src={record?.store?.channel?.logo_asset_url}
                style={{ width: 15, height: 15, marginRight: 4 }}
              />
            )}
            {record?.store?.name}
          </div>
        ),
        onCell: rowSpanCell,
        align: "left",
      },
      {
        title: (
          <div>
            <span className="pr-1">Tỷ lệ giao nhanh (%)</span>
            <Tooltip
              overlayStyle={{ pointerEvents: "none" }}
              title={
                "Tỉ lệ giao hàng nhanh gian hàng = Số lượng đơn đúng hạn/Tổng số lượng đơn phát sinh * 100%"
              }
            >
              <i className="bi bi-info-circle" />
            </Tooltip>
          </div>
        ),
        dataIndex: "_fast_delivery_rate",
        width: "14%",
        key: "_fast_delivery_rate",
        onCell: rowSpanCell,
        render: (item?: number, record?: any) => {
          const isFiltered = isFilteredByStore(record?.store_id);
          
          if (isFiltered) return "-";
          
          return item
            ? getLabelRate(item, record?.store?.connector_channel_code)
            : record?.total_order > 0
            ? "0%"
            : "-";
        },
        align: "left",
      },
      {
        title: "Thời gian đặt hàng",
        dataIndex: "label",
        width: "13%",
        key: "label",
        render: (item: any, record: any) => (
          <div>
            {item} &nbsp;
            {(record?.time_range_key == "shopee_evening_n" ||
              record?.time_range_key == "tiktok_after_n") && (
                <Tooltip
                  overlayStyle={{ pointerEvents: "none" }}
                  title={"Theo dõi số lượng đơn cần xử lý cho ngày tiếp theo"}
                >
                  <i className="bi bi-info-circle" />
                </Tooltip>
              )}
          </div>
        ),
        align: "left",
      },
      {
        title: (
          <div>
            <span className="pr-1">Tỉ lệ giao nhanh theo khung giờ (%)</span>
            <Tooltip
              overlayStyle={{ pointerEvents: "none" }}
              title={
                "Tỉ lệ giao hàng nhanh theo khung giờ = Số lượng đơn đúng hạn phát sinh theo khung giờ đó / Tổng số lượng đơn phát sinh theo khung giờ đó * 100%"
              }
            >
              <i className="bi bi-info-circle" />
            </Tooltip>
          </div>
        ),
        dataIndex: "fast_delivery_rate",
        width: "13%",
        key: "fast_delivery_rate",
        render: (item?: number, record?: any) =>
          item ? getLabelRate(item, record?.store?.connector_channel_code) : (record?.total_order > 0 ? '0%' : '-'),
        align: "left",
      },
      {
        title: "Tổng đơn hàng",
        dataIndex: "total_order",
        width: "13%",
        key: "total_order",
        align: "left",
        render: (item: number, record: any) => valueItem(item, "total_order", record),
      },
      {
        title: "Đang đóng gói",
        dataIndex: "total_packing",
        width: "13%",
        key: "total_packing",
        align: "left",
        render: (item: number, record: any) => valueItem(item, "total_packing", record),
      },
      {
        title: "Chờ lấy hàng",
        dataIndex: "total_packed",
        width: "13%",
        key: "total_packed",
        align: "left",
        render: (item: number, record: any) => {
          return (
            <span
              style={{ color: item > 0 ? "#ff4d4f" : "#000", cursor: item > 0 ? "pointer" : "default" }}
              onClick={() => {
                if (item <= 0) return;
                openModal("total_packed", record);
              }}
            >
              {item}{' '}
              {`(${record?.delivery_rate_packed || 0}%)`}
            </span>
          );
        },
      },
      {
        title: "Đã bàn giao ĐVVC",
        dataIndex: "total_shipped",
        width: "13%",
        key: "total_shipped",
        align: "left",
        render: (item: number, record: any) => valueItem(item, "total_shipped", record),
      },
      {
        title: "Cần xử lý",
        dataIndex: "total_unprocessed",
        width: "13%",
        key: "total_unprocessed",
        align: "left",
        render: (item: number, record: any) => valueItem(item, "total_unprocessed", record),
      },
    ];
  }, [openModal, valueItem, isFilteredByStore]);

  return (
    <Flex vertical gap={20}>
      {!!dataModal && (
        <ModalQuantityStatusGHN
          open={!!dataModal}
          title="Số lượng đơn theo gian hàng"
          dataModal={dataModal}
          onHide={() => setDataModal(null)}
          status={status}
          pivot={pivot}
          filterStore={false}
          reportByOrder={true}
        />
      )}
      <Flex justify="space-between" align="center">
        <Text className="title-card" strong>
          {props?.title}
        </Text>

        <Flex align="center" gap={10}>
          <FilterIcon />
          <Text>Lọc: </Text>
          <Select
            mode="multiple"
            style={{ width: 390 }}
            options={timeRangeOptions}
            value={selectedTimeRange}
            placeholder="Tất cả khung giờ"
            onChange={(value) => {
              setSelectedTimeRange(value);
            }}
            allowClear
            maxTagCount='responsive'
            maxTagPlaceholder={(omittedValues) => {
              const hiddenTimeRanges = timeRangeOptions?.filter(option => 
                omittedValues.map((option) => option?.key).includes(option?.value)
              );
              return (
                <Tooltip
                  overlayStyle={{
                    pointerEvents: 'none',
                  }}
                  title={hiddenTimeRanges?.map(item => item?.label).join(', ')}
                >
                  <span>+ {omittedValues?.length} khung giờ</span>
                </Tooltip>
              );
            }}
          />
          <Select
            style={{ minWidth: 220 }}
            options={rateFilterOptions}
            value={selectedRateFilter}
            onChange={(value) => {
              setSelectedRateFilter(value);
            }}
          />
        </Flex>
      </Flex>

      <Table
        className="setting-table ant-upbase"
        dataSource={filteredDataTable}
        columns={columns}
        bordered
        pagination={false}
        scroll={{ y: 500 }}
        rowKey={(r) => `${r.store_id}-${r.time_range_key}`}
      />
    </Flex>
  );
};

export default GHNSLATable;

const FilterIcon = () => { 
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.6975 17.4475C11.5453 17.4474 11.396 17.4056 11.2659 17.3267L8.48754 15.66C8.17494 15.4715 7.91618 15.2056 7.73621 14.888C7.55624 14.5704 7.46113 14.2117 7.46004 13.8467V10.0758C7.46058 9.80971 7.37782 9.55008 7.22337 9.33335L3.34421 3.88168C3.25363 3.75583 3.19957 3.6074 3.18801 3.45277C3.17645 3.29814 3.20783 3.14332 3.27869 3.00539C3.34955 2.86747 3.45713 2.7518 3.58957 2.67115C3.722 2.5905 3.87415 2.548 4.02921 2.54835H15.9709C16.1261 2.5477 16.2784 2.59001 16.411 2.6706C16.5436 2.75119 16.6514 2.8669 16.7223 3.00494C16.7932 3.14297 16.8245 3.29794 16.8128 3.45268C16.8011 3.60742 16.7468 3.7559 16.6559 3.88168L12.7767 9.33335C12.622 9.54998 12.5389 9.80962 12.5392 10.0758V16.6042C12.539 16.8275 12.4503 17.0416 12.2925 17.1997C12.1348 17.3577 11.9208 17.4469 11.6975 17.4475ZM4.02921 3.38585L7.90171 8.85001C8.15835 9.20705 8.29545 9.63614 8.29337 10.0758V13.8458C8.29368 14.067 8.35116 14.2844 8.46023 14.4769C8.5693 14.6693 8.72625 14.8303 8.91587 14.9442L11.6942 16.6108L11.7059 10.075C11.704 9.63522 11.8414 9.20612 12.0984 8.84918L15.9767 3.39751L4.02921 3.38585Z" fill="#343434" />
    </svg>
  )
}