import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import { Alert, Button, Col, Dropdown, Flex, Input, Row, Space, Spin, Table, Tooltip, Typography } from "antd";
import { MenuProps } from "antd/lib/menu";
import Pagination from "app/components/Pagination";
import dayjs from "dayjs";
import _ from "lodash";
import queryString from "querystring";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { showAlert } from "utils/helper";
import { queryStorageEquipmentbyIds, queryWorkSessionDeviceRuntime } from "../helpers";
import { useMutation, useQuery } from "@apollo/client";
import mutate_startPacking from "graphql/mutations/mutate_startPacking";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import query_workSessionWithPagination from "graphql/queries/query_workSessionWithPagination";
const { Text } = Typography;

const PackingScanSection = ({currentWorkStation}) => {
	const { user } = useSelector(selectGlobalSlice);
	const location = useLocation();
	const navigate = useNavigate();
	const inputRefOrder = useRef<any>(null);
	const [value, setValue] = useState('');
	const [activeWork, setActiveWork] = useState<any>(null)

	const {
		loading: loadingDataWorkSession,
		data: dataWorkSession,
		refetch: refetchWorkSession,
		error,
	} = useQuery(query_workSessionWithPagination, {
		fetchPolicy: "no-cache",
		variables: {
			where: {
				picId: {
					_eq: user?.id,
				},
				status: {
					_in: ["ACTIVE", "PAUSED"],
				},
				picType: {
					_eq: user?.is_subuser ? "0" : "1",
				},
				work: {
					type: {
						_eq: "PACK",
					},
				},
			},
		},
		skip: !user?.id,
		onCompleted: async (data) => {
			if (data?.workSessionWithPagination?.data?.length) {
				const currentWorkSS = dataWorkSession?.workSessionWithPagination?.data?.[0]
				const deviceInWorkSS = currentWorkSS?.devices?.[0]
				if (!!deviceInWorkSS?.storageEquipmentId) {
					let detailDevice = await queryStorageEquipmentbyIds([deviceInWorkSS?.storageEquipmentId])
					setActiveWork({
						...currentWorkSS,
						deviceInfo: detailDevice
					})
				}
			}
		}
	});
	useEffect(() => {
		const timer = setTimeout(() => {
			inputRefOrder.current?.focus();
		}, 100);
	
		return () => clearTimeout(timer);
	}, []);
	const [startPacking, {loading: loadingStartPacking}] = useMutation(mutate_startPacking)

	const onScanPackage = async (data) => {
		try {
			if (!data) {
				showAlert.error('Vui lòng nhập/quét mã thiết bị chứa hàng!')
				return 
			}

			const dataWorkSessionDevice = await queryWorkSessionDeviceRuntime(data)
			if (!!dataWorkSessionDevice) {
				let {data: dataStartPacking} = await startPacking({
					variables: {
						storageEquipmentId: dataWorkSessionDevice?.storageEquipmentId,
						workStationId: currentWorkStation?.id
					}
				})
				if (dataStartPacking?.startPacking?.success) {
					showAlert.success('Tạo phiên đóng gói thành công!')
					navigate(`/${user?.category_code == 'fulfillment' ? "outbound-manage" : 'warehouse-manage'}/pack-detail/${dataStartPacking?.startPacking?.data?.id}`)
				} else {
					showAlert.error(dataStartPacking?.startPacking?.message || 'Tạo phiên đóng gói thất bại!')
				}
			} else {
				showAlert.error('Không tìm thấy thiết bị chứa hàng!')
			}
			if (inputRefOrder.current) {
				setValue('');
				inputRefOrder.current.focus();
			}
		} catch (e) {
			console.log("onScanPackage error:", e);
		}
	};

	return (
		<Spin spinning={loadingDataWorkSession}>
			{!!activeWork && <Alert
				message={<>Bạn đang có 1 phiên đóng gói chưa hoàn thiện với thiết bị chứa hàng <Text strong>{activeWork?.deviceInfo?.[0]?.code}</Text>.</>}
				type="warning"
				showIcon
				style={{ marginBottom: 16 }}
				/>}
			<Row justify={"center"} style={{marginBottom: 20}}>
				<Col span={10}>
					<Flex vertical align="center" gap={10}>
						<Text strong style={{ fontSize: 30 }}>
							Đóng gói hàng hoá
						</Text>
						<Text style={{ color: "#d48e5b", fontSize: 18 }}>Quét thiết bị chứa hàng để đóng gói</Text>
						<Input
							ref={inputRefOrder}
							value={value}
							disabled={!user?.is_subuser}
							onChange={(e) => setValue(e.target.value)}
							placeholder={"Quét/Nhập mã thiết bị chứa hàng"}
							prefix={<SearchOutlined />}
							size="large"
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
