import { Button, Flex, Typography, Tabs, Dropdown, Table, Image, Spin } from "antd";
import React, { useMemo, useState } from "react";
import { formatNumberToCurrency, showAlert } from "utils/helper";
import { useLocation, useNavigate } from "react-router-dom";
import { MenuProps } from "antd/lib/menu";
import { DownOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import Pagination from "app/components/Pagination";
import { OPTIONS_PROTOCOL, STATUS_BILL_OPTIONS, TABS } from "../constants";
import { omit } from "lodash";
import queryString from "querystring";
import { useLazyQuery, useMutation } from "@apollo/client";
import mutate_warehouseBillCheckin from "graphql/mutations/mutate_warehouseBillCheckin";
import mutate_warehouseBillComplete from "graphql/mutations/mutate_warehouseBillComplete";
import query_warehouseBillInValidInboundItems from "graphql/queries/query_warehouseBillInValidInboundItems";
import ModalWarning from "../dialogs/ModalWarning";
import query_warehouseBillGenerateInboundHandoverReport from "graphql/queries/query_warehouseBillGenerateInboundHandoverReport";
import HtmlPrint from "app/components/HTMLPrint";

const { Text, Paragraph } = Typography;

const WarehouseBillInListTable = ({ dataTable, refetch, error, dataPagination, optionSubUsers, optionsWarehouse, optionSmes, relateBill, optionsStore, optionsBrand }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const params = new URLSearchParams(location.search);
	const queryParams = Object.fromEntries(params.entries());
	const [showWarning, setShowWarning] = useState({
		show: false,
		dataWarning: [],
		id: 0
	})
	const [html, setHtml] = useState<string>('');
    const [namePrint, setNamePrint] = useState('');

	const [warehouseBillCheckin, {loading: loadingWarehouseBillCheckin}] = useMutation(mutate_warehouseBillCheckin, {
		awaitRefetchQueries: true,
		refetchQueries: ['warehouseBillListWithPagination', 'warehouseBillCount']
	})

	const [warehouseBillGenerateInboundHandoverReport, {loading: loadingWarehouseBillGenerateInboundHandoverReport}] = useLazyQuery(query_warehouseBillGenerateInboundHandoverReport)

	const [warehouseBillInValidInboundItems, {loading: loadingWarehouseBillInValidInboundItems}] = useLazyQuery(query_warehouseBillInValidInboundItems, {
		fetchPolicy: 'cache-and-network'
	})

	const [warehouseBillComplete, {loading: loadingWarehouseBillComplete}] = useMutation(mutate_warehouseBillComplete, {
		awaitRefetchQueries: true,
		refetchQueries: ['warehouseBillListWithPagination', 'warehouseBillCount']
	})

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
	}, [params.get("page")]);

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
	}, [params.get("limit")]);

	const handleCheckin = async (id) => {
		let {data} = await warehouseBillCheckin({
			variables: {
				where: {
					id: {
						_eq: id
					}
				}
			}
		})
		if (data?.warehouseBillCheckin?.success && data?.warehouseBillCheckin?.data?.errors?.length == 0) {
			showAlert.success('Check-in phiếu nhập kho thành công')
		} else {
			showAlert.error(data?.warehouseBillCheckin?.data?.errors?.[0]?.message || data?.warehouseBillCheckin?.message || 'Check-in phiếu nhập kho thất bại')
		}
	}

	const handlePrint = async (id) => {
		let {data} = await warehouseBillGenerateInboundHandoverReport({
			variables: {
				id: Number(id)
			}
		})
		if (data?.warehouseBillGenerateInboundHandoverReport?.success) {
			setHtml(data?.warehouseBillGenerateInboundHandoverReport?.data);
			console.log(data?.warehouseBillGenerateInboundHandoverReport?.data)
			setNamePrint('In_phiếu_nhập_kho');
		} else {
			showAlert.error(data?.warehouseBillGenerateInboundHandoverReport?.message || 'In phiếu nhập kho thất bại')
		}
	}

	const handleComplete = async (id) => {
		let {data} = await warehouseBillComplete({
			variables: {
				id: id
			}
		})
		if (data?.warehouseBillComplete?.success) {
			showAlert.success('Hoàn thành phiên nhập hàng thành công')
		} else {
			showAlert.error(data?.warehouseBillComplete?.message || 'Hoàn thành phiên nhập hàng thất bại')
		}
	}
	const columns = [
		{
			title: "Mã phiếu",
			dataIndex: "code",
			key: "code",
			width: 250,
			render: (_item, record) => {
				let billFound: any = null;
				if (record?.relatedWarehouseBillId && relateBill?.length) {
					billFound = relateBill?.find((bill) => bill?.id == record?.relatedWarehouseBillId);
				}
				return (
					<Flex vertical>
						<Text>{record?.code}</Text>
						{record?.protocol == 0 && (
							<>
								<Text style={{ color: "#888484" }}>Mã đơn hàng:</Text>
								<Text>{record?.orderCode || "--"}</Text>
								<Text style={{ color: "#888484" }}>Mã vận đơn:</Text>
								<Text>{record?.shippingCode || "--"}</Text>
							</>
						)}
						{record?.relatedWarehouseBillId && (
							<>
								<Text style={{ color: "gray" }}>Phiếu liên quan:</Text>
								<Text>{billFound?.code || "--"}</Text>
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
				const status = STATUS_BILL_OPTIONS?.find(opt => opt?.value == record?.fulfillmentStatus)
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
                let colorText = '#000'
                if (record?.totalQuantity > record?.totalQuantityPlan) {
                    colorText = "#0ADC70";
                } else if (record?.totalQuantity < record?.totalQuantityPlan) {
                    colorText = "#ff2a2d";
                }
				return <Flex vertical gap={4} align="start">
                <Flex align="center" gap={4}>
                    <Text>Số lượng hàng hóa:</Text>
                    <Text strong>
                        {formatNumberToCurrency(record?.totalVariants || 0)}
                    </Text>
                </Flex>
                <Paragraph ellipsis={{rows: 1}}>
                    <Flex align="center" gap={4}>
                    <Text>Nhập kho:</Text>
                    {["complete", "end"].includes(record?.status) ? (
                        <Text>
                            <Text strong style={{ color: colorText }}>
                                {formatNumberToCurrency(record?.totalQuantity || 0)}
                            </Text>
                            /
                        </Text>
                    ) : (
                        <></>
                    )}
                    <Text strong>
                        {formatNumberToCurrency(record?.totalQuantityPlan) || 0}
                    </Text>
                    </Flex>
                </Paragraph>
            </Flex>;
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
				return <Flex vertical align="start">
                    <Text style={{ color: "#888484" }}>Kho:</Text>
					<Text>{warehouse?.label || "--"}</Text>
					<Text style={{ color: "#888484" }}>Gian hàng:</Text>
					{!!store ? 
                        <Flex gap={4} align="center">
                            <Image width={16} height={16} src={store?.channel?.logo_asset_url}/>
                            <Text>{store?.name}</Text>
                        </Flex>
                    : <Text>--</Text>}
                </Flex>
			},
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
                const parseProtocol = OPTIONS_PROTOCOL.find((protocol) => protocol?.value == record?.protocol);
				return <Text>{parseProtocol?.label || '--'}</Text>;
			},
		},
		{
			title: "Thời gian",
			dataIndex: "time",
			key: "time",
			width: 200,
			align: "center",
			render: (_item, record) => {
				return <Flex vertical>
                <Text style={{color: '#888484'}}>Thời gian tạo:</Text>
                <Text>{dayjs(record?.createdAt).format("DD/MM/YYYY HH:mm")}</Text>
                <Text style={{color: '#888484'}}>Thời gian cập nhật:</Text>
                <Text>{record?.updatedAt ? dayjs(record?.updatedAt).format("DD/MM/YYYY HH:mm") : "--"}</Text>
            </Flex>
			},
		},
		{
			title: "Tài khoản thao tác",
			dataIndex: "user",
			key: "user",
			width: 200,
			align: "center",
			render: (_item, record) => {
                let creator = ''
				switch (record?.status) {
                    case "complete":
                        creator = record?.completedByName;
                        break
                    case "end":
                        creator = record?.completedByName;
                        break
                    case "waiting":
                        creator = record?.approvedByName;
                        break
                    default:
                        creator = record?.canceledByName;
                }
				return <Text>{creator || "--"}</Text>;
			},
		},

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
					if (key == 'checkin') {
						handleCheckin(record?.id)
					}

					if (key == 'print') {
						handlePrint(record?.id)
					}
					if (key == 'complete') {
						const {data: dataInboundValid} = await warehouseBillInValidInboundItems({
							variables: {
								id: record?.id
							}
						})
						if (!!dataInboundValid?.warehouseBillInValidInboundItems?.data?.length) {
							setShowWarning({
								show: true,
								dataWarning: dataInboundValid?.warehouseBillInValidInboundItems?.data,
								id: record?.id
							})
						} else {
							handleComplete(record?.id)
						}
					}
				};
				const items: any = [
					{
						label: "Xem chi tiết",
						key: "detail",
						status: []
					},
					{
						label: "In phiếu phập",
						key: "print",
						status: []
					},
					((record?.status == 'waiting') ? {
						label: "Check-in",
						key: "checkin",
					} : null),
					{
						label: "Hoàn thành đóng nhận hàng",
						key: "complete",
					}
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
			},
		},
	];

	let totalRecord = dataPagination?.totalItems || 0;
	let totalPage = Math.ceil(totalRecord / limit);
	return (
		<Spin spinning={loadingWarehouseBillCheckin || loadingWarehouseBillComplete || loadingWarehouseBillInValidInboundItems || loadingWarehouseBillGenerateInboundHandoverReport}>
			{html && namePrint && <HtmlPrint
				setNamePrint={setNamePrint}
				html={html}
				setHtml={setHtml}
				namePrint={namePrint}
			/>}
			{showWarning?.show && <ModalWarning 
			show={showWarning?.show} 
			onHide={() => {
				setShowWarning({
					show: false,
					dataWarning: [],
					id: 0
				})
			}}
			onConfirm={() => {
				handleComplete(showWarning?.id)
				setShowWarning({
					show: false,
					dataWarning: [],
					id: 0
				})
			}}
			dataError={showWarning?.dataWarning}
			/>}
			<Table
				className="setting-table ant-upbase"
				dataSource={dataTable || []}
				columns={columns as any}
				bordered
				tableLayout="auto"
				sticky={{ offsetHeader: 0 }}
				scroll={{ x: "max-content" }}
				pagination={false}
				style={{
					marginTop: 10
				}}
			/>
			{!error && (
				<Pagination
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
		</Spin>
	);
};

export default WarehouseBillInListTable;
