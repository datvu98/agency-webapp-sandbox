import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Select, Input, Button, Row, Col, Space } from "antd";
import { useQuery } from "@apollo/client";
import queryString from "querystring";
import _, { omit } from "lodash";
import { OPTIONS_STATUS, OPTIONS_USAGE_STATUS } from "../../constants";
import query_locationManagerList from "graphql/queries/query_locationManagerList";

const SlotManagementFilter = ({ setShowAdd, optionsWarehouse, setShowAddFile }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const params = new URLSearchParams(location.search);
	const queryParams = Object.fromEntries(params.entries());
	const [searchText, setSearchText] = useState(queryParams?.q || "");
	const [priority, setPriority] = useState(queryParams?.priority || "");

	const warehouseId = useMemo(() => {
		if (!queryParams?.warehouse) return optionsWarehouse?.[0]?.value;
		return +queryParams?.warehouse;
	}, [queryParams?.warehouse, optionsWarehouse]);

	const { data: dataArea, loading: loadingDataArea } = useQuery(query_locationManagerList, {
		variables: { warehouseId, type: "area" },
		fetchPolicy: "cache-and-network",
	});

	const { data: dataRack, loading: loadingDataRack } = useQuery(query_locationManagerList, {
		variables: { warehouseId, type: "rack" },
		fetchPolicy: "cache-and-network",
	});

	const { data: dataFloor, loading: loadingDataFloor } = useQuery(query_locationManagerList, {
		variables: { warehouseId, type: "level" },
		fetchPolicy: "cache-and-network",
	});

	useEffect(() => {
		setSearchText(queryParams?.q || "");
		setPriority(queryParams?.priority || "");
	}, [queryParams?.q, queryParams?.priority, queryParams?.warehouse]);

	const [optionArea, optionLevel, optionRack] = useMemo(() => {
		if (!dataArea?.locationManagerList?.data?.length) return [[], [], []];
		let area = dataArea.locationManagerList.data.map((item) => ({
			label: item.code,
			value: item.id,
		}));

		let allLevel = dataFloor?.locationManagerList?.data?.map((item) => ({
			label: item.code,
			value: item.id,
			areaId: item?.area?.id,
		}));

		let allRack = dataRack?.locationManagerList?.data?.map((item) => ({
			label: item.code,
			value: item.id,
			areaId: item?.area?.id,
		}));

		let level = queryParams?.area
			? allLevel?.filter((lv) =>
					queryParams?.area
						?.split(",")
						?.map((a) => +a)
						?.includes(lv.areaId)
			  )
			: allLevel;

		let rack = queryParams?.area
			? allRack?.filter((lv) =>
					queryParams?.area
						?.split(",")
						?.map((a) => +a)
						?.includes(lv.areaId)
			  )
			: allRack;

		return [area, level, rack];
	}, [dataArea, dataFloor, dataRack, queryParams?.area]);

	const handleNavigate = (newParams) => {
		navigate(
			`${location.pathname}?${queryString.stringify({
				...params,
				...newParams,
			})}`
		);
	};

	return (
		<>
			<Row gutter={[16, 16]} style={{ marginBottom: 10 }}>
				<Col span={6}>
					<Select
						mode="multiple"
						className="w-100"
						allowClear
						loading={loadingDataArea}
						placeholder="Chọn khu vực"
						value={
							queryParams?.area
								? optionArea
										?.filter((item) =>
											queryParams?.area
												?.split(",")
												?.map((a) => +a)
												?.includes(item.value)
										)
										.map((i) => i.value)
								: undefined
						}
						options={optionArea}
						onChange={(values) => {
							if (!values?.length) {
								handleNavigate(omit(queryParams, ["area", "rack", "level"]));
								return;
							}
							handleNavigate(
								omit(
									{
										...queryParams,
										page: 1,
										area: values.join(","),
									},
									["rack", "level"]
								)
							);
						}}
						optionFilterProp="label"
					/>
				</Col>

				<Col span={6}>
					<Select
						mode="multiple"
						className="w-100"
						allowClear
						loading={loadingDataRack}
						placeholder="Chọn kệ"
						value={
							queryParams?.rack
								? optionRack
										?.filter((item) =>
											queryParams?.rack
												?.split(",")
												?.map((a) => +a)
												?.includes(item.value)
										)
										.map((i) => i.value)
								: undefined
						}
						options={optionRack}
						onChange={(values) => {
							if (!values?.length) {
								handleNavigate(omit(queryParams, ["rack"]));
								return;
							}
							handleNavigate({
								...queryParams,
								page: 1,
								rack: values.join(","),
							});
						}}
						optionFilterProp="label"
					/>
				</Col>

				<Col span={6}>
					<Select
						mode="multiple"
						className="w-100"
						allowClear
						loading={loadingDataFloor}
						placeholder="Chọn tầng"
						value={
							queryParams?.level
								? optionLevel
										?.filter((item) =>
											queryParams?.level
												?.split(",")
												?.map((a) => +a)
												?.includes(item.value)
										)
										.map((i) => i.value)
								: undefined
						}
						options={optionLevel}
						onChange={(values) => {
							if (!values?.length) {
								handleNavigate(omit(queryParams, ["level"]));
								return;
							}
							handleNavigate({
								...queryParams,
								page: 1,
								level: values.join(","),
							});
						}}
						optionFilterProp="label"
					/>
				</Col>

				<Col span={6}>
					<Select
						placeholder={"Chọn trạng thái"}
						allowClear
						className="w-100"
						value={params.get("isActive") ? OPTIONS_STATUS.find((item) => item?.value == Number(params.get("isActive"))) : undefined}
						options={OPTIONS_STATUS}
						onChange={(value) => {
							if (!value) {
								handleNavigate(omit(queryParams, ["isActive"]));
							} else {
								handleNavigate({
									...queryParams,
									page: 1,
									isActive: value,
								});
							}
						}}
					/>
				</Col>
			</Row>

			<Row gutter={[16, 16]}>
				<Col span={6}>
					<Input
						placeholder="Nhập mã hoặc tên vị trí"
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
							handleNavigate({
								...queryParams,
								page: 1,
								q: e.target.value,
							});
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								const target = e.target as HTMLInputElement;
								handleNavigate({
									...queryParams,
									page: 1,
									q: target.value,
								});
							}
						}}
					/>
				</Col>

				<Col span={6}>
					<Input
						type="number"
						placeholder="Nhập mức độ ưu tiên"
						value={priority}
						onChange={(e) => setPriority(e.target.value)}
						onBlur={(e) => {
							handleNavigate({
								...queryParams,
								page: 1,
								priority: e.target.value,
							});
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								const target = e.target as HTMLInputElement;
								handleNavigate({
									...queryParams,
									page: 1,
									priority: target.value,
								});
							}
						}}
					/>
				</Col>

				<Col span={6}>
					<Select
						allowClear
						placeholder="Chọn trạng thái chứa"
						className="w-100"
						value={params.get("usage_capacity") ? OPTIONS_USAGE_STATUS.find((item) => item?.value == Number(params.get("usage_capacity"))) : undefined}
						options={OPTIONS_USAGE_STATUS}
						onChange={(value) => {
							if (!value) {
								handleNavigate(omit(queryParams, ["usage_capacity"]));
								return;
							}
							handleNavigate({
								...queryParams,
								page: 1,
								usage_capacity: value,
							});
						}}
					/>
				</Col>
			</Row>

			<Row style={{ marginBottom: 8 }}>
				<Col span={24}>
					<Space style={{ width: "100%", justifyContent: "flex-end" }}>
						<Button onClick={() => setShowAddFile("slot")} className="btn-base">
							Thêm theo file
						</Button>
						<Button type="primary" className="btn-base" onClick={() => setShowAdd("slot")}>
							Thêm mới
						</Button>
					</Space>
				</Col>
			</Row>
		</>
	);
};

export default SlotManagementFilter;
