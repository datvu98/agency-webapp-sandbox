import { Button, Card, Col, Divider, Dropdown, Flex, Input, Row, Space, Spin, Table, Tooltip, Typography } from "antd";
import { selectGlobalSlice } from "app/slice/selectors";
import dayjs from "dayjs";
import _ from "lodash";
import React from "react";
import { useSelector } from "react-redux";
const { Text } = Typography;

const SectionHistory = ({ dataDetail, optionSubUsers }) => {
	const { user } = useSelector(selectGlobalSlice);

	return (
		<Card className="card-switch" title={false} style={{ marginBottom: 10 }}>
			<Flex justify="center" vertical gap={20}>
				<Text strong>Lịch sử thao tác</Text>
				{dataDetail?.map((session) => {
					let pic = session?.picType == "1" ? user?.email : optionSubUsers?.find((opt) => opt?.value == session?.picId)?.label;
					return (
						<>
							<Divider style={{ margin: 10 }} />

							<Flex gap={10} wrap="wrap">
								<Text>Bắt đầu bàn giao</Text>
								<Text strong>{session?.startedAt ? dayjs(session?.startedAt).format("DD/MM/YYYY HH:mm") : "--"}</Text>
								<Text>{pic}</Text>
							</Flex>
							<Flex gap={10} wrap="wrap">
								<Text>Kết thúc bàn giao</Text>
								<Text strong>{session?.endedAt ? dayjs(session?.endedAt).format("DD/MM/YYYY HH:mm") : "--"}</Text>
								<Text>{pic}</Text>
							</Flex>
						</>
					);
				})}
			</Flex>
		</Card>
	);
};

export default SectionHistory;
