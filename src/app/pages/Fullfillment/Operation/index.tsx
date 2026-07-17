import React, { useLayoutEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Card, Flex, Tabs } from "antd";
import queryString from "querystring";
import { useLazyQuery, useQuery } from "@apollo/client";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { usePostHog } from '@posthog/react';

import { useLayoutContext } from "app/contexts/LayoutContext";
import { useFullfillmentContext } from "app/contexts/FullfillmentContext";

import query_scGetOperationFulfillmentTracking from "graphql/queries/query_scGetOperationFulfillmentTracking";
import query_scGetOperationFulfillmentSummarySLA from "graphql/queries/query_scGetOperationFulfillmentSummarySLA";
import query_scGetOperationFulfillmentSummaryFastDelivery from "graphql/queries/query_scGetOperationFulfillmentSummaryFastDelivery";

import { showAlert } from "utils/helper";

import { OperationWrapper } from "../Fullfillment.style";

import FullfillmentFilter from "../components/FullfillmentFilter";
import FullfillmentOverview from "../components/FullfillmentOverview";
import FullfillmentDetailTable from "../components/FullfillmentDetailTable";
import SLAOverview from "../components/SLAOverview";
import SLATable from "../components/SLATable";
import GHNFullfillmentFilter from "../components/GHNFullfillmentFilter";
import GHNSLAOverview from "../components/GHNSLAOverview";
import GHNSLATable from "../components/GHNSLATable";
import CBHOverview from "../components/CBHOverview";
import CBHTable from "../components/CBHTable";
import query_scGetOperationFulfillmentSummaryRtsSlaTime from "graphql/queries/query_scGetOperationFulfillmentSummaryRtsSlaTime";
import { PackageScanMain } from "../components/PackageScanComponents";
import GHNSLATableByTime from "../components/GHNSLATableByTime";
import { useSelector } from "react-redux";
import { selectGlobalSlice } from "app/slice/selectors";

