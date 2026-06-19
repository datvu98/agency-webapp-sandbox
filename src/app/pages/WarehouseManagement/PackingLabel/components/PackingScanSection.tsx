import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Col, Dropdown, Flex, Input, Row, Space, Spin, Table, Tooltip, Typography } from "antd";
import { MenuProps } from "antd/lib/menu";
import Pagination from "app/components/Pagination";
import dayjs from "dayjs";
import _ from "lodash";
import queryString from "querystring";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { printFromS3, showAlert } from "utils/helper";
import { queryProcessingListItemByWhBill, queryWarehouseBillList, queryWorkSessionDeviceRuntime } from "../helpers";
import { useLazyQuery, useMutation } from "@apollo/client";
import mutate_startPacking from "graphql/mutations/mutate_startPacking";
import ModalInfo from "../dialogs/ModalInfo";
import query_warehouseBillPrintLabel from "graphql/queries/query_warehouseBillPrintLabel";
const { Text } = Typography;

const PackingScanSection = ({currentWorkStation}) => {
	const location = useLocation();
	const navigate = useNavigate();
	const inputRefOrder = useRef<any>(null);
	const [value, setValue] = useState('');
	const [showInfo, setShowInfo] = useState<any>({
		show: false,
		dataInfo: {}
	})

	useEffect(() => {
		const timer = setTimeout(() => {
			inputRefOrder.current?.focus();
		}, 100);
	
		return () => clearTimeout(timer);
	}, []);

	const [warehouseBillPrintLabel, { loading: loadingWarehouseBillPrintLabel  }] = useLazyQuery(query_warehouseBillPrintLabel, {
			fetchPolicy: "network-only",
		});

	const onScanPackage = async (data) => {
		try {
			if (!data) {
				showAlert.error('Vui lòng nhập/quét mã thiết bị chứa hàng!')
				return 
			}

			let processingListItem = await queryProcessingListItemByWhBill([Number(data)])
			if (!!processingListItem) {
				let warehouseBillList = await queryWarehouseBillList([Number(processingListItem?.warehouseBillId)])
				if (warehouseBillList?.length) {
					setShowInfo({
						show: true,
						dataInfo: {
							...processingListItem,
							warehouseBill: warehouseBillList?.[0]
						}
					})
				} else {
					showAlert.error('Không tìm thấy phiếu xuất kho')
				}
			} else {
				showAlert.error('Không tìm thấy mã vận đơn tạm')
			}
			if (inputRefOrder.current) {
				inputRefOrder.current.focus();
				setValue('')
			}
		} catch (e) {
			console.log("onScanPackage error:", e);
		}
	};

	return (
		<Spin spinning={loadingWarehouseBillPrintLabel}>
			{showInfo?.show && <ModalInfo 
				show={showInfo?.show}
				onHide={() => {
					setShowInfo({
						show: false,
						dataInfo: {}
					})
					inputRefOrder.current.focus();
				}}
				onConfirm={async () => {
					let {data} = await warehouseBillPrintLabel({
						variables: {
							id: Number(showInfo?.dataInfo?.warehouseBill?.id)
						}
					})
					if (data?.warehouseBillPrintLabel?.success) {
						printFromS3(data?.warehouseBillPrintLabel?.data)
					} else {
						showAlert.error(data?.warehouseBillPrintLabel?.message || 'In vận đơn thất bại')
					}
					setShowInfo({
						show: false,
						dataInfo: {}
					})
					inputRefOrder.current.focus();
				}}
				dataInfo={showInfo?.dataInfo}
			/>}
			<Row justify={"center"} style={{marginBottom: 20}}>
				<Col span={10}>
					<Flex vertical align="center" gap={10}>
						<Text strong style={{ fontSize: 30 }}>
							Đóng gói lại vận đơn
						</Text>
						<Text style={{ color: "#d48e5b", fontSize: 18 }}>Quét mã vận đơn tạm để đóng gói</Text>
						<Input
							ref={inputRefOrder}
							placeholder={"Quét mã vận đơn tạm để đóng gói"}
							prefix={<SearchOutlined />}
							size="large"
							onChange={(e) => setValue(e.target.value)}
							value={value}
							onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
								const value = e.currentTarget.value;
								if (e.keyCode === 13 && value) {
									onScanPackage(value);
									// history.push(
									// `/orders/scan-order-packing?${queryString.stringify({
									//     ...params,
									//     q: e.target.value,
									// })}`
									// );
								}
							}}
						/>
					</Flex>
				</Col>
			</Row>
		</Spin>
	);
};

export default PackingScanSection;
