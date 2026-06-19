import AuthorizeRoute from "app/components/AuthorizeRoute";
import { NotFoundPage } from "app/components/NotFoundPage/Loadable";
import { SocketProvider } from "app/contexts/SocketContext";
import { useGlobalSliceSlice } from "app/slice";
import React, { memo, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes, useLocation, useSearchParams } from "react-router-dom";
import AuthorizationPage from "../Authentication/AuthorizationPage";
import { ChatPage } from "../ChatPage/Loadable";
import Dashboard from "./Dasboard";
import { ReportOverview } from "app/pages/Report/Loadable";
import { ReportProvider } from "app/contexts/ReportContext";
import { FullfillmentProvider } from "app/contexts/FullfillmentContext";
import Operation from "../Fullfillment/Operation";
import { FullfillmentReport } from "../Fullfillment/Loadable";
import { SettlementProvider } from "app/contexts/SettlementContext";
import { HistoryExportFileSettlementPending, HistoryExportFileSettlementProcessed, SettlementManual } from "../Settlement/Loadable";
import { InboundManagementPage, OutboundManagementPage, WarehouseFFMManagementPage, WarehouseManagementPage } from "../WarehouseManagement/WarehouseManagementPage";
import { SettingPage } from "../Setting/SettingPage";
import CampaignPage from "../Campaigns/CampaignPage";
import { selectGlobalSlice } from "app/slice/selectors";
import { ReportPage } from "../Report/ReportPage";
import InventoryCountingPage from "../InventoryCounting";

const Layout = () => {
	const { user } = useSelector(selectGlobalSlice);
	

	const isFulfillment = useMemo(() => {
		if (user?.category_code == 'fulfillment') {
			return  true
		}
		return false
	}, [user])

	return (
		<Dashboard>
			{isFulfillment ? <Routes>
				<Route path="/report/*" element={<ReportPage />} />
				<Route path="/inventory-counting/*" element={<InventoryCountingPage />} />
				<Route path="/warehouse-manage/*" element={<WarehouseFFMManagementPage />} />
				<Route path="/inbound-manage/*" element={<InboundManagementPage />} />
				<Route path="/outbound-manage/*" element={<OutboundManagementPage />} />
				<Route path="/settings/*" element={<SettingPage />} />
				<Route path={"/"} element={<Navigate to="/settings/smes" />} />
				<Route path={"/error/403"} element={<AuthorizationPage />} />
				<Route path="*" element={<NotFoundPage />} />
			</Routes> : <Routes>
				<Route
					path={"/chats"}
					element={
						<SocketProvider>
							<ChatPage />
						</SocketProvider>
					}
				/>
				<Route path="/report/*" element={<ReportPage />} />
				<Route
					path={"/fullfillment-manage/operation"}
					element={
						<FullfillmentProvider>
							<Operation />
						</FullfillmentProvider>
					}
				/>
				<Route
					path={"/settlement-manage/exportfile-settlement-pending"}
					element={
						<SettlementProvider>
							<HistoryExportFileSettlementPending />
						</SettlementProvider>
					}
				/>
				<Route
					path={"/settlement-manage/exportfile-settlement-processed"}
					element={
						<SettlementProvider>
							<HistoryExportFileSettlementProcessed />
						</SettlementProvider>
					}
				/>
				<Route path="/settings/*" element={<SettingPage />} />
				<Route path="/warehouse-manage/*" element={<WarehouseManagementPage />} />
				<Route
					path="/campaign-manage/*"
					element={
						<FullfillmentProvider>
							<CampaignPage />
						</FullfillmentProvider>
					}
				/>
				<Route path={"/"} element={<Navigate to="/settings/smes" />} />
				<Route path={"/error/403"} element={<AuthorizationPage />} />
				<Route path="*" element={<NotFoundPage />} />
			</Routes>}
		</Dashboard>
	);
};

export default memo(Layout);
