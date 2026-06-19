import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, Col, Collapse, Empty, Flex, List, Row, Spin, Switch, Tooltip, Typography, theme, Image } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { showAlert } from "utils/helper";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";
import queryString from "querystring";
import { LocationManageWrapper } from "./Location.style";
import query_sme_warehouse_list from "graphql/queries/query_sme_warehouse_list";
import query_locationManagerList from "graphql/queries/query_locationManagerList";
import mutate_locationManagerUpdate from "graphql/mutations/mutate_locationManagerUpdate";
import { ShowModalConfirmType, ShowModalDetailType, ShowModalResultType } from "./type";
import RackManagementTable from "./components/rack/RackMangementTable";
import LocationManagementFilter from "./components/LocationManagementFilter";
import AreaManagementTable from "./components/area/AreaManagementTable";
import ModalAddArea from "./dialogs/area/ModalAddArea";
import ModalDetailArea from "./dialogs/area/ModalDetailArea";
import ModalConfirm from "./dialogs/ModalConfirm";
import ModalAddRack from "./dialogs/rack/ModalAddRack";
import AisleManagementTable from "./components/aisle/AisleManagementTable";
import ModalAddAisle from "./dialogs/aisle/ModalAddAisle";
import ModalDetailAisle from "./dialogs/aisle/ModalDetailAisle";
import ModalDetailRack from "./dialogs/rack/ModalDetailRack";
import ModalUploadFileAisle from "./dialogs/aisle/ModalUploadFileAisle";
import ModalResultUploadAisle from "./dialogs/aisle/ModalResultUploadAisle";
import ModalUploadFileRack from "./dialogs/rack/ModalUploadFileRack";
import ModalResultUploadRack from "./dialogs/rack/ModalResultUploadRack";
import LevelManagementTable from "./components/level/LevelManagementTable";
import ModalAddLevel from "./dialogs/level/ModalAddLevel";
import ModalDetailLevel from "./dialogs/level/ModalDetailLevel";
import SlotManagementTable from "./components/slot/SlotManagementTable";
import ModalAddSlot from "./dialogs/slot/ModalAddSlot";
import ModalDetailSlot from "./dialogs/slot/ModalDetailSlot";
import ModalUploadFileSlot from "./dialogs/slot/ModalUploadFileSlot";
import ModalResultUploadFileSlot from "./dialogs/slot/ModalResultUploadFileSlot";
import SizeManagementTable from "./components/size/SizeManagementTable";
import StorageEquipmentTable from "./components/storageEquipment/StorageEquipmentTable";
import query_storageEquipmentList from "graphql/queries/query_storageEquipmentList";
import mutate_storageEquipmentUpdate from "graphql/mutations/mutate_storageEquipmentUpdate";
import ModalAddStorage from "./dialogs/storage/ModalAddStorage";
import ModalDetailStorage from "./dialogs/storage/ModalDetailStorage";
import ModalUploadFileStorage from "./dialogs/storage/ModalUploadFileStorage";
import ModalResultUploadStorage from "./dialogs/storage/ModalResultUploadStorage";

const { Text } = Typography;