const ReportOverview = () => {
	const { user } = useSelector(selectGlobalSlice);
	const location =  useLocation()
	const params = queryString.parse(location.search.slice(1, 100000)) as any;
	const navigate = useNavigate();
	const posthog = usePostHog();

	const { optionsStore, loadingStores } = useFullfillmentContext();
	const connector_channel_code = useMemo(() => {
		if (params?.channel_codes) {
			return params?.channel_codes?.split(",");
		}
		return null;
	}, [params?.channel_codes]);

	const fulfillment_by = useMemo(() => {
		if (params?.services && params?.services != 3) {
			return params?.services?.split(",")?.map((item) => +item);
		}
		if (params?.services == 3) {
			return [];
		}
		const defaultService = user?.category_code == 'fulfillment' ? [4] : [2]
		return defaultService;
	}, [params?.services, user]);

	const list_source = useMemo(() => {
		if (params?.sources) {
			return params?.sources?.split(",");
		}
		return ["platform", "manual", "pos", "web", "social"];
	}, [params?.sources]);

	const list_store = useMemo(() => {
		if (params?.store_ids) {
			return params?.store_ids?.split(",")?.map((item) => +item);
		}
		if (params?.smes) {
			return optionsStore?.map((item) => item?.id);
		}
		return optionsStore?.map((item) => item?.id);
	}, [params?.store_ids, params?.smes, optionsStore]);

	const range_time = useMemo(() => {
		if (params?.from && params?.to) {
			return [Number(params?.from), Number(params?.to)];
		}
		if (params?.tab == "GHN") return [dayjs().startOf("day").unix(), dayjs().endOf("day").unix()];
		if (params?.tab == "SLA" || params?.tab == "CBH") return [dayjs(dayjs().subtract(29, "day")).startOf("day").unix(), dayjs().endOf("day").unix()];
		return [dayjs(dayjs().subtract(29, "day")).startOf("day").unix(), dayjs().endOf("day").unix()];
	}, [params?.from, params?.to, params?.tab]);

	const variables = useMemo(() => {
		return {
			filter: {
				range_time,
				list_source,
				list_store: list_store?.length ? list_store : [-1],
				fulfillment_by,
				connector_channel_code,
			},
		};
	}, [range_time, list_source, list_store, fulfillment_by, connector_channel_code]);

	const { data, loading } = useQuery(query_scGetOperationFulfillmentTracking, {
		variables,
		fetchPolicy: "no-cache",
		skip: params?.tab != "overview" && !!params?.tab,
	});

	const { data: dataSLA, loading: loadingSLA } = useQuery(query_scGetOperationFulfillmentSummarySLA, {
		variables,
		fetchPolicy: "no-cache",
		skip: params?.tab != "SLA",
	});

	const { data: dataCBH, loading: loadingCBH } = useQuery(query_scGetOperationFulfillmentSummaryRtsSlaTime, {
		variables,
		fetchPolicy: "no-cache",
		skip: params?.tab != "CBH",
	});

	const { appendBreadcrumb } = useLayoutContext();

	useLayoutEffect(() => {
		appendBreadcrumb([
			{
				title: "Xử lý xuất",
			},
			{
				title: "Tổng quan",
			},
		]);
	}, []);
	const onChange = (key: string) => {
		posthog?.capture('fulfillment_tab_changed', { tab: key });
		navigate(`${location.pathname}?${queryString.stringify({ tab: key }).replaceAll("%2C", ",")}`);
	};

	const [getDataSLAGHN, { data: dataSLAGHN, loading: loadingDataSLAGHN }] = useLazyQuery(query_scGetOperationFulfillmentSummaryFastDelivery, {
		onError: (e) => {
			console.log(e);
			showAlert.error("Có lỗi xảy ra");
		},
	});

	const onSearch = () => {
		if (!connector_channel_code?.length) {
			showAlert.error("Vui lòng chọn thông tin sàn");
			return;
		}
		getDataSLAGHN({
			variables: {
				filter: {
					...variables?.filter,
					list_source: ["platform"],
				},
			},
			fetchPolicy: "no-cache",
		});
	};

	return (
		<OperationWrapper>
			<Helmet titleTemplate={`${user?.category_code == 'fulfillment' ? "Theo dõi đơn xuất" : 'Theo dõi vận hành'} - UpS`} defaultTitle={`${user?.category_code == 'fulfillment' ? "Theo dõi đơn xuất" : 'Theo dõi vận hành'} - UpS`}>
				<meta name="description" content={`${user?.category_code == 'fulfillment' ? "Theo dõi đơn xuất" : 'Theo dõi vận hành'} - UpS`} />
			</Helmet>
			{/* <Tabs
            style={{ marginTop: 12, marginLeft: 12 }}
            onChange={onChange}
            items={TABS}
        /> */}
			<Tabs
				defaultActiveKey={params?.tab ? params?.tab : "overview"}
				style={{ marginLeft: 12 }}
				className="transparent-tabs"
				items={[
					{
						label: "Tổng quan",
						key: "overview",
					},
					{
						label: "Theo hạn SLA",
						key: "SLA",
					},
					{
						label: "Theo hạn giao hàng nhanh",
						key: "GHN",
					},
					{
						label: "Theo hạn chuẩn bị hàng",
						key: "CBH",
					},
					{
						label: "Tìm đơn hoàn",
						key: "TDH",
					},
				]}
				onChange={onChange}
			/>
			<Flex vertical gap={20}>
				{params?.tab == "GHN" && (
					<Flex
						align="center"
						className="warning__title mb-2 text-info"
						style={{
							padding: "8px",
							background: "#3699ff3b",
							borderRadius: "4px",
							marginBottom: "-12px",
						}}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="#3699ff" className="bi bi-info-circle" viewBox="0 0 16 16">
							<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
							<path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
						</svg>
						<span style={{ color: "#212121", marginLeft: 8 }}>Duy trì tỷ lệ giao hàng theo sàn: Shopee ≥ 85% | Tiktok ≥ 95%</span>
					</Flex>
				)}
				{params?.tab == "CBH" && (
					<Flex
						align="center"
						className="warning__title mb-2 text-info"
						style={{
							padding: "8px",
							background: "#3699ff3b",
							borderRadius: "4px",
							marginBottom: "-12px",
						}}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#3699ff" className="bi bi-info-circle" viewBox="0 0 16 16">
							<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
							<path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
						</svg>
						<span style={{ color: "#212121", marginLeft: 8, lineHeight: "22px" }}>
							Shopee: Đơn hàng sẽ bị tính trễ nếu bạn không Chuẩn bị hàng trước hạn này.
							<br />
							Tiktok: Đơn hàng sẽ tự động bị huỷ nếu bạn không Chuẩn bị hàng trước hạn này
						</span>
					</Flex>
				)}

				{params?.tab != "TDH" && (
					<Card className="card-filter">
						{params?.tab == "GHN" && <GHNFullfillmentFilter baseRoute={location.pathname} onSearch={onSearch} />}
						{params?.tab == "CBH" && <FullfillmentFilter baseRoute={location.pathname} previousDay={29} showHours filterStore={true} />}
						{params?.tab != "CBH" && params?.tab != "GHN" && <FullfillmentFilter baseRoute={location.pathname} previousDay={29} showHours />}
					</Card>
				)}
				{(params?.tab == "overview" || !params?.tab) && (
					<>
						<Card title="Tổng quan" loading={loading || loadingStores}>
							<FullfillmentOverview data={data?.scGetOperationFulfillmentTracking} />
						</Card>
						<Card title="Báo cáo chi tiết" loading={loading || loadingStores}>
							<FullfillmentDetailTable data={data?.scGetOperationFulfillmentTracking} range_time={range_time} list_source={list_source} fulfillment_provider_type={fulfillment_by[0]} />
						</Card>
					</>
				)}
				{params?.tab == "SLA" && (
					<>
						<Card title="Tổng quan" loading={loadingSLA}>
							<SLAOverview data={dataSLA?.scGetOperationFulfillmentSummarySLA} />
						</Card>
						<Card title="Báo cáo đơn còn hạn" loading={loadingSLA}>
							<SLATable type="in-time" variables={variables} title="N là hạn xử lý còn lại của đơn hàng" data={dataSLA?.scGetOperationFulfillmentSummarySLA} />
						</Card>
						<Card title="Báo cáo đơn hàng trễ" loading={loadingSLA}>
							<SLATable type="out-time" variables={variables} title="M là độ trễ của đơn hàng so với hạn SLA" data={dataSLA?.scGetOperationFulfillmentSummarySLA} />
						</Card>
					</>
				)}
				{params?.tab == "GHN" && (
					<>
						<Card title="Tổng quan" loading={loadingDataSLAGHN}>
							<GHNSLAOverview data={dataSLAGHN?.scGetOperationFulfillmentSummaryFastDelivery} />
						</Card>
						<Card title="Báo cáo theo khung giờ" loading={loadingDataSLAGHN}>
							<GHNSLATableByTime data={dataSLAGHN?.scGetOperationFulfillmentSummaryFastDelivery} type="in-time" variables={variables} />
						</Card>
						<Card title="Báo cáo theo gian hàng" loading={loadingDataSLAGHN}>
							<GHNSLATable type="in-time" variables={variables} title="N là ngày được chọn" data={dataSLAGHN?.scGetOperationFulfillmentSummaryFastDelivery} />
						</Card>
					</>
				)}
				{params?.tab == "CBH" && (
					<>
						<Card title="Tổng quan" loading={loadingCBH}>
							<CBHOverview data={dataCBH?.scGetOperationFulfillmentSummaryRtsSlaTime} />
						</Card>
						<Card title="Báo cáo đơn còn hạn" loading={loadingCBH}>
							<CBHTable type="in-time" variables={variables} title="N là hạn xử lý còn lại của đơn hàng" data={dataCBH?.scGetOperationFulfillmentSummaryRtsSlaTime} />
						</Card>
						<Card title="Báo cáo đơn hàng trễ" loading={loadingCBH}>
							<CBHTable type="out-time" variables={variables} title="M là độ trễ của đơn hàng so với hạn chuẩn bị hàng" data={dataCBH?.scGetOperationFulfillmentSummaryRtsSlaTime} />
						</Card>
					</>
				)}
				{params?.tab == "TDH" && (
					<PackageScanMain />
				)}
			</Flex>
		</OperationWrapper>
	);
};

