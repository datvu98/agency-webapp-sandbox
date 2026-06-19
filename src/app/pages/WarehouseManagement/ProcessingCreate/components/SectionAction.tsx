import React, { Fragment, memo, useMemo } from "react";
import { Card, Form, Radio, Checkbox, Tooltip, Typography, Divider, Button, Space, Input } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { OPTIONS_CONFIG_PICKUP } from "../constants";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const SectionActions = ({ onCreateOrderFulfillment, data, form, ids }) => {
	const valuesForm = Form.useWatch([], { form, preserve: true }) as any;
	const [countSIO, countMIO] = useMemo(() => {
		const countSIO = ids?.filter((item) => !!item?.isSIO)?.length;
		const countMIO = ids?.filter((item) => !item?.isSIO)?.length;
		return [countSIO, countMIO];
	}, [ids]);

	return (
		<Card title="Tạo danh sách xử lý">
			<Form.Item label="Thiết lập danh sách nhặt hàng">
				<Radio.Group
					onChange={(e) => {
						const value = e.target.value;
						form.setFieldValue("session_sub_pickup_type", value === "grp" ? ["mio", "sio"] : []);
						form.setFieldValue("session_pickup_type", value);
					}}
					value={valuesForm?.["session_pickup_type"]}
				>
					<Space direction="vertical">
						{OPTIONS_CONFIG_PICKUP.map((_op: any) => (
							<Fragment key={_op.value}>
								<Radio value={_op.value}>
									{_op.label}
									{_op?.sub && (
										<Paragraph type="secondary" style={{ margin: 0 }}>
											{_op.sub}
										</Paragraph>
									)}

									{_op?.tooltip && (
										<Tooltip title={_op.tooltip}>
											<InfoCircleOutlined style={{ marginLeft: 6 }} />
										</Tooltip>
									)}
								</Radio>
								{_op?.subOptions?.length > 0 && (
									<Checkbox.Group
										style={{ paddingLeft: 32, display: valuesForm?.["session_pickup_type"] === "grp" ? "flex" : "none" }}
										value={valuesForm?.["session_sub_pickup_type"]}
										onChange={(list) => {
											form.setFieldValue("session_sub_pickup_type", list);
										}}
									>
										<Space direction="vertical">
											{_op.subOptions.map((sub) => (
												<Checkbox
													key={sub.value}
													value={sub.value}
													disabled={
														(valuesForm?.["session_sub_pickup_type"]?.length === 1 && valuesForm?.["session_sub_pickup_type"]?.includes(sub.value)) ||
														valuesForm?.["session_pickup_type"] !== "grp"
													}
												>
													{sub.label}
												</Checkbox>
											))}
										</Space>
									</Checkbox.Group>
								)}
							</Fragment>
						))}
					</Space>
				</Radio.Group>
			</Form.Item>

			<Form.Item label="Ghi chú" name="session_pickup_note">
				<TextArea rows={3} maxLength={255} placeholder="Nhập ghi chú" showCount />
			</Form.Item>
			<Divider />
			<Space direction="vertical" style={{ width: "100%" }}>
				<Text>Phiếu xuất đã chọn: {ids?.length}</Text>
				<Text>Phiếu có 1 sản phẩm: {countSIO}</Text>
				<Text>Phiếu có nhiều sản phẩm: {countMIO}</Text>

				<Button
					type="primary"
					className="btn-base"
					block
					disabled={ids?.length === 0}
					onClick={() => onCreateOrderFulfillment(valuesForm, ids?.length, false, () => form.setFieldValue("__changed__", false))}
				>
					Tạo danh sách
				</Button>
			</Space>

			<Divider />

			<Space direction="vertical" style={{ width: "100%" }}>
				<Text>Phiếu xuất theo bộ lọc: {data?.warehouseBillIsSioCount?.data?.pst || 0}</Text>
				<Text>Phiếu có 1 sản phẩm: {data?.warehouseBillIsSioCount?.data?.sio || 0}</Text>
				<Text>Phiếu có nhiều sản phẩm: {data?.warehouseBillIsSioCount?.data?.mio || 0}</Text>

				<Button
					type="default"
					block
					className="btn-base color-base"
					disabled={!(data?.warehouseBillIsSioCount?.data?.pst > 0)}
					onClick={() => onCreateOrderFulfillment(valuesForm, data?.warehouseBillIsSioCount?.data?.pst, true, () => form.setFieldValue("__changed__", false))}
				>
					Tạo danh sách theo bộ lọc
				</Button>
			</Space>
		</Card>
	);
};

export default memo(SectionActions);