const LocationManage = () => {
	const { appendBreadcrumb } = useLayoutContext();
	const navigate = useNavigate();
	const { user } = useSelector(selectGlobalSlice);
	const params = queryString.parse(location.search.slice(1, 100000)) as any;

	useLayoutEffect(() => {
		appendBreadcrumb([
			{
				title: "Quản lý kho",
				pathname: "/warehouse-manage",
			},
			{
				title: "Quản lý vị trí",
				pathname: "/warehouse-manage/location-manage",
			},
		]);
	}, []);

	const [showAdd, setShowAdd] = useState("");
	const [showAddFile, setShowAddFile] = useState("");
	const [showResult, setShowResult] = useState<ShowModalResultType | null>(null);
	const [showDetail, setShowDetail] = useState<ShowModalDetailType | null>(null);
	const [showModalConfirm, setShowModalConfirm] = useState<ShowModalConfirmType | null>(null);

	const { data: dataWarehouse, loading: loadingDataWarehouse } = useQuery(query_sme_warehouse_list, {
		variables: {
			where: {
				fulfillment_by: {
					_eq: 1,
				},
				status: {
					_eq: 10,
				},
			},
		},
		fetchPolicy: "cache-and-network",
	});

	const searchs = useMemo(() => {
		if (!params?.q) return [];
		return params?.q?.split(",")?.map((item) => item?.trim());
	}, [params?.q]);

	const pageNumber = useMemo(() => {
		if (!params?.page) return 1;
		return +params?.page;
	}, [params?.page]);

	const pageSize = useMemo(() => {
		if (!params?.limit) return 25;
		return +params?.limit;
	}, [params?.limit]);

	const type = useMemo(() => {
		if (!params?.sub_tab) return "slot";
		return params?.sub_tab;
	}, [params?.sub_tab]);

	const areaId_in = useMemo(() => {
		if (!params?.area) return [];
		return params?.area?.split(",")?.map((itemId) => +itemId);
	}, [params?.area]);

	const levelId_in = useMemo(() => {
		if (!params?.level) return [];
		return params?.level?.split(",")?.map((itemId) => +itemId);
	}, [params?.level]);

	const rackId_in = useMemo(() => {
		if (!params?.rack) return [];
		return params?.rack?.split(",")?.map((itemId) => +itemId);
	}, [params?.rack]);

	const priority = useMemo(() => {
		if (!params?.priority) return null;
		return +params?.priority;
	}, [params?.priority]);

	const isActive = useMemo(() => {
		if (!params?.isActive) return null;
		if (params?.isActive == 1) return false;
		if (params?.isActive == 2) return true;
	}, [params?.isActive]);

	const searchFields = useMemo(() => {
		return ["name", "code"];
	}, []);

	const deviceType_in = useMemo(() => {
		return ["mobile"];
	}, []);

	const containerType_in = useMemo(() => {
		if (!params?.containerType) return [];
		return params?.containerType?.split(",");
	}, [params?.containerType]);

	const warehouseId = useMemo(() => {
		if (!params?.warehouse) {
			if (params?.tab != "storage") {
				return dataWarehouse?.smeWarehouseByAgency?.data?.[0]?.id;
			}
			return dataWarehouse?.smeWarehouseByAgency?.data?.find((wh) => !!wh?.is_default)?.id || dataWarehouse?.smeWarehouseByAgency?.data?.[0]?.id;
		}
		return +params?.warehouse;
	}, [params?.warehouse, dataWarehouse, params?.tab]);

	const currentWh = useMemo(() => {
		return dataWarehouse?.smeWarehouseByAgency?.data?.find((wh) => wh?.id == warehouseId);
	}, [dataWarehouse, warehouseId]);

	const usage_capacity = useMemo(() => {
		if (params?.usage_capacity == 1) {
			return {
				usageCapacityRatio_lt: 100,
			};
		}
		if (params?.usage_capacity == 2) {
			return {
				usageCapacityRatio_gte: 100,
			};
		}
		return {};
	}, [params?.usage_capacity]);

	const { data, loading, error, refetch } = useQuery(query_locationManagerList, {
		variables: {
			pageNumber,
			pageSize,
			searchs,
			searchFields,
			warehouseId,
			type,
			isActive,
			areaId_in,
			levelId_in,
			rackId_in,
			priority,
			...usage_capacity,
		},
		skip: params?.tab == "storage",
		fetchPolicy: "cache-and-network",
	});

	const {
		data: dataEquipment,
		loading: loadingEquipment,
		error: errorEquipment,
		refetch: refetchEquipment,
	} = useQuery(query_storageEquipmentList, {
		variables: {
			pageNumber,
			pageSize,
			searchs,
			searchFields,
			warehouseId,
			containerType_in,
			deviceType_in,
			isActive,
		},
		skip: params?.tab != "storage",
		fetchPolicy: "cache-and-network",
	});

	const [locationManagerUpdate, { loading: loadingLocationManagerUpdate }] = useMutation(mutate_locationManagerUpdate, {
		awaitRefetchQueries: true,
		refetchQueries: ["locationManagerList"],
	});

	const [storageEquipmentUpdate, { loading: loadingStorageEquipmentUpdate }] = useMutation(mutate_storageEquipmentUpdate, {
		awaitRefetchQueries: true,
		refetchQueries: ["storageEquipmentList"],
	});

	const text = useMemo(() => {
		switch (showModalConfirm?.data?.type) {
			case "area":
				return "khu vực";
			case "rack":
				return "kệ";
			case "level":
				return "tầng";
			case "aisle":
				return "luống đi";
			case "storage":
				return "thiết bị chứa";
			default:
				return "vị trí lưu kho";
		}
	}, [showModalConfirm]);

	const handleUpdate = async () => {
		if (showModalConfirm?.data?.type != "storage") {
			let { data: dataUpdate } = await locationManagerUpdate({
				variables: {
					updated: {
						id: showModalConfirm?.data?.id,
						code: showModalConfirm?.data?.type == "level" ? `${showModalConfirm?.data?.code}` : showModalConfirm?.data?.code?.toUpperCase(),
						name: showModalConfirm?.data?.name,
						priority: Number(showModalConfirm?.data?.priority) || 0,
						areaId: Number(showModalConfirm?.data?.areaId) || null,
						...(showModalConfirm?.data?.type == "rack" ? { aisleId: showModalConfirm?.data?.aisleId } : {}),
						...(showModalConfirm?.data?.type == "slot" ? { rackId: showModalConfirm?.data?.rackId } : {}),
						...(showModalConfirm?.data?.type == "slot" ? { levelId: showModalConfirm?.data?.levelId } : {}),
						...(showModalConfirm?.data?.type == "slot" ? { length: showModalConfirm?.data?.length } : {}),
						...(showModalConfirm?.data?.type == "slot" ? { width: showModalConfirm?.data?.width } : {}),
						...(showModalConfirm?.data?.type == "slot" ? { height: showModalConfirm?.data?.height } : {}),
						...(showModalConfirm?.data?.type == "slot" ? { maxCapacity: showModalConfirm?.data?.maxCapacity } : {}),
					},
				},
			});
			if (dataUpdate?.locationManagerUpdate?.success) {
				showAlert.success(`Cập nhật ${text} thành công.`);
			} else {
				showAlert.error(dataUpdate?.locationManagerUpdate?.message || `Cập nhật ${text} thất bại.`);
			}
		} else {
			let { data: dataUpdate } = await storageEquipmentUpdate({
				variables: {
					updated: {
						id: showModalConfirm?.data?.id,
						code: showModalConfirm?.data?.code?.toUpperCase(),
						containerType: showModalConfirm?.data?.containerType,
					},
				},
			});
			if (dataUpdate?.storageEquipmentUpdate?.success) {
				showAlert.success(`Cập nhật ${text} thành công.`);
			} else {
				showAlert.error(dataUpdate?.storageEquipmentUpdate?.message || `Cập nhật ${text} thất bại.`);
			}
		}
		setShowModalConfirm(null);
	};
	return (
		<LocationManageWrapper>
			<Helmet titleTemplate="Quản lý vị trí" defaultTitle="Quản lý vị trí">
				<meta name="description" content="Quản lý vị trí" />
			</Helmet>
			{showModalConfirm?.show && <ModalConfirm show={showModalConfirm?.show} onHide={() => setShowModalConfirm(null)} text={text} onConfirm={handleUpdate} />}
			{showAdd == "area" && <ModalAddArea show={showAdd == "area"} onHide={() => setShowAdd("")} warehouseId={warehouseId} />}
			{showAdd == "rack" && <ModalAddRack show={showAdd == "rack"} onHide={() => setShowAdd("")} warehouseId={warehouseId} />}
			{showAdd == "aisle" && <ModalAddAisle show={showAdd == "aisle"} onHide={() => setShowAdd("")} warehouseId={warehouseId} />}
			{showAdd == "level" && <ModalAddLevel show={showAdd == "level"} onHide={() => setShowAdd("")} warehouseId={warehouseId} />}
			{showAdd == "slot" && <ModalAddSlot show={showAdd == "slot"} onHide={() => setShowAdd("")} warehouseId={warehouseId} />}
			{showAdd == "storage" && <ModalAddStorage show={showAdd == "storage"} onHide={() => setShowAdd("")} warehouseId={warehouseId} />}

			{showDetail?.type == "area" && (
				<ModalDetailArea show={showDetail?.type == "area"} dataDetail={showDetail?.dataDetail} onHide={() => setShowDetail(null)} setShowModalConfirm={setShowModalConfirm} />
			)}
			{showDetail?.type == "aisle" && (
				<ModalDetailAisle
					show={showDetail?.type == "aisle"}
					dataDetail={showDetail?.dataDetail}
					onHide={() => setShowDetail(null)}
					warehouseId={warehouseId}
					setShowModalConfirm={setShowModalConfirm}
				/>
			)}
			{showDetail?.type == "rack" && (
				<ModalDetailRack
					show={showDetail?.type == "rack"}
					dataDetail={showDetail?.dataDetail}
					onHide={() => setShowDetail(null)}
					warehouseId={warehouseId}
					setShowModalConfirm={setShowModalConfirm}
				/>
			)}
			{showDetail?.type == "level" && (
				<ModalDetailLevel
					show={showDetail?.type == "level"}
					dataDetail={showDetail?.dataDetail}
					onHide={() => setShowDetail(null)}
					warehouseId={warehouseId}
					setShowModalConfirm={setShowModalConfirm}
				/>
			)}
			{showDetail?.type == "slot" && (
				<ModalDetailSlot
					show={showDetail?.type == "slot"}
					dataDetail={showDetail?.dataDetail}
					onHide={() => setShowDetail(null)}
					warehouseId={warehouseId}
					setShowModalConfirm={setShowModalConfirm}
				/>
			)}

			{showDetail?.type == "storage" && (
				<ModalDetailStorage
					show={showDetail?.type == "storage"}
					dataDetail={showDetail?.dataDetail}
					onHide={() => setShowDetail(null)}
					warehouseId={warehouseId}
					setShowModalConfirm={setShowModalConfirm}
				/>
			)}

			{showAddFile == "aisle" && (
				<ModalUploadFileAisle
					currentWh={currentWh}
					onHide={() => setShowAddFile("")}
					onShowModalFileUploadResults={(result) => {
						setShowResult({
							type: "aisle",
							dataResult: result,
						});
						setShowAddFile("");
					}}
				/>
			)}

			{showAddFile == "rack" && (
				<ModalUploadFileRack
					currentWh={currentWh}
					onHide={() => setShowAddFile("")}
					onShowModalFileUploadResults={(result) => {
						setShowResult({
							type: "rack",
							dataResult: result,
						});
						setShowAddFile("");
					}}
				/>
			)}

			{showAddFile == "slot" && (
				<ModalUploadFileSlot
					currentWh={currentWh}
					onHide={() => setShowAddFile("")}
					onShowModalFileUploadResults={(result) => {
						setShowResult({
							type: "slot",
							dataResult: result,
						});
						setShowAddFile("");
					}}
				/>
			)}
			{showAddFile == "storage" && (
				<ModalUploadFileStorage
					currentWh={currentWh}
					onHide={() => setShowAddFile("")}
					onShowModalFileUploadResults={(result) => {
						setShowResult({
							type: "storage",
							dataResult: result,
						});
						setShowAddFile("");
					}}
				/>
			)}

			{showResult?.type == "aisle" && <ModalResultUploadAisle dataResults={showResult?.dataResult} onHide={() => setShowResult(null)} />}
			{showResult?.type == "rack" && <ModalResultUploadRack dataResults={showResult?.dataResult} onHide={() => setShowResult(null)} />}
			{showResult?.type == "slot" && <ModalResultUploadFileSlot dataResults={showResult?.dataResult} onHide={() => setShowResult(null)} />}
			{showResult?.type == "storage" && <ModalResultUploadStorage dataResults={showResult?.dataResult} onHide={() => setShowResult(null)} />}
			<Spin spinning={loading || loadingDataWarehouse || loadingLocationManagerUpdate || loadingEquipment || loadingStorageEquipmentUpdate}>
				<Card>
					<LocationManagementFilter dataWarehouse={dataWarehouse} setShowAdd={setShowAdd} setShowAddFile={setShowAddFile} />
					{params?.sub_tab == "rack" && (
						<RackManagementTable setShowDetail={setShowDetail} data={data} loading={loading} refetch={refetch} error={error} locationManagerUpdate={locationManagerUpdate} />
					)}
					{params?.sub_tab == "area" && (
						<AreaManagementTable setShowDetail={setShowDetail} data={data} loading={loading} error={error} refetch={refetch} locationManagerUpdate={locationManagerUpdate} />
					)}
					{params?.sub_tab == "aisle" && (
						<AisleManagementTable setShowDetail={setShowDetail} data={data} loading={loading} refetch={refetch} error={error} locationManagerUpdate={locationManagerUpdate} />
					)}
					{params?.sub_tab == "level" && (
						<LevelManagementTable setShowDetail={setShowDetail} data={data} loading={loading} refetch={refetch} error={error} locationManagerUpdate={locationManagerUpdate} />
					)}
					{params?.tab != "storage" && (params?.sub_tab == "slot" || !params?.sub_tab) && (
						<SlotManagementTable setShowDetail={setShowDetail} data={data} loading={loading} refetch={refetch} error={error} locationManagerUpdate={locationManagerUpdate} />
					)}
					{params?.sub_tab == "size" && <SizeManagementTable warehouseId={warehouseId} />}
					{params?.tab == "storage" && (
						<StorageEquipmentTable
							setShowDetail={setShowDetail}
							data={dataEquipment}
							loading={loadingEquipment}
							refetch={refetchEquipment}
							error={errorEquipment}
							storageEquipmentUpdate={storageEquipmentUpdate}
							dataWarehouse={dataWarehouse}
						/>
					)}
				</Card>
			</Spin>
		</LocationManageWrapper>
	);
};

export default LocationManage;