const sample = {
	delivery_pending_rate: 0,
	fast_delivery_rate: 0,
	report_fast_delivery_by_store: [
		{
			fast_delivery_rate: 0,
			store_id: "427",
			store_time_slots_report: [
				{
					label: "0h-17h59 ngày N ",
					time_range_key: "shopee_morning_n",
					total_order: 2,
					total_packed: 0,
					total_shipped: 0,
					total_unprocessed: 2,
					__typename: "TimeFastDeliveryDetailStore",
				},
				{
					label: "18h-23h59 ngày N-1",
					time_range_key: "shopee_evening_prev_day",
					total_order: 0,
					total_packed: 0,
					total_shipped: 0,
					total_unprocessed: 0,
					__typename: "TimeFastDeliveryDetailStore",
				},
				{
					label: "18h-23h59 ngày N",
					time_range_key: "shopee_evening_n",
					total_order: 0,
					total_packed: 0,
					total_shipped: 0,
					total_unprocessed: 0,
					__typename: "TimeFastDeliveryDetailStore",
				},
			],
			total_fast_order: 0,
			total_order: 2,
			__typename: "ReportFastDeliveryOrderByStore",
		},
	],
	total_fast_order: 0,
	total_fast_order_pending: 2,
	total_order: 2,
	__typename: "OperationFulfillmentSummaryFastDelivery",
};
export default ReportOverview;
