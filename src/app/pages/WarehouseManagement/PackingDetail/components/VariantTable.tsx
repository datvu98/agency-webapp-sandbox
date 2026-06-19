import { DownOutlined, ExclamationCircleFilled, ExclamationCircleOutlined, InfoCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, Dropdown, Flex, Image, Input, Row, Select, Space, Spin, Table, Tooltip, Typography } from "antd";
import { MenuProps } from "antd/lib/menu";
import Pagination from "app/components/Pagination";
import dayjs from "dayjs";
import _ from "lodash";
import queryString from "querystring";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { formatNumberToCurrency, showAlert } from "utils/helper";
import { MAPPING_STATUS } from "../constants";
import { useMutation } from "@apollo/client";
import mutate_reportMissingItemPacking from "graphql/mutations/mutate_reportMissingItemPacking";
import ModalConfirm from "../dialogs/ModalConfirm";
const { Text, Paragraph } = Typography;

const VariantTable = ({ selectedRow, setSelectedRow, dataItem, dataPagination, dataDetail, dataCount }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const [showConfirm, setShowConfirm] = useState({
		show: false,
		text: "",
		workSessionItemId: 0,
	});

	const { id } = useParams();

	const [reportMissingItemPacking, { loading: loadingReportMissingItemPacking }] = useMutation(mutate_reportMissingItemPacking, {
		awaitRefetchQueries: true,
		refetchQueries: ["workSessionItemWithPagination"],
	});

	const columns = [
		{
			title: "Tên hàng hoá",
			dataIndex: "name",
			key: "name",
			width: 200,
			render: (_item, record) => {
				return (
					<Paragraph style={{ marginBottom: 0 }} ellipsis={{ rows: 2 }}>
						{record?.variant?.variant_full_name}
					</Paragraph>
				);
			},
		},
		{
			title: "Hình ảnh",
			dataIndex: "image",
			key: "image",
			width: 150,
			render: (_item, record) => {
				const imageUrl = record?.variant?.sme_catalog_product_variant_assets?.[0]?.asset_url;

				if (!imageUrl) return <></>;

				return (
					<Flex justify="center">
						<Tooltip placement="right" color="white" overlayInnerStyle={{ padding: 0 }} title={<Image src={imageUrl} width={200} preview={false} style={{ borderRadius: 8 }} />}>
							<Image height={50} width={50} src={imageUrl} preview={false} style={{ borderRadius: 8, cursor: "zoom-in" }} />
						</Tooltip>
					</Flex>
				);
			},
		},
		{
			title: "Mã SKU",
			dataIndex: "sku",
			key: "sku",
			width: 150,
			align: "center",
			render: (_item, record) => {
				return <Text>{record?.variant?.sku}</Text>;
			},
		},
		{
			title: "Số lượng",
			dataIndex: "quantity",
			key: "quantity",
			width: 150,
			align: "center",
			render: (_item, record) => {
				return (
					<Text>
						{formatNumberToCurrency(record?.quantity - record?.remainingQuantity)}/{formatNumberToCurrency(record?.quantity)}
					</Text>
				);
			},
		},
		{
			title: "ĐVT",
			dataIndex: "unit",
			key: "unit",
			width: 100,
			align: "center",
			render: (_item, record) => {
				return <Text>{record?.variant?.unit}</Text>;
			},
		},
		dataDetail?.processingList?.type == "SIO"
			? {
					title: "Mã đơn hàng",
					dataIndex: "orderCode",
					key: "orderCode",
					width: 200,
					align: "center",
					render: (_item, record) => {
						return <Text>{record?.warehouseBill?.orderCode}</Text>;
					},
			  }
			: null,
		dataDetail?.processingList?.type == "SIO"
			? {
					title: "Trạng thái",
					dataIndex: "status",
					key: "status",
					width: 200,
					align: "center",
					render: (_item, record) => {
						return <Text>{MAPPING_STATUS?.[record?.status]}</Text>;
					},
			  }
			: null,
		dataDetail?.processingList?.type == "SIO"
			? {
					title: "Thao tác",
					dataIndex: "action",
					key: "action",
					width: 150,
					align: "center",
					render: (_item, record) => {
						return (
							record?.status == "NEW" && (
								<Text
									className="color-base cursor-pointer"
									onClick={() => {
										setShowConfirm({
											show: true,
											text: "Phiếu xuất được ghi nhận là thiếu hàng và được bỏ qua trong phiên đóng gói này.",
											workSessionItemId: record?.id,
										});
									}}
								>
									Báo thiếu hàng
								</Text>
							)
						);
					},
			  }
			: null,
	];
	return (
		<Spin spinning={loadingReportMissingItemPacking}>
			{showConfirm?.show && (
				<ModalConfirm
					show={showConfirm?.show}
					onHide={() => {
						setShowConfirm({
							show: false,
							text: "",
							workSessionItemId: 0,
						});
					}}
					text={showConfirm?.text}
					onConfirm={async () => {
						let { data } = await reportMissingItemPacking({
							variables: {
								workSessionId: Number(id),
								workSessionItemId: showConfirm?.workSessionItemId,
							},
						});
						if (data?.reportMissingItemPacking?.success) {
							showAlert.success("Báo thiếu hàng thành công");
						} else {
							showAlert.error(data?.reportMissingItemPacking?.message || "Báo thiếu hàng thất bại");
						}
						setShowConfirm({
							show: false,
							text: "",
							workSessionItemId: 0,
						});
					}}
				/>
			)}
			<Card className="card-switch" title={false}>
				<Flex align="center" justify="space-between">
					<Text strong>
						Đã đóng gói: {dataCount?.totalQuantityPacked}/{dataCount?.totalQuantityPacking}
					</Text>
					<Text>
						<Text>
							{dataDetail?.processingList?.type == "SIO"
								? `Có ${dataCount?.totalQuantityPacking} kiện hàng: Mỗi kiện hàng chỉ chứa đúng 01 hàng hoá`
								: "Có 1 kiện hàng: Gom toàn bộ sản phẩm từ thiết bị vào chung 01 kiện duy nhất"}
						</Text>
					</Text>
				</Flex>
				<Table
					className="setting-table ant-upbase"
					style={{ marginTop: 10 }}
					dataSource={dataItem || []}
					columns={columns?.filter((col) => !!col) as any}
					bordered
					tableLayout="auto"
					onRow={(record) => ({
						onClick: () => {
							setSelectedRow(record);
						},
					})}
					rowClassName={(record) => (record.id === selectedRow?.id ? "row-active" : "")}
					sticky={{ offsetHeader: 0 }}
					scroll={{ x: "max-content" }}
					pagination={false}
				/>
				{!!dataPagination && (
					<Pagination
						page={dataPagination?.pageNumber}
						totalPage={dataPagination?.totalPages}
						limit={dataPagination?.pageSize}
						totalRecord={dataPagination?.totalItems}
						count={dataItem?.length}
						basePath={`${location.pathname}`}
						emptyTitle={"Chưa có thông tin"}
						options={[
							{ label: 25, value: 25 },
							{ label: 50, value: 50 },
							{ label: 100, value: 100 },
						]}
					/>
				)}
				{/* <div className="scan-note" onClick={() => {
                    window.open('https://guide.upbase.vn/tinh-nang-san-pham/quan-ly-kho/huong-dan-set-enter-cho-may-doc-ma-vach-zebra-ds2208')
                }}>
                    <ExclamationCircleFilled className="scan-note__icon" />
                    <Text className="scan-note__text">
                        <Text strong>Lưu ý</Text>: Setup tự động <Text strong>"Enter"</Text> cho máy scan để tối ưu thao tác
                    </Text>
                </div> */}
			</Card>
		</Spin>
	);
};

export default VariantTable;
