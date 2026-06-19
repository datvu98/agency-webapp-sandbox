import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, Divider, Dropdown, Flex, Input, Progress, Row, Select, Space, Spin, Table, Tooltip, Typography } from "antd";
import { MenuProps } from "antd/lib/menu";
import Pagination from "app/components/Pagination";
import dayjs from "dayjs";
import _, { omit } from "lodash";
import queryString from "querystring";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { printFromS3, showAlert } from "utils/helper";
import { SCAN_OPTIONS } from "../constants";
import { ScanOptionType } from "../types";
import { useMutation } from "@apollo/client";
import mutate_pausePacking from "graphql/mutations/mutate_pausePacking";
import mutate_completePacking from "graphql/mutations/mutate_completePacking";
import ModalConfirm from "../dialogs/ModalConfirm";
import { querySmeVariantByIds, queryWarehouseBillByIds, queryWorkSessionItemByText } from "../helpers";
import mutate_upsertItemPacking from "graphql/mutations/mutate_upsertItemPacking";
import ModalInfo from "../dialogs/ModalInfo";
import mutate_printLabelPacking from "graphql/mutations/mutate_printLabelPacking";
import mutate_reportMissingItemPacking from "graphql/mutations/mutate_reportMissingItemPacking";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import mutate_printLabelPackingTemp from "graphql/mutations/mutate_printLabelPackingTemp";
import HtmlPrint from "app/components/HTMLPrint";
const { Text } = Typography;

