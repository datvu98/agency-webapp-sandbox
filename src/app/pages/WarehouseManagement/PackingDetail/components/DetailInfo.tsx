import { DownOutlined, EditOutlined, SearchOutlined } from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import { Button, Card, Col, Dropdown, Flex, Input, Row, Space, Spin, Table, Tooltip, Typography } from "antd";
import { MenuProps } from "antd/lib/menu";
import HtmlPrint from "app/components/HTMLPrint";
import Pagination from "app/components/Pagination";
import { selectGlobalSlice } from "app/slice/selectors";
import dayjs from "dayjs";
import mutate_printLabelPacking from "graphql/mutations/mutate_printLabelPacking";
import mutate_printLabelPackingTemp from "graphql/mutations/mutate_printLabelPackingTemp";
import _ from "lodash";
import queryString from "querystring";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { printFromS3, showAlert } from "utils/helper";
const { Text } = Typography;

const DetailInfo = ({ selectedRow, dataDetail, dataCount }) => {
	const { id } = useParams();
	const { user } = useSelector(selectGlobalSlice);
	const [html, setHtml] = useState(false);
	const [namePrint, setNamePrint] = useState("");
	const [printLabelPacking, { loading: loadingPrintLabelPacking }] = useMutation(mutate_printLabelPacking);
	const [printLabelPackingTemp, { loading: loadingPrintLabelPackingTemp }] = useMutation(mutate_printLabelPackingTemp);
	const printHtml = (html, name) => {
		setNamePrint(name);
		setHtml(html);
	};
	return (
		<Spin spinning={loadingPrintLabelPacking || loadingPrintLabelPackingTemp}>
			{html && namePrint && <HtmlPrint setHtml={setHtml} setNamePrint={setNamePrint} html={html} namePrint={namePrint} />}
			<Card className="card-switch" title={false}>
				<Flex vertical>
					<Text>Mã phiếu xuất:</Text>
					<Text
						strong
						style={{ color: "#d48e5b", fontSize: 16 }}
						className="cursor-pointer"
						onClick={() => {
							window.open(`/${user?.category_code == "fulfillment" ? "outbound-manage" : "warehouse-manage"}/warehouse-bill-out/${selectedRow?.warehouseBill?.id}`);
						}}
					>
						{selectedRow?.warehouseBill?.code || "--"}
					</Text>
					<Text>Mã vận đơn:</Text>
					<Text strong style={{ color: "#d48e5b", fontSize: 16 }}>
						{selectedRow?.warehouseBill?.trackingNumber || "--"}
					</Text>
					{dataDetail?.processingList?.type == "MIO" && (
						<>
							<Text>Mã đơn hàng:</Text>
							<Text strong style={{ color: "#d48e5b", fontSize: 16 }}>
								{selectedRow?.warehouseBill?.orderCode || "--"}
							</Text>
						</>
					)}
				</Flex>
				{((!selectedRow?.remainingQuantity && dataDetail?.processingList?.type == "SIO") ||
					(dataCount?.totalQuantityPacked == dataCount?.totalQuantityPacking && dataDetail?.processingList?.type == "MIO")) && (
					<Flex justify="end">
						<Button
							type="primary"
							className="btn-base"
							onClick={async () => {
								let { data } = await printLabelPacking({
									variables: {
										warehouseBillId: selectedRow?.warehouseBill?.id,
										workSessionId: Number(id),
									},
								});
								if (data?.printLabelPacking?.success) {
									if (data?.printLabelPacking?.data) {
										printFromS3(data?.printLabelPacking?.data);
									} else {
										let { data: dataPrintTemp } = await printLabelPackingTemp({
											variables: {
												warehouseBillId: selectedRow?.warehouseBill?.id,
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
							}}
						>
							In vận đơn
						</Button>
					</Flex>
				)}
			</Card>
		</Spin>
	);
};

export default DetailInfo;
