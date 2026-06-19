import { useGlobalSliceSlice } from "app/slice";
import React, { memo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes, useLocation, useSearchParams } from "react-router-dom";
import LayoutSetting from "app/pages/Setting/components/Layout";
import AuthorizeRoute from "app/components/AuthorizeRoute";
import UserSetting from "./UserSetting";
import ManageSMEs from "./SMEManage";
import UpSConnect from "./UpSConnect";
import CommissionConfig from "./CommissionConfig";
import CommissionCreate from "./CommissionCreate";
import UserChangePassword from "./UserChangePassword";
import UserUpdate from "./UserUpdate";
import SubUserList from "./SubUserList";
import SubUserCreate from "./SubUserCreate";
import SubUserChangePassword from "./SubUserChangePassword";
import SubUserUpdateInfo from "./SubUserUpdateInfo";
import ContractManagement from "./ContractManagement";
import ContractHistories from "./ContractManagement/components/ContractHistories";
import PartnerConnect from "./PartnerConnect";
import { selectGlobalSlice } from "app/slice/selectors";

export const SettingPage = () => {
	const { user } = useSelector(selectGlobalSlice);
	return user?.category_code == "fulfillment" ? (
		<Routes>
			<Route index element={<Navigate to="user" replace />} />
			<Route
				path={"user"}
				element={
					<LayoutSetting>
						<AuthorizeRoute>
							<UserSetting />
						</AuthorizeRoute>
					</LayoutSetting>
				}
			/>
			<Route
				path={"smes"}
				element={
					<LayoutSetting>
						<ManageSMEs />
					</LayoutSetting>
				}
			/>
			<Route
				path={"connect-ups"}
				element={
					<LayoutSetting>
						<UpSConnect />
					</LayoutSetting>
				}
			/>
			<Route
				path={"smes/contract-management/:contractId/cms"}
				element={
					<LayoutSetting>
						<CommissionConfig />
					</LayoutSetting>
				}
			/>
			<Route
				path={"smes/contract-management/:contractId/cms-create"}
				element={
					<LayoutSetting>
						<CommissionCreate />
					</LayoutSetting>
				}
			/>
			<Route
				path={"user/change-password"}
				element={
					<LayoutSetting>
						<AuthorizeRoute>
							<UserChangePassword />
						</AuthorizeRoute>
					</LayoutSetting>
				}
			/>
			<Route
				path={"user/update"}
				element={
					<LayoutSetting>
						<AuthorizeRoute>
							<UserUpdate />
						</AuthorizeRoute>
					</LayoutSetting>
				}
			/>
			<Route
				path={"sub-user"}
				element={
					<LayoutSetting>
						<AuthorizeRoute>
							<SubUserList />
						</AuthorizeRoute>
					</LayoutSetting>
				}
			/>
			<Route
				path={"sub-user/create"}
				element={
					<LayoutSetting>
						<AuthorizeRoute>
							<SubUserCreate />
						</AuthorizeRoute>
					</LayoutSetting>
				}
			/>

			<Route
				path={"sub-user/change-password/:id"}
				element={
					<LayoutSetting>
						<AuthorizeRoute>
							<SubUserChangePassword />
						</AuthorizeRoute>
					</LayoutSetting>
				}
			/>

			<Route
				path={"sub-user/change-info/:id"}
				element={
					<LayoutSetting>
						<AuthorizeRoute>
							<SubUserUpdateInfo />
						</AuthorizeRoute>
					</LayoutSetting>
				}
			/>
			<Route
				path={"smes/contract-management/:id"}
				element={
					<LayoutSetting>
						{/* <AuthorizeRoute> */}
						<ContractManagement />
						{/* </AuthorizeRoute> */}
					</LayoutSetting>
				}
			/>
			<Route
				path={"smes/contract-management/history-contract/:contractId"}
				element={
					<LayoutSetting>
						<ContractHistories />
					</LayoutSetting>
				}
			/>
		</Routes>
	) : (
		<Routes>
			<Route index element={<Navigate to="user" replace />} />
			<Route
				path={"user"}
				element={
					<LayoutSetting>
						<AuthorizeRoute>
							<UserSetting />
						</AuthorizeRoute>
					</LayoutSetting>
				}
			/>
			<Route
				path={"smes"}
				element={
					<LayoutSetting>
						<ManageSMEs />
					</LayoutSetting>
				}
			/>
			<Route
				path={"connect-ups"}
				element={
					<LayoutSetting>
						<UpSConnect />
					</LayoutSetting>
				}
			/>
			<Route
				path={"smes/contract-management/:contractId/cms"}
				element={
					<LayoutSetting>
						<CommissionConfig />
					</LayoutSetting>
				}
			/>
			<Route
				path={"smes/contract-management/:contractId/cms-create"}
				element={
					<LayoutSetting>
						<CommissionCreate />
					</LayoutSetting>
				}
			/>
			<Route
				path={"user/change-password"}
				element={
					<LayoutSetting>
						<AuthorizeRoute>
							<UserChangePassword />
						</AuthorizeRoute>
					</LayoutSetting>
				}
			/>
			<Route
				path={"user/update"}
				element={
					<LayoutSetting>
						<AuthorizeRoute>
							<UserUpdate />
						</AuthorizeRoute>
					</LayoutSetting>
				}
			/>
			<Route
				path={"sub-user"}
				element={
					<LayoutSetting>
						<AuthorizeRoute>
							<SubUserList />
						</AuthorizeRoute>
					</LayoutSetting>
				}
			/>
			<Route
				path={"sub-user/create"}
				element={
					<LayoutSetting>
						<AuthorizeRoute>
							<SubUserCreate />
						</AuthorizeRoute>
					</LayoutSetting>
				}
			/>

			<Route
				path={"sub-user/change-password/:id"}
				element={
					<LayoutSetting>
						<AuthorizeRoute>
							<SubUserChangePassword />
						</AuthorizeRoute>
					</LayoutSetting>
				}
			/>

			<Route
				path={"sub-user/change-info/:id"}
				element={
					<LayoutSetting>
						<AuthorizeRoute>
							<SubUserUpdateInfo />
						</AuthorizeRoute>
					</LayoutSetting>
				}
			/>
			<Route
				path={"smes/contract-management/:id"}
				element={
					<LayoutSetting>
						{/* <AuthorizeRoute> */}
						<ContractManagement />
						{/* </AuthorizeRoute> */}
					</LayoutSetting>
				}
			/>
			<Route
				path={"smes/contract-management/history-contract/:contractId"}
				element={
					<LayoutSetting>
						<ContractHistories />
					</LayoutSetting>
				}
			/>
			<Route
				path={"partner-connect"}
				element={
					<LayoutSetting>
						<AuthorizeRoute>
							<PartnerConnect />
						</AuthorizeRoute>
					</LayoutSetting>
				}
			/>
			<Route
				path={"partner-connect/:channel"}
				element={
					<LayoutSetting>
						<AuthorizeRoute>
							<PartnerConnect />
						</AuthorizeRoute>
					</LayoutSetting>
				}
			/>
		</Routes>
	);
};
