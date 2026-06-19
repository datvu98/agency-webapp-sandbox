import React, { useMemo } from "react";
import { Table } from "antd";
import Pagination from "app/components/Pagination";
import { useLocation } from "react-router-dom";
import { Flex, Typography, Image, Button, Dropdown } from "antd";
import { formatNumberToCurrency } from "utils/helper";
import { OPTIONS_PROTOCOL_OUT, STATUS_BILL_OUT_OPTIONS } from "../constants";
import dayjs from "dayjs";
import { MenuProps } from "antd/lib/menu";
import { DownOutlined } from "@ant-design/icons";

const { Text } = Typography;

const WarehouseBillOutListTable = ({ dataTable, dataPagination, refetch, error, optionsWarehouse, optionsStore, optionsBrand }) => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);

    const page = useMemo(() => {
        try {
            let _page = Number(params.get("page"));
            if (!Number.isNaN(_page)) {
                return Math.max(1, _page);
            } else {
                return 1;
            }
        } catch (error) {
            return 1;
        }
    }, [params?.get("page")]);

    const limit = useMemo(() => {
        try {
            let _value = Number(params.get("limit"));
            if (!Number.isNaN(_value)) {
                return Math.max(25, _value);
            } else {
                return 25;
            }
        } catch (error) {
            return 25;
        }
    }, [params?.get("limit")]);

    const columns = [
        {
            title: "Mã phiếu",
            dataIndex: "code",
            key: "code",
            width: 250,
            render: (_item, record) => {
                return (
                    <Flex vertical>
                        <Text>{record?.code}</Text>
                        {record?.protocol == 0 && (
                            <>
                                <Text style={{ color: "#888484" }}>
                                    Mã đơn hàng:
                                </Text>
                                <Text>{record?.orderCode || "--"}</Text>
                                <Text style={{ color: "#888484" }}>
                                    Mã vận đơn:
                                </Text>
                                <Text>{record?.shippingCode || "--"}</Text>
                            </>
                        )}
                    </Flex>
                );
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "fulfillmentStatus",
            key: "fulfillmentStatus",
            width: 250,
            render: (_item, record) => {
                const status = STATUS_BILL_OUT_OPTIONS?.find(opt => opt?.value == record?.fulfillmentStatus)
                return (
                    <Flex vertical>
                        <Text>{status?.label || '--'}</Text>
                    </Flex>
                );
            },
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            width: 200,
            align: "center",
            render: (_item, record) => {
                let colorText = "#000";
                if (record?.totalQuantity > record?.totalQuantityPlan) {
                    colorText = "#0ADC70";
                } else if (record?.totalQuantity < record?.totalQuantityPlan) {
                    colorText = "#ff2a2d";
                }

                return (
                    <Flex vertical gap={8} align="start">
                        <Flex gap={8} align="center">
                            <Text>Số lượng hàng hóa:</Text>
                            <Text strong>
                                {formatNumberToCurrency(record?.totalVariants || 0)}
                            </Text>
                        </Flex>

                        <Flex gap={8} align="center">
                            <Text>Số lượng xuất kho:</Text>
                            <Text strong>
                                {formatNumberToCurrency(record?.totalQuantity || 0)}
                            </Text>
                        </Flex>
                    </Flex>
                );
            },
        },
        {
            title: "Kho",
            dataIndex: "warehouse",
            key: "warehouse",
            width: 250,
            align: "center",
            render: (_item, record) => {
                const warehouse = optionsWarehouse?.find((item) => item?.value == record?.warehouseId);
                const store = optionsStore?.find((item) => item?.value == record?.storeId);

                return (
                    <Flex vertical align="start" gap={8}>
                        {/* Kho */}
                        <Flex vertical gap={2} align="start">
                            <Text style={{ color: "#888484" }}>Kho:</Text>
                            <Text>{warehouse?.label || "--"}</Text>
                        </Flex>

                        {/* Gian hàng */}
                        <Flex vertical gap={2} align="start">
                            <Text style={{ color: "#888484" }}>Gian hàng:</Text>

                            {!!store ? (
                                <Flex gap={6} align="center">
                                    <Image
                                        width={16}
                                        height={16}
                                        src={store?.channel?.logo_asset_url}
                                        style={{ display: "block" }}
                                    />
                                    <Text>{store?.name}</Text>
                                </Flex>
                            ) : (
                                <Text>--</Text>
                            )}
                        </Flex>
                    </Flex>
                )
            }
        },
        {
            title: "Nhãn hàng",
            dataIndex: "brand",
            key: "brand",
            width: 200,
            align: "center",
            render: (_item, record) => {
				const brand = optionsBrand?.find((item) => item?.value == record?.brandId);
				return <Text>{brand?.label}</Text>;
			},
        },
        {
            title: "Hình thức",
            dataIndex: "protocol",
            key: "protocol",
            width: 200,
            align: "center",
            render: (_item, record) => {
                const parseProtocol = OPTIONS_PROTOCOL_OUT.find((protocol) => protocol?.value == record?.protocol);
                return <Text>{parseProtocol?.label || '--'}</Text>;
            },
        },
        {
            title: "Thời gian",
            dataIndex: "time",
            key: "time",
            width: 200,
            render: (_item, record) => {
                return (
                    <Flex vertical>
                        <Text style={{color: '#888484'}}>Thời gian tạo:</Text>
                        <Text>{dayjs(record?.createdAt).format("DD/MM/YYYY HH:mm")}</Text>
                        <Text style={{color: '#888484'}}>Thời gian xuất kho:</Text>
                        <Text>{record?.processedAt ? dayjs(record?.processedAt).format("DD/MM/YYYY HH:mm") : "--"}</Text>
                    </Flex>
                )
            }
        },
        // API chưa đáp ứng được

        {
            title: "Thao tác",
			dataIndex: "action",
			key: "action",
			width: 150,
			align: "center",
            render: (_item, record) => {
                const handleMenuClick: MenuProps["onClick"] = async ({ key }) => {
                    if (key == "detail") {
                        window.open(`${location.pathname}/${record?.id}`, '_blank');
                    }
                };
                const items: any = [
					{
						label: "Xem chi tiết",
						key: "detail",
						status: []
					},
				];
				const menuProps = {
					items,
					onClick: handleMenuClick,
				};
				return (
					<Dropdown menu={menuProps}>
						<Button className="btn-base color-base">
							<Flex align="center" gap={4} justify="center">
								<Text className="color-base">Chọn</Text>
								<DownOutlined style={{ fontSize: 10 }} />
							</Flex>
						</Button>
					</Dropdown>
				);
            }
        }
    ];

    let totalRecord = dataPagination?.totalItems || 0;
	let totalPage = Math.ceil(totalRecord / limit);

    return (
        <>
            <Table
                className="setting-table ant-upbase"
                columns={columns as any}
                dataSource={dataTable || []}
                bordered
                tableLayout="auto"
                sticky={{ offsetHeader: 0 }}
                scroll={{ x: "max-content" }}
                pagination={false}
                style={{
                    marginTop: 10,
                }}
            />
            {!error && ( <Pagination
                page={page}
                totalPage={totalPage}
                limit={limit}
                totalRecord={totalRecord}
                count={dataTable?.length}
                basePath={`${location.pathname}`}
                emptyTitle={"Không có dữ liệu"}
                options={[
                    { label: 25, value: 25 },
                    { label: 50, value: 50 },
                    { label: 100, value: 100 },
                ]}
            />
            )}
        </>
    );
};

export default WarehouseBillOutListTable;