const ScanActionSection = ({ dataDetail, setSelectedRow, dataPagination, dataCount }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const inputRefOrder = useRef<any>(null);
	const lastScanTimeRef = useRef<number>(0);
	const { id } = useParams();
	const params = queryString.parse(location.search.slice(1, 100000)) as any;
	const { user } = useSelector(selectGlobalSlice);

	const [scanType, setScanType] = useState<ScanOptionType | undefined>(SCAN_OPTIONS?.find((opt) => opt?.is_default));
	const [loading, setLoading] = useState(false);
	const [value, setValue] = useState("");
	const [html, setHtml] = useState(false);
	const [namePrint, setNamePrint] = useState("");

	const [showConfirm, setShowConfirm] = useState({
		show: false,
		type: "",
	});
	const [showInfo, setShowInfo] = useState<any>({
		show: false,
		dataInfo: {},
	});

	useEffect(() => {
		if (params?.searchType) {
			setScanType(SCAN_OPTIONS?.find((opt) => opt?.value == params?.searchType));
		}
	}, [params?.searchType]);
	useEffect(() => {
		const timer = setTimeout(() => {
			inputRefOrder.current?.focus();
		}, 100);

		return () => clearTimeout(timer);
	}, []);

	const [pausePacking, { loading: loadingPausePacking }] = useMutation(mutate_pausePacking);

	const [completePacking, { loading: loadingCompletePacking }] = useMutation(mutate_completePacking);

	const [printLabelPacking, { loading: loadingPrintLabelPacking }] = useMutation(mutate_printLabelPacking);

	const [printLabelPackingTemp, { loading: loadingPrintLabelPackingTemp }] = useMutation(mutate_printLabelPackingTemp);

	const [reportMissingItemPacking, { loading: loadingReportMissingItemPacking }] = useMutation(mutate_reportMissingItemPacking);

	const [upsertItemPacking, { loading: loadingUpsertItemPacking }] = useMutation(mutate_upsertItemPacking, {
		awaitRefetchQueries: true,
		refetchQueries: ["workSessionItemWithPagination", "quantityProgressPacking"],
	});
	const onScanPackage = async (data) => {
		try {
			if (scanType?.value == "searching") {
				navigate(
					`${location.pathname}?${queryString.stringify({
						...params,
						page: 1,
						q: data,
					})}`
				);
			} else {
				setLoading(true);
				if (dataDetail?.processingList?.type === "SIO") {
					const now = Date.now();
					const diff = now - lastScanTimeRef.current;

					if (lastScanTimeRef.current && diff < 20_000) {
						showAlert.error(`Vui lòng chờ ${Math.ceil((20_000 - diff) / 1000)} giây để quét hàng tiếp theo`);
						setLoading(false);
						setValue("");
						inputRefOrder.current.focus();
						return;
					}

					// cập nhật mốc quét
					lastScanTimeRef.current = now;
				}
				const workSessionItem = await queryWorkSessionItemByText(data, id, dataDetail?.processingList?.type);

				if (workSessionItem) {
					const warehouseBillList = await queryWarehouseBillByIds([workSessionItem?.warehouseBillId]);
					const variantsList = await querySmeVariantByIds([workSessionItem?.variantId]);
					let { data } = await upsertItemPacking({
						variables: {
							workSessionId: Number(id),
							item: {
								id: workSessionItem?.id,
								variantId: workSessionItem?.variantId,
								productId: workSessionItem?.productId,
								quantity: 1,
							},
						},
					});
					if (data?.upsertItemPacking?.success) {
						showAlert.success("Quét đóng gói thành công");
						setSelectedRow({
							...workSessionItem,
							remainingQuantity: workSessionItem?.remainingQuantity + 1,
							warehouseBill: warehouseBillList?.[0],
							variant: variantsList?.[0],
						});
						if (dataDetail?.processingList?.type == "SIO") {
							let { data: dataPrint } = await printLabelPacking({
								variables: {
									workSessionId: Number(id),
									warehouseBillId: workSessionItem?.warehouseBillId,
								},
							});
							if (dataPrint?.printLabelPacking?.success) {
								if (dataPrint?.printLabelPacking?.data) {
									await printFromS3(dataPrint?.printLabelPacking?.data);
								} else {
									let { data: dataPrintTemp } = await printLabelPackingTemp({
										variables: {
											workSessionId: Number(id),
											warehouseBillId: workSessionItem?.warehouseBillId,
										},
									});
									if (!dataPrintTemp?.printLabelPackingTemp?.success) {
										showAlert.error(dataPrintTemp?.printLabelPackingTemp?.message || "In vận đơn thất bại");
									}
									if (data?.upsertItemPacking?.data?.status == "COMPLETED") {
										showAlert.success("Đã hoàn thành phiên đóng gói!");
										navigate(`/${user?.category_code == "fulfillment" ? "outbound-manage" : "warehouse-manage"}/pack-station`, {
											state: dataPrintTemp?.printLabelPackingTemp?.success
												? { printHtml: dataPrintTemp?.printLabelPackingTemp?.data, printName: "Mã_vận_đơn" }
												: undefined,
										});
										return;
									}
									if (dataPrintTemp?.printLabelPackingTemp?.success) {
										printHtml(dataPrintTemp?.printLabelPackingTemp?.data, "Mã_vận_đơn");
									}
								}
							} else {
								showAlert.error(dataPrint?.printLabelPacking?.message || "In vận đơn thất bại");
							}
						}
						if (dataDetail?.processingList?.type == "MIO" && dataCount?.totalQuantityPacked + 1 == dataCount?.totalQuantityPacking) {
							let { data: dataPrint } = await printLabelPacking({
								variables: {
									workSessionId: Number(id),
									warehouseBillId: workSessionItem?.warehouseBillId,
								},
							});
							if (dataPrint?.printLabelPacking?.success) {
								if (dataPrint?.printLabelPacking?.data) {
									await printFromS3(dataPrint?.printLabelPacking?.data);
								} else {
									let { data: dataPrintTemp } = await printLabelPackingTemp({
										variables: {
											workSessionId: Number(id),
											warehouseBillId: workSessionItem?.warehouseBillId,
										},
									});
									if (!dataPrintTemp?.printLabelPackingTemp?.success) {
										showAlert.error(dataPrintTemp?.printLabelPackingTemp?.message || "In vận đơn thất bại");
									}
									if (data?.upsertItemPacking?.data?.status == "COMPLETED") {
										showAlert.success("Đã hoàn thành phiên đóng gói!");
										navigate(`/${user?.category_code == "fulfillment" ? "outbound-manage" : "warehouse-manage"}/pack-station`, {
											state: dataPrintTemp?.printLabelPackingTemp?.success
												? { printHtml: dataPrintTemp?.printLabelPackingTemp?.data, printName: "Mã_vận_đơn" }
												: undefined,
										});
										return;
									}
									if (dataPrintTemp?.printLabelPackingTemp?.success) {
										printHtml(dataPrintTemp?.printLabelPackingTemp?.data, "Mã_vận_đơn");
									}
								}
							} else {
								showAlert.error(dataPrint?.printLabelPacking?.message || "In vận đơn thất bại");
							}
						}
						if (data?.upsertItemPacking?.data?.status == "COMPLETED") {
							showAlert.success("Đã hoàn thành phiên đóng gói!");
							navigate(`/${user?.category_code == "fulfillment" ? "outbound-manage" : "warehouse-manage"}/pack-station`);
						}
					} else {
						showAlert.error(data?.upsertItemPacking?.message || "Quét đóng gói thất bại");
					}
				} else {
					showAlert.error("Không tìm thấy hàng hoá trong phiên");
				}
				setLoading(false);
			}
			if (inputRefOrder.current) {
				setValue("");
				inputRefOrder.current.focus();
			}
		} catch (e) {
			setLoading(false);
			console.log("onScanPackage error:", e);
		} finally {
			setLoading(false);
			if (inputRefOrder.current) {
			   setValue("");
			   inputRefOrder.current.focus();
			}
		 }
	};
	const onPause = useCallback(async () => {
		let { data } = await pausePacking({
			variables: {
				workSessionId: Number(id),
			},
		});
		if (data?.pausePacking?.success) {
			showAlert.success("Tạm dừng đóng gói thành công");
			navigate(`/${user?.category_code == "fulfillment" ? "outbound-manage" : "warehouse-manage"}/pack-station`);
		} else {
			showAlert.error(data?.pausePacking?.message || "Tạm dừng đóng gói thất bại");
		}
		setShowConfirm({
			show: false,
			type: "",
		});
	}, [id]);

	const onReportMissing = useCallback(async () => {
		let { data } = await reportMissingItemPacking({
			variables: {
				workSessionId: Number(id),
			},
		});
		if (data?.reportMissingItemPacking?.success) {
			showAlert.success("Báo thiếu hàng thành công");
			navigate(`/${user?.category_code == "fulfillment" ? "outbound-manage" : "warehouse-manage"}/pack-station`);
		} else {
			showAlert.error(data?.reportMissingItemPacking?.message || "Báo thiếu hàng thất bại");
		}
		setShowConfirm({
			show: false,
			type: "",
		});
	}, [id]);
	const onComplete = useCallback(async () => {
		let { data } = await completePacking({
			variables: {
				workSessionId: Number(id),
			},
		});
		if (data?.completePacking?.success) {
			showAlert.success("Hoàn thành đóng gói thành công");
			navigate(`/${user?.category_code == "fulfillment" ? "outbound-manage" : "warehouse-manage"}/pack-station`);
		} else {
			showAlert.error(data?.completePacking?.message || "Hoàn thành đóng gói thất bại");
		}
		setShowConfirm({
			show: false,
			type: "",
		});
	}, [id]);
	const text = useMemo(() => {
		if (showConfirm?.type == "pause") {
			return "Hệ thống sẽ tạm dừng phiên làm việc, bạn có muốn tiếp tục?";
		}
		if (showConfirm?.type == "complete") {
			return "Hệ thống sẽ hoàn thành phiên làm việc, bạn có muốn tiếp tục?";
		}
		if (showConfirm?.type == "report_missing") {
			return "Phiếu xuất được ghi nhận là thiếu hàng và hệ thống sẽ kết thúc phiên đóng gói này";
		}
		return "";
	}, [showConfirm?.type]);

	const printHtml = (html, name) => {
		setNamePrint(name);
		setHtml(html);
	};
	return (
		<Spin spinning={loadingCompletePacking || loadingPausePacking || loading}>
			{html && namePrint && <HtmlPrint setHtml={setHtml} setNamePrint={setNamePrint} html={html} namePrint={namePrint} />}
			{showConfirm?.show && (
				<ModalConfirm
					show={showConfirm?.show}
					text={text}
					onHide={() => {
						setShowConfirm({
							show: false,
							type: "",
						});
						inputRefOrder.current.focus();
					}}
					onConfirm={async () => {
						if (showConfirm?.type == "pause") {
							await onPause();
						}
						if (showConfirm?.type == "complete") {
							await onComplete();
						}
						if (showConfirm?.type == "report_missing") {
							await onReportMissing();
						}
						inputRefOrder.current.focus();
					}}
				/>
			)}
			{showInfo?.show && (
				<ModalInfo
					show={showInfo.show}
					dataInfo={showInfo?.dataInfo}
					onHide={() => {
						setShowInfo({
							show: false,
							dataInfo: {},
						});
						inputRefOrder.current.focus();
					}}
					onConfirm={async () => {
						let { data } = await printLabelPacking({
							variables: {
								warehouseBillId: showInfo?.dataInfo?.warehouseBill?.id,
								workSessionId: Number(id),
							},
						});
						if (data?.printLabelPacking?.success) {
							if (data?.printLabelPacking?.data) {
								await printFromS3(data?.printLabelPacking?.data);
							} else {
								let { data: dataPrintTemp } = await printLabelPackingTemp({
									variables: {
										warehouseBillId: showInfo?.dataInfo?.warehouseBill?.id,
										workSessionId: Number(id),
									},
								});
								if (dataPrintTemp?.printLabelPackingTemp?.success) {
									printHtml(dataPrintTemp?.printLabelPackingTemp?.data, "Mã_vận_đơn");
								} else {
									showAlert.error(dataPrintTemp?.printLabelPackingTemp?.message || "In vận đơn thất bại");
								}
							}
						} else {
							showAlert.error(data?.printLabelPacking?.message || "In vận đơn thất bại");
						}
						setShowInfo({
							show: false,
							dataInfo: {},
						});
						inputRefOrder.current.focus();
					}}
				/>
			)}
			<Card className="card-switch" title={false} style={{ marginBottom: 10 }}>
				{/* ===== Row 1: Code + Scan type + Scan input ===== */}
				<Row align="middle" gutter={12}>
					<Col span={4}>
						<Text strong style={{ padding: "8px 10px" }}>
							{dataDetail?.processingList?.code}
						</Text>
					</Col>

					<Col span={6}>
						<Select
							style={{ width: "100%" }}
							size="large"
							value={scanType}
							options={SCAN_OPTIONS}
							onChange={(val, option) => {
								const opt = option as ScanOptionType;
								setScanType(opt);
								navigate(`${location.pathname}?${queryString.stringify(omit({ ...params, searchType: opt?.value }, ["q"]))}`);
							}}
						/>
					</Col>

					<Col span={10}>
						<Input
							ref={inputRefOrder}
							value={value}
							onChange={(e) => setValue(e.target.value)}
							placeholder="Quét mã SKU/Sản phẩm..."
							prefix={<SearchOutlined />}
							size="large"
							onPaste={(e) => e.preventDefault()}
							onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
								const value = e.currentTarget.value;
								if (!value) {
									navigate(`${location.pathname}?${queryString.stringify(omit(params, ["q"]))}`);
								}
								if (e.key === "Enter" && value) {
									onScanPackage(value);
								}
							}}
						/>
					</Col>
				</Row>
				<Divider style={{ margin: "12px 0" }} />
				<Row align="top" gutter={12}>
					<Col span={6}>
						<Flex
							gap={10}
							style={{
								background: "#eef4ff",
								color: "#2563eb",
								padding: "8px 10px",
								borderRadius: "8px",
								fontSize: "13px",
								border: "1px solid #2563eb",
							}}
						>
							<Text strong style={{ color: "#ff5628" }}>
								{dataDetail?.processingList?.type === "MIO" ? "GÓI 1 ĐƠN" : "GÓI NHIỀU ĐƠN"}
							</Text>

							<Text>
								Thiết bị chứa:{" "}
								<Text strong style={{ color: "#2563eb" }}>
									{dataDetail?.storageEquipment?.code}
								</Text>
							</Text>
						</Flex>
					</Col>

					<Col span={12}>
						<Flex
							align="center"
							gap={12}
							style={{
								padding: "8px 10px",
								borderRadius: "8px",
								border: "1px solid #dedede",
							}}
						>
							<Text>Tiến độ:</Text>

							<Progress
								percent={dataCount?.totalQuantityPacking === 0 ? 0 : Math.round((dataCount?.totalQuantityPacked / dataCount?.totalQuantityPacking) * 100)}
								strokeColor="#ff5628"
								showInfo={false}
								style={{ flex: 1 }}
								trailColor="#f1f5f9"
								strokeLinecap="round"
							/>

							<Text>
								{dataCount?.totalQuantityPacked} / {dataCount?.totalQuantityPacking}
							</Text>
						</Flex>
					</Col>

					<Col span={6}>
						<Flex justify="end" gap={12} style={{ flexWrap: "wrap" }}>
							{/* {dataDetail?.processingList?.type === "MIO" && (
								<Button className="btn-base btn-cancel" onClick={() => setShowConfirm({ show: true, type: "report_missing" })}>
									Thiếu hàng
								</Button>
							)} */}

							<Button className="btn-base btn-cancel" onClick={() => setShowConfirm({ show: true, type: "pause" })}>
								Tạm dừng
							</Button>

							<Button type="primary" className="btn-base" onClick={() => setShowConfirm({ show: true, type: "complete" })}>
								Hoàn thành
							</Button>
						</Flex>
					</Col>
				</Row>
			</Card>
		</Spin>
	);
};

export default ScanActionSection;
