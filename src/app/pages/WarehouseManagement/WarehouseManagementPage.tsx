import { useGlobalSliceSlice } from "app/slice";
import React, { memo, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Navigate, Route, Routes, useLocation, useSearchParams } from "react-router-dom";
import LayoutWarehouse from "app/pages/WarehouseManagement/components/Layout";
import AuthorizeRoute from "app/components/AuthorizeRoute";
import WarehouseList from "./WarehouseList";
import LocationManage from "./LocationManagement";
import ProductStock from "./ProductStock";
import WarehouseCreate from "./WarehouseCreate";
import WarehouseUpdate from "./WarehouseUpdate";
import HistoryExport from "./HistoryExport";
import ProcessingList from "./ProcessingList";
import ProcessingListTest from "./ProcessingListTest";
import ProcessingCreate from "./ProcessingCreate";
import ProcessingDetail from "./ProcessingDetail";
import WarehouseBillInList from "./WarehouseBillInList";
import WarehouseBillOutList from "./WarehouseBillOutList";
import WarehouseBillInDetail from "./WarehouseBillInDetail";
import WarehouseBillOutDetail from "./WarehouseBillOutDetail";
import PackStation from "./PackStation";
import PackingDetail from "./PackingDetail";
import LabelPackStation from "./PackingLabel";
import HandOverList from "./HandOverList";
import HandOverDetail from "./HandOverDetail";
import Operation from "../Fullfillment/Operation";
import Restock from "./Restock";
import { FullfillmentProvider } from "app/contexts/FullfillmentContext";
import ReturnReceipt from "./ReturnReceipt";
import ReturnReceiptDetail from "./ReturnReceiptDetail";

export const WarehouseManagementPage = () => {
	const [searchParams] = useSearchParams();
	const dispatch = useDispatch();
	const location = useLocation();
	const { actions } = useGlobalSliceSlice();

	return (
		<Routes>
			<Route index element={<Navigate to="warehouse-list" replace />} />
			<Route
				path={"warehouse-list"}
				element={
					<LayoutWarehouse>
						<WarehouseList />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"warehouse-bill-in"}
				element={
					<LayoutWarehouse>
						<WarehouseBillInList />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"warehouse-bill-out"}
				element={
					<LayoutWarehouse>
						<WarehouseBillOutList />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"location-manage"}
				element={
					<LayoutWarehouse>
						<LocationManage />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"product-stock"}
				element={
					<LayoutWarehouse>
						<ProductStock />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"warehouse-list/create"}
				element={
					<LayoutWarehouse>
						<WarehouseCreate />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"history-export-product-stock"}
				element={
					<LayoutWarehouse>
						<HistoryExport />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"warehouse-list/:id"}
				element={
					<LayoutWarehouse>
						<WarehouseUpdate />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"processing-list"}
				element={
					<LayoutWarehouse>
						<ProcessingList />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"processing-create"}
				element={
					<LayoutWarehouse>
						<ProcessingCreate />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"processing-list/:id"}
				element={
					<LayoutWarehouse>
						<ProcessingDetail />
					</LayoutWarehouse>
				}
			/>

			<Route
				path={"warehouse-bill-in/:id"}
				element={
					<LayoutWarehouse>
						<WarehouseBillInDetail />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"warehouse-bill-out/:id"}
				element={
					<LayoutWarehouse>
						<WarehouseBillOutDetail />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"pack-station"}
				element={
					<LayoutWarehouse>
						<PackStation />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"label-packing"}
				element={
					<LayoutWarehouse>
						<LabelPackStation />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"pack-detail/:id"}
				element={
					<LayoutWarehouse>
						<PackingDetail />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"hand-over-list"}
				element={
					<LayoutWarehouse>
						<HandOverList />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"hand-over-list/:id"}
				element={
					<LayoutWarehouse>
						<HandOverDetail />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"restock"}
				element={
					<LayoutWarehouse>
						<Restock />
					</LayoutWarehouse>
				}
			/>
		</Routes>
	);
};

export const WarehouseFFMManagementPage = () => {
	return (
		<Routes>
			<Route index element={<Navigate to="product-stock" replace />} />
			<Route
				path={"warehouse-list"}
				element={
					<LayoutWarehouse>
						<WarehouseList />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"location-manage"}
				element={
					<LayoutWarehouse>
						<LocationManage />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"product-stock"}
				element={
					<LayoutWarehouse>
						<ProductStock />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"return-receipt"}
				element={
					<LayoutWarehouse>
						<ReturnReceipt />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"warehouse-list/create"}
				element={
					<LayoutWarehouse>
						<WarehouseCreate />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"history-export-product-stock"}
				element={
					<LayoutWarehouse>
						<HistoryExport />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"warehouse-list/:id"}
				element={
					<LayoutWarehouse>
						<WarehouseUpdate />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"return-receipt/:id"}
				element={
					<LayoutWarehouse>
						<ReturnReceiptDetail />
					</LayoutWarehouse>
				}
			/>
		</Routes>
	);
};

export const InboundManagementPage = () => {
	return (
		<Routes>
			<Route index element={<Navigate to="warehouse-bill-in" replace />} />
			<Route
				path={"warehouse-bill-in"}
				element={
					<LayoutWarehouse>
						<WarehouseBillInList />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"warehouse-bill-in/:id"}
				element={
					<LayoutWarehouse>
						<WarehouseBillInDetail />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"restock"}
				element={
					<LayoutWarehouse>
						<Restock />
					</LayoutWarehouse>
				}
			/>
		</Routes>
	);
}

export const OutboundManagementPage = () => {
	return (
		<Routes>
			<Route index element={<Navigate to="operation" replace />} />
			<Route
				path={"operation"}
				element={
					<FullfillmentProvider>
							<Operation />
						</FullfillmentProvider>
				}
			/>
			
			<Route
				path={"warehouse-bill-out"}
				element={
					<LayoutWarehouse>
						<WarehouseBillOutList />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"processing-list"}
				element={
					<LayoutWarehouse>
						<ProcessingList />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"processing-create"}
				element={
					<LayoutWarehouse>
						<ProcessingCreate />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"processing-list/:id"}
				element={
					<LayoutWarehouse>
						<ProcessingDetail />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"warehouse-bill-out/:id"}
				element={
					<LayoutWarehouse>
						<WarehouseBillOutDetail />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"pack-station"}
				element={
					<LayoutWarehouse>
						<PackStation />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"label-packing"}
				element={
					<LayoutWarehouse>
						<LabelPackStation />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"pack-detail/:id"}
				element={
					<LayoutWarehouse>
						<PackingDetail />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"hand-over-list"}
				element={
					<LayoutWarehouse>
						<HandOverList />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"hand-over-list/:id"}
				element={
					<LayoutWarehouse>
						<HandOverDetail />
					</LayoutWarehouse>
				}
			/>
			<Route
				path={"processing-list-test"}
				element={
					<LayoutWarehouse>
						<ProcessingListTest />
					</LayoutWarehouse>
				}
			/>
		</Routes>
	);
}
