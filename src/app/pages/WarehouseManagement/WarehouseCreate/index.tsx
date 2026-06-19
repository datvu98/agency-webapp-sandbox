import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, Col, Collapse, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image, Form } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { showAlert } from "utils/helper";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import { WarehouseListWraper } from "../Warehouse.styles";
import queryString from "querystring";
import GeneralInfo from "./components/GeneralInfo";
import Setting from "./components/Setting";
import ModalConfirm from "./dialogs/ModalConfirm";
import mutate_update_sme_warehouses_by_pk from "graphql/mutations/mutate_update_sme_warehouses_by_pk";
import mutate_userCreateWarehouseByAgency from "graphql/mutations/mutate_userCreateWarehouseByAgency";

const { Text } = Typography;

const WarehouseCreate = () => {
	const { appendBreadcrumb } = useLayoutContext();
	const navigate = useNavigate();
	const [form] = Form.useForm();

	const [scanWarehouse, setScanWarehouse] = useState<number>(2);
	const [showConfirmScan, setShowConfirmScan] = useState(null);

	const [mutateCreateWarehouse, { loading: loadingCreateWarehouse }] = useMutation(mutate_userCreateWarehouseByAgency, {
		awaitRefetchQueries: true,
		refetchQueries: ["smeWarehouseByAgency"],
	});

	useLayoutEffect(() => {
		appendBreadcrumb([
			{
				title: "Quản lý kho",
			},
			{
				title: "Danh sách kho",
			},
			{
				title: "Thêm kho",
			},
		]);
	}, []);

	const onCreateWarehouse = useCallback(() => {
		form.validateFields()
			.then(async (values) => {
				const userCreateWarehouseInput = {
					address: values["address"],
					code: values["codeWarehouse"],
					name: values["nameWarehouse"],
					lng: values["longtitude"] ? parseFloat(values["longtitude"]) : 0,
					lat: values["latitude"] ? parseFloat(values["latitude"]) : 0,
					contact_name: values["staff_name"],
					contact_phone: values["phone_num"],
					province_code: values["province"],
					ward_code: values["ward"],
					fulfillment_scan_export_mode: scanWarehouse,
					fulfillment_scan_pack_mode: values["fulfillment_scan_pack_mode"],
					max_mio: Number(values?.max_mio) || 50,
					max_sio: Number(values?.max_sio) || 50,
					max_mixio: Number(values?.max_mixio) || 50,
				};
				let { data } = await mutateCreateWarehouse({
					variables: { userCreateWarehouseInput },
				});
				if (data?.userCreateWarehouseByAgency?.success) {
					showAlert.success("Thêm kho thành công");
					navigate("/warehouse-manage/warehouse-list");
					return;
				} else {
					showAlert.error(data?.userCreateWarehouseByAgency?.message || "Thêm kho thất bại");
				}
			})
			.catch((err) => {
				console.log(`[FORM ERRORS]: `, err);
				showAlert.error("Tạo kho thất bại");
			});
	}, [form, scanWarehouse]);

	return (
		<WarehouseListWraper>
			<Helmet titleTemplate="Thêm kho" defaultTitle="Thêm kho">
				<meta name="description" content="Thêm kho" />
			</Helmet>
			{!!showConfirmScan && (
				<ModalConfirm
					onHide={() => setShowConfirmScan(null)}
					onConfirm={() => {
						setScanWarehouse((prev) => (prev == 1 ? 2 : 1));
						setShowConfirmScan(null);
					}}
					title={
						scanWarehouse == 1
							? 'Sau khi Quét xác nhận đóng gói, bạn cần nhấn "Sẵn sàng giao" để đơn hàng chuyển trạng thái "Chờ lấy hàng". Bạn có muốn tắt tính năng này không?'
							: 'Sau khi Quét xác nhận đóng gói, hệ thống sẽ ghi nhận xuất kho thành công, đơn hàng chuyển trạng thái "Chờ lấy hàng". Bạn có muốn bật tính năng này không?'
					}
				/>
			)}
			<Spin spinning={loadingCreateWarehouse}>
				<Form
					form={form}
					name="basic"
					layout="vertical"
					initialValues={{
						fulfillment_scan_pack_mode: 1,
						max_sio: 50,
						max_mio: 50
					}}
				>
					<GeneralInfo form={form} />
					<Setting form={form} scanWarehouse={scanWarehouse} setShowConfirmScan={setShowConfirmScan} />
					<Flex justify="end" gap={10} style={{ marginTop: 10 }}>
						<Button
							onClick={() => {
								navigate("/warehouse-manage/warehouse-list");
							}}
							style={{ height: 40, width: 100, background: "#f3f6f9", color: "black" }}
						>
							Hủy
						</Button>
						<Button type="primary" onClick={onCreateWarehouse} color="#ff5629" style={{ height: 40, fontSize: 14, width: 100, color: "white", background: "#ff5629" }}>
							Lưu lại
						</Button>
					</Flex>
				</Form>
			</Spin>
		</WarehouseListWraper>
	);
};

export default WarehouseCreate;
