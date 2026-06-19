import React, { useMemo, useState } from "react";
import { Button, Card, Col, Collapse, Flex, Row, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useQuery } from "@apollo/client";
import query_getWarehouseBillProcessTimeline from "graphql/queries/query_getWarehouseBillProcessTimeline";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
// import ModalUpdateEvidence from "../dialogs/ModalUpdateEvidence";

const { Text, Paragraph } = Typography;

const ProcessingInfo = ({ dataDetail, optionSubUsers }) => {
	const { user } = useSelector(selectGlobalSlice);
	const { data: warehouseBillProcessTimeline } = useQuery(query_getWarehouseBillProcessTimeline, {
		variables: {
			id: dataDetail?.id,
		},
		fetchPolicy: "cache-and-network",
		skip: !dataDetail?.id,
	});

	const generalData = useMemo(() => {
		if (!warehouseBillProcessTimeline?.getWarehouseBillProcessTimeline?.data) return null;
		return warehouseBillProcessTimeline?.getWarehouseBillProcessTimeline?.data;
	}, [warehouseBillProcessTimeline]);
	return (
		<>
			<Collapse
				defaultActiveKey="general"
				collapsible="disabled"
				// expandIcon={false}
				items={[
					{
						key: "general",
						label: (
							<Flex align="center" gap={10}>
								<Text>Thông tin xử lý</Text>
							</Flex>
						),
						children: (
							<Flex vertical gap={15}>
								{!!generalData?.processingListCreated?.at && <Flex gap={2} wrap="wrap">
									<Text strong style={{ whiteSpace: "nowrap" }}>{dayjs(generalData?.processingListCreated?.at).format("DD/MM/YYYY HH:mm")}</Text>
									<Text style={{ whiteSpace: "nowrap" }}>tạo danh sách</Text>
									<Text strong style={{ whiteSpace: "nowrap" }}>{generalData?.processingListCreated?.by?.type == 1 ? user?.email : optionSubUsers?.find(opt => opt?.value == generalData?.processingListCreated?.by?.id)?.label}</Text>
								</Flex>}
								{!!generalData?.pickStepCreated?.at && <Flex gap={2} wrap="wrap">
									<Text strong style={{ whiteSpace: "nowrap" }}>{dayjs(generalData?.pickStepCreated?.at).format("DD/MM/YYYY HH:mm")}</Text>
									<Text style={{ whiteSpace: "nowrap" }}>tạo lộ trình</Text>
									<Text strong style={{ whiteSpace: "nowrap" }}>{generalData?.pickStepCreated?.by?.type == 1 ? user?.email : optionSubUsers?.find(opt => opt?.value == generalData?.pickStepCreated?.by?.id)?.label}</Text>
								</Flex>}
								{!!generalData?.processingListAssigned?.at && <Flex gap={2} wrap="wrap">
									<Text strong  style={{ whiteSpace: "nowrap" }}>{dayjs(generalData?.processingListAssigned?.at).format("DD/MM/YYYY HH:mm")}</Text>
									<Text  style={{ whiteSpace: "nowrap" }}>phân công nhân viên xử lý</Text>
									<Text strong  style={{ whiteSpace: "nowrap" }}>{generalData?.processingListAssigned?.by?.type == 1 ? user?.email : optionSubUsers?.find(opt => opt?.value == generalData?.processingListAssigned?.by?.id)?.label}</Text>
								</Flex>}
								{!!generalData?.pickStarted?.at && <Flex gap={2} wrap="wrap">
									<Text strong style={{ whiteSpace: "nowrap" }}>{dayjs(generalData?.pickStarted?.at).format("DD/MM/YYYY HH:mm")}</Text>
									<Text style={{ whiteSpace: "nowrap" }}>bắt đầu lấy hàng</Text>
									<Text strong style={{ whiteSpace: "nowrap" }}>{generalData?.pickStarted?.by?.type == 1 ? user?.email : optionSubUsers?.find(opt => opt?.value == generalData?.pickStarted?.by?.id)?.label}</Text>
								</Flex>}
								{!!generalData?.pickEnded?.at && <Flex gap={2} wrap="wrap">
									<Text strong style={{ whiteSpace: "nowrap" }}>{dayjs(generalData?.pickEnded?.at).format("DD/MM/YYYY HH:mm")}</Text>
									<Text style={{ whiteSpace: "nowrap" }}>kết thúc lấy hàng</Text>
									<Text strong style={{ whiteSpace: "nowrap" }}>{generalData?.pickEnded?.by?.type == 1 ? user?.email : optionSubUsers?.find(opt => opt?.value == generalData?.pickEnded?.by?.id)?.label}</Text>
								</Flex>}
								{!!generalData?.packStarted?.at && <Flex gap={2} wrap="wrap">
									<Text strong style={{ whiteSpace: "nowrap" }}>{dayjs(generalData?.packStarted?.at).format("DD/MM/YYYY HH:mm")}</Text>
									<Text style={{ whiteSpace: "nowrap" }}>bắt đầu đóng gói</Text>
									<Text strong style={{ whiteSpace: "nowrap" }}>{generalData?.packStarted?.by?.type == 1 ? user?.email : optionSubUsers?.find(opt => opt?.value == generalData?.packStarted?.by?.id)?.label}</Text>
								</Flex>}
								{!!generalData?.packEnded?.at && <Flex gap={2} wrap="wrap">
									<Text strong style={{ whiteSpace: "nowrap" }}>{dayjs(generalData?.packEnded?.at).format("DD/MM/YYYY HH:mm")}</Text>
									<Text style={{ whiteSpace: "nowrap" }}>kết thúc đóng gói</Text>
									<Text strong style={{ whiteSpace: "nowrap" }}>{generalData?.packEnded?.by?.type == 1 ? user?.email : optionSubUsers?.find(opt => opt?.value == generalData?.packEnded?.by?.id)?.label}</Text>
								</Flex>}
								{!!generalData?.handoverStarted?.at && <Flex gap={2} wrap="wrap">
									<Text strong style={{ whiteSpace: "nowrap" }}>{dayjs(generalData?.handoverStarted?.at).format("DD/MM/YYYY HH:mm")}</Text>
									<Text style={{ whiteSpace: "nowrap" }}>bắt đầu bàn giao</Text>
									<Text strong style={{ whiteSpace: "nowrap" }}>{generalData?.handoverStarted?.by?.type == 1 ? user?.email : optionSubUsers?.find(opt => opt?.value == generalData?.handoverStarted?.by?.id)?.label}</Text>
								</Flex>}
								{!!generalData?.handoverEnded?.at && <Flex gap={2} wrap="wrap">
									<Text strong style={{ whiteSpace: "nowrap" }}>{dayjs(generalData?.handoverEnded?.at).format("DD/MM/YYYY HH:mm")}</Text>
									<Text style={{ whiteSpace: "nowrap" }}>kết thúc bàn giao</Text>
									<Text strong style={{ whiteSpace: "nowrap" }}>{generalData?.handoverEnded?.by?.type == 1 ? user?.email : optionSubUsers?.find(opt => opt?.value == generalData?.handoverEnded?.by?.id)?.label}</Text>
								</Flex>}
							</Flex>
						),
					},
				]}
			/>
		</>
	);
};

export default ProcessingInfo;
