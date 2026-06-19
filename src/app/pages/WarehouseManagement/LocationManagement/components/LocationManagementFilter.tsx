import dayjs from "dayjs";
import _, { omit } from "lodash";
import queryString from "querystring";
import React, { Fragment, memo, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import clsx from "clsx";
import { SUB_TABS, TABS } from "../constants";
import RackManagementFilter from "./rack/RackManagementFilter";
import { Col, Flex, Row, Select, Tabs } from "antd";
import AreaManagementFilter from "./area/AreaManagementFilter";
import AisleManagementFilter from "./aisle/AisleManagementFilter";
import LevelManagementFilter from "./level/LevelManagementFilter";
import SlotManagementFilter from "./slot/SlotManagementFilter";
import StorageEquipmentFilter from "./storageEquipment/StorageEquipmentFilter";
// import AreaManagementFilter from "./area/AreaManagementFilter";
// import FloorManagementFilter from "./floor/FloorManagementFilter";
// import SlotManagementFilter from "./slot/SlotmanagementFilter";
// import AisleManagementFilter from "./aisle/AisleManagementFilter";

const LocationManagementFilter = ({ dataWarehouse, setShowAdd, setShowAddFile }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const params = new URLSearchParams(location.search);
	const queryParams = Object.fromEntries(params.entries());
	const optionsWarehouse = useMemo(() => {
		if (!dataWarehouse) return [];
		return dataWarehouse?.smeWarehouseByAgency?.data?.map((wh) => ({
			label: wh?.name,
			value: wh?.id,
			is_default: wh?.is_default,
		}));
	}, [dataWarehouse]);

	const defaultWarehouse = useMemo(() => {
		if (queryParams?.tab == "storage") {
			return optionsWarehouse?.find((item) => !!item?.is_default) || optionsWarehouse?.[0];
		}
		return optionsWarehouse?.[0];
	}, [optionsWarehouse, queryParams?.tab]);

	return (
		<>
			<Flex style={{ marginBottom: 8 }}>
				<Tabs
					onChange={(key) => {
						navigate(`${location.pathname}?tab=${key}`);
					}}
					activeKey={params.get("tab") || "location"}
					type="card"
					items={TABS}
				/>
			</Flex>
			<Row gutter={[16, 16]} style={{ marginBottom: 8 }}>
				<Col span={6}>
					<Select
						placeholder="Kho"
						className="w-100 custom-select-warehouse-sme"
						value={params.get("warehouse") ? optionsWarehouse?.find((option) => option?.value == params.get("warehouse")) : defaultWarehouse}
						options={optionsWarehouse}
						onChange={(value) => {
							const newParams = omit(
								{
									...queryParams,
									page: 1,
									warehouse: value,
								},
								["area", "priority", "isActive", "q", "rack", "floor", "usage_capacity", "containerType"]
							);

							navigate(`${location.pathname}?${queryString.stringify(newParams)}`);
						}}
					/>
				</Col>
			</Row>
			{params.get("tab") != "storage" && (
				<Tabs
					items={SUB_TABS}
					onChange={(key) => {
						const newParams = omit(
							{
								...queryParams,
								page: 1,
								sub_tab: key,
							},
							["area", "priority", "isActive", "q", "rack", "floor", "usage_capacity"]
						);

						navigate(`${location.pathname}?${queryString.stringify(newParams)}`);
					}}
					activeKey={params.get("sub_tab") || "slot"}
				/>
			)}

			{params.get("sub_tab") == "area" && <AreaManagementFilter setShowAdd={setShowAdd} />}
			{params.get("sub_tab") == "rack" && <RackManagementFilter setShowAdd={setShowAdd} optionsWarehouse={optionsWarehouse} setShowAddFile={setShowAddFile} />}
			{params.get("sub_tab") == "aisle" && <AisleManagementFilter setShowAdd={setShowAdd} optionsWarehouse={optionsWarehouse} setShowAddFile={setShowAddFile} />}
			{params.get("sub_tab") == "level" && <LevelManagementFilter setShowAdd={setShowAdd} optionsWarehouse={optionsWarehouse} />}
			{params.get("tab") != "storage" && (params.get("sub_tab") == "slot" || !params.get("sub_tab")) && (
				<SlotManagementFilter setShowAdd={setShowAdd} optionsWarehouse={optionsWarehouse} setShowAddFile={setShowAddFile} />
			)}
			{params.get("tab") == "storage" && <StorageEquipmentFilter setShowAdd={setShowAdd} optionsWarehouse={optionsWarehouse} setShowAddFile={setShowAddFile} />}
		</>
	);
};

export default LocationManagementFilter;
