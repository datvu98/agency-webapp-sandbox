import React, { Fragment, memo, useCallback, useEffect, useMemo } from "react";
import { Card, Row, Col, Select, Input, Button, DatePicker, theme, Typography, Flex, Image } from "antd";
import dayjs from "dayjs";
import { OPTION_TYPE_PACKAGE, OPTIONS_FILTER_MILESTONE, OPTIONS_FILTER_PICKUP, OPTIONS_PROTOCOL } from "../constants";
import { CloseOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;

const MAX_FILTERS = 11;
const { Text } = Typography;

const SectionFilter = ({ onSearch, form, setIds, filtersPackage, setFiltersPackage, optionsSmeWarehouse, optionsChannel, optionsStore, optionsShippingUnit, smeWarehouse, setSmeWarehouse }) => {
	const currentWarehouse = useMemo(() => {
		return optionsSmeWarehouse?.find((sw) => sw?.value == smeWarehouse);
	}, [smeWarehouse, optionsSmeWarehouse]);

	useEffect(() => {
		if (!smeWarehouse) {
			let defaultWh = optionsSmeWarehouse?.find((sw) => sw?.is_default);
			setSmeWarehouse(defaultWh?.value);
		}
	}, [optionsSmeWarehouse]);

	const optionsFilterPickup = useMemo(() => {
		return OPTIONS_FILTER_PICKUP?.filter((item) => !filtersPackage?.some((pk) => pk?.type == item?.value));
	}, [filtersPackage]);

	const isDisableSearch = useMemo(() => {
		const hasEmpty = filtersPackage?.every((pk) => {
			const needCheck = pk?.type == "orderCode" || pk?.type == "range_time" || pk?.type == "shipExpiredAt";
			if (needCheck || !pk?.type) return !pk?.value;
			return false;
		});
		return hasEmpty;
	}, [filtersPackage]);

	const disabledFutureDate = useCallback((current) => {
		return current > dayjs().endOf("day");
	}, []);

	const rangeTime = filtersPackage?.find((_) => _.type == "range_time");

	const onSearchPackages = () => {
		if (!smeWarehouse) {
			return;
		}
		onSearch();
		setIds([]);
	};
	console.log(filtersPackage);
	return (
		<Card style={{ marginBottom: 16 }}>
			<Row gutter={16}>
				<Col span={20}>
					<Row align="middle" style={{ marginBottom: 16 }} gutter={10}>
						<Col span={6}>
							Kho vật lý <Text style={{ color: "red" }}>*</Text>
						</Col>
						<Col span={18}>
							<Select
								value={currentWarehouse?.value}
								placeholder="Chọn kho"
								showSearch
								optionFilterProp="label"
								options={optionsSmeWarehouse}
								style={{ width: "100%" }}
								onChange={(val) => {
									setSmeWarehouse(val);
									form.setFieldValue("smeWarehouse", val);
								}}
							/>
						</Col>
					</Row>

					<Row align="middle" style={{ marginBottom: 16 }}>
						<Col span={6}>
							Ngày tạo phiếu <Text style={{ color: "red" }}>*</Text>
						</Col>
						<Col span={18}>
							<RangePicker
								showTime
								format="DD/MM/YYYY HH:mm"
								value={rangeTime?.value}
								style={{ width: "100%" }}
								disabledDate={disabledFutureDate}
								onChange={(values) => {
									let converted: any = null;
									if (values) {
										const from = dayjs(values[0]).startOf("minute");
										const to = dayjs(values[1]).endOf("minute");
										converted = [from, to];
									}
									setFiltersPackage((prev) => prev.map((pk) => (pk?.id === rangeTime?.id ? { ...pk, value: converted } : pk)));
								}}
							/>
						</Col>
					</Row>

					{filtersPackage
						?.filter((_) => _.type != "range_time")
						?.map((item, index) => {
							let optionsFilter: any = [];
							if (item?.type == "storeId") optionsFilter = optionsStore;
							if (item?.type == "channelCode") optionsFilter = optionsChannel;
							if (item?.type == "shippingCarrier") optionsFilter = optionsShippingUnit;
							if (item?.type == "milestone") optionsFilter = OPTIONS_FILTER_MILESTONE;
							if (item?.type == "protocol") optionsFilter = OPTIONS_PROTOCOL;
							if (item?.type == "type") optionsFilter = OPTION_TYPE_PACKAGE;
							return (
								<Card
									key={item?.id}
									style={{
										marginBottom: 16,
										borderRadius: 50,
										border: "1px solid #eee",
									}}
								>
									<Row align="middle">
										<Col span={6}>{item?.label || "Điều kiện lọc"}</Col>
										<Col span={16}>
											{!item?.type && (
												<Select
													placeholder="Chọn điều kiện lọc"
													style={{ width: "100%" }}
													options={optionsFilterPickup}
													onChange={(value, option) => {
														setFiltersPackage((prev) =>
															prev.map((pk) =>
																pk.id == item.id
																	? {
																			...pk,
																			...option,
																			type: value,
																			value: null,
																	  }
																	: pk
															)
														);
													}}
												/>
											)}

											{["orderCode", "warehouseBillItem.variant.sku", "code"].includes(item?.type) && (
												<Input
													placeholder={item?.placeholder}
													value={item?.value}
													onChange={(e) => {
														const v = e.target.value;
														setFiltersPackage((prev) => prev.map((pk) => (pk.id == item.id ? { ...pk, value: v } : pk)));
													}}
												/>
											)}

											{["storeId", "channelCode"].includes(item?.type) && (
												<Select
													mode={"multiple"}
													value={item?.value?.map((_v) => _v?.value)}
													options={optionsFilter}
													style={{ width: "100%" }}
													placeholder={item?.placeholder}
													onChange={(values, option) => {
														setFiltersPackage((prev) => prev.map((pk) => (pk.id == item.id ? { ...pk, value: option } : pk)));
													}}
													optionRender={(option: any) => {
														return (
															<Flex align="center" gap={4}>
																<Text>{!!option?.data?.logo && <Image src={option?.data?.logo} preview={false} width={18} height={18} alt="" />}</Text>
																<Text>{option.label}</Text>
															</Flex>
														);
													}}
													tagRender={({ label, value, closable, onClose }) => {
														const option: any = optionsFilter.find((op: any) => op.value === value);

														return (
															<Flex align="center" gap={4} className="ant-select-selection-item">
																<Flex align="center" gap={4}>
																	<Text>{!!option?.logo && <Image src={option?.logo} preview={false} width={18} height={18} alt="" />}</Text>
																	<Text>{option.label}</Text>
																</Flex>
																{closable && (
																	<Text onClick={onClose} style={{ marginLeft: 4, cursor: "pointer" }}>
																		×
																	</Text>
																)}
															</Flex>
														);
													}}
												/>
											)}

											{["milestone", "protocol"].includes(item?.type) && (
												<Select
													mode={"multiple"}
													value={item?.value?.map((_v) => _v?.value)}
													options={optionsFilter}
													style={{ width: "100%" }}
													placeholder={item?.placeholder}
													onChange={(values, option) => {
														setFiltersPackage((prev) => prev.map((pk) => (pk.id == item.id ? { ...pk, value: option } : pk)));
													}}
												/>
											)}

											{["shippingCarrier", "type"].includes(item?.type) && (
												<Select
													value={item?.value?.value}
													options={optionsFilter}
													style={{ width: "100%" }}
													placeholder={item?.placeholder}
													onChange={(values, option) => {
														setFiltersPackage((prev) => prev.map((pk) => (pk.id == item.id ? { ...pk, value: option } : pk)));
													}}
												/>
											)}

											{item?.type == "shipExpiredAt" && (
												<RangePicker
													showTime
													style={{ width: "100%" }}
													format="DD/MM/YYYY HH:mm"
													value={item?.value}
													onChange={(values) => {
														let converted: any = null;
														if (values) {
															converted = [dayjs(values[0]).startOf("minute"), dayjs(values[1]).endOf("minute")];
														}
														setFiltersPackage((prev) => prev.map((pk) => (pk.id == item.id ? { ...pk, value: converted } : pk)));
													}}
												/>
											)}
										</Col>

										<Col span={2} style={{ textAlign: "right" }}>
											<CloseOutlined style={{ color: "red", cursor: "pointer" }} onClick={() => setFiltersPackage((prev) => prev.filter((pk) => pk.id != item.id))} />
										</Col>
									</Row>
								</Card>
							);
						})}

					{filtersPackage?.length < MAX_FILTERS && (
						<Text
							style={{
								color: "#1677ff",
								cursor: "pointer",
								textDecoration: "underline",
							}}
							onClick={() => setFiltersPackage((prev) => [...prev, { id: Date.now().toString() }])}
						>
							Thêm điều kiện lọc
						</Text>
					)}
				</Col>
				<Col span={4}>
					<Button type="primary" className="btn-base" block disabled={isDisableSearch || !smeWarehouse} onClick={onSearchPackages}>
						Tìm kiếm
					</Button>
				</Col>
			</Row>
		</Card>
	);
};

export default memo(SectionFilter);
