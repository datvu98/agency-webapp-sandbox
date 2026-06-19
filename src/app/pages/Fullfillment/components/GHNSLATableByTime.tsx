import { Flex, Table, Typography } from "antd";
import { TableProps } from "antd/lib/table";
import React, { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";
import queryString from "querystring";
import { useFullfillmentContext } from "app/contexts/FullfillmentContext";
import ModalQuantityStatusGHN from "./ModalQuantityStatusGHN";

// const { Text } = Typography;

const STATUS = {
    total_order: "total_order",
    total_packing: "packing",
    total_packed: "packed",
    total_shipped: "shipping",
    total_unprocessed: "unprocessed",
};

const GHNSLATableByTime = (props: { data: any; type: string; variables: any }) => {
    const { optionsStore } = useFullfillmentContext();
    const params = queryString.parse(useLocation().search.slice(1, 100000));
    const time_from = params?.from ? Number(params?.from) : dayjs().startOf("day").unix();
    const time_to = params?.to ? Number(params?.to) : dayjs().endOf("day").unix();
    const fulfillment_by = params?.services ? Number(params?.services) : 2;
    const channel_codes = params?.channel_codes as string;
    const store_ids = params?.store_ids as string;

    const listStore = useMemo(() => {
        if (!!store_ids) {
            const storeIds = store_ids
                .split(',')
                .map(id => id.trim())
                .filter(id => /^\d+$/.test(id))
                .map(id => parseInt(id, 10));
            
            console.log(storeIds)

            return optionsStore
                ?.filter(st => storeIds.includes(parseInt(st.id, 10)))
                ?.map(st => {
                    return {
                        store_id: parseInt(st.id, 10),
                        name_store: st.name,
                        connector_channel_code: st.connector_channel_code,
                    };
                }) || [];
        }

        if (!!channel_codes) {
            const channelList = channel_codes.split(',').map(code => code.trim());
            return optionsStore
                ?.filter(st => channelList.includes(st.connector_channel_code))
                ?.map(st => {
                    return {
                        store_id: parseInt(st.id, 10),
                        name_store: st.name,
                        connector_channel_code: st.connector_channel_code,
                    };
                }) || [];
        }

        return [];
    }, [optionsStore, channel_codes, store_ids]);

    const [dataModal, setDataModal] = useState<any | null>(null);
    const [status, setStatus] = useState<string | undefined>();
    const [pivot, setPivot] = useState<string | undefined>();

    const openModal = useCallback(
        (statusKey: string, record: any) => {
            const statusValue = (STATUS as any)[statusKey];
            if (!statusValue) return;

            const storeIds = (listStore || []).map((st: any) => st.store_id);

            setStatus(statusValue);
            setPivot(record?.label);

            setDataModal({
                filter: {
                    fulfillment_by: [fulfillment_by],
                    list_source: props?.variables?.filter?.list_source,
                    range_time: [time_from, time_to],
                    list_store: storeIds,
                    pack_status: statusValue,
                    time_slot: record?.time_range_key,
                },
            });
        },
        [fulfillment_by, listStore, props?.variables?.filter, time_from, time_to]
    );

    const dataTable = useMemo(() => {
        return props?.data?.summary_by_time_slot?.map((item: any) => {
            const store = optionsStore?.find((op: any) => op?.value == item?.store_id);
            return {
                store: store || null,
                delivery_rate_packed: item.delivery_rate_packed,
                fast_delivery_rate: item.fast_delivery_rate,
                label: item.label,
                time_range_key: item.time_range_key,
                total_order: item.total_order,
                total_packed: item.total_packed,
                total_packing: item.total_packing,
                total_shipped: item.total_shipped,
                total_unprocessed: item.total_unprocessed,
            };
        });
    }, [props?.data?.summary_by_time_slot]);

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
        return [
            {
                title: "Khung giờ đặt hàng",
                dataIndex: "label",
                width: "22%",
                key: "label",
                align: "left",
            },
            {
                title: "Tỷ lệ giao nhanh (%)",
                dataIndex: "fast_delivery_rate",
                width: "13%",
                key: "fast_delivery_rate",
                align: "left",
                render: (item?: number, record?: any) => item ? getLabelRate(item, channel_codes) : (record?.total_order > 0 ? '0%' : '-'),
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
                render: (item: number, record: any) => (
                    <span
                        style={{ color: item > 0 ? "#ff4d4f" : "#000", cursor: item > 0 ? "pointer" : "default" }}
                        onClick={() => {
                            if (item <= 0) return;
                            openModal("total_packed", record);
                        }}
                    >
                        {item} {`(${record?.delivery_rate_packed || 0}%)`}
                    </span>
                ),
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
    }, [openModal, valueItem]);

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
                    reportByOrder={false}
                />
            )}
            <Table
                className="setting-table ant-upbase"
                dataSource={dataTable}
                columns={columns}
                bordered
                pagination={false}
                scroll={{ y: 500 }}
                rowKey="time_range_key"
            />
        </Flex>
    );
};

export default GHNSLATableByTime;