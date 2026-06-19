import { useQuery } from "@apollo/client";
import { Button, Card, Flex, Tabs } from "antd";
import { useLayoutContext } from "app/contexts/LayoutContext";
import queryString from "querystring";
import React, { useLayoutEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import query_inventoryCountingList from "graphql/queries/query_inventoryCountingList";
import FilterBar from "./components/FilterBar";
import InventoryCountingTable from "./components/InventoryCountingTable";
import CreateWorkDialog from "./dialogs/CreateWorkDialog";
import { STATUS_TABS, COUNTING_SUB_TABS, DEFAULT_LIMIT, DEFAULT_TAB, DEFAULT_SUB_TAB } from "./constants";
import { Helmet } from "react-helmet-async";
import dayjs from "dayjs";

const InventoryCountingList = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { appendBreadcrumb } = useLayoutContext();
	const params = queryString.parse(location.search.slice(1, 100000)) as any;

	const [createOpen, setCreateOpen] = useState(false);

	useLayoutEffect(() => {
		appendBreadcrumb([
			{
				title: "Kiểm kê",
				pathname: "/inventory-counting",
			},
			{ title: "Kiểm kê thường nhật" },
		]);
	}, []);

	const activeTab = (params?.tab as string) ?? DEFAULT_TAB;
	const activeSubTab = (params?.sub as string) ?? DEFAULT_SUB_TAB;

	const page = useMemo(() => {
		const p = Number(params?.page);
		return !Number.isNaN(p) ? Math.max(1, p) : 1;
	}, [params?.page]);

	const limit = useMemo(() => {
		const v = Number(params?.limit);
		return !Number.isNaN(v) ? Math.max(DEFAULT_LIMIT, v) : DEFAULT_LIMIT;
	}, [params?.limit]);

	const sessionCountFilter = useMemo(() => (activeTab === "counting" ? { sessionCount: Number(activeSubTab) } : {}), [activeTab, activeSubTab]);

	const codeFilter = useMemo(() => (params?.q ? { code: params.q as string } : {}), [params?.q]);

	const warehouseFilter = useMemo(() => (params?.warehouseId ? { warehouseId: Number(params.warehouseId) } : {}), [params?.warehouseId]);

	const dateFilter = useMemo(
		() => ({
			...(params?.fromDate ? { fromDate: dayjs.unix(Number(params?.fromDate)).toISOString() } : {}),
			...(params?.toDate ? { toDate: dayjs.unix(Number(params.toDate)).toISOString() } : {}),
		}),
		[params?.fromDate, params?.toDate]
	);

	const hasDiffFilter = useMemo(() => (activeTab === "completed" && params?.hasDiff !== undefined ? { hasDiff: params.hasDiff === "true" } : {}), [activeTab, params?.hasDiff]);

	const queryVars = useMemo(
		() => ({
			page,
			limit,
			status: activeTab,
			// ...sessionCountFilter,
			...codeFilter,
			...warehouseFilter,
			...dateFilter,
			// ...hasDiffFilter,
		}),
		[page, limit, activeTab, sessionCountFilter, codeFilter, warehouseFilter, dateFilter, hasDiffFilter]
	);

	const { data, loading, refetch } = useQuery(query_inventoryCountingList, {
		variables: {
            input: queryVars
        },
		fetchPolicy: "network-only",
	});

	const records = data?.inventoryCountingList?.data ?? [];
	const total = data?.inventoryCountingList?.total ?? 0;

	const handleTabChange = (key: string) => {
		navigate(`${location.pathname}?${queryString.stringify({ tab: key, page: 1, limit })}`);
	};

	const handleSubTabChange = (sub: string) => {
		navigate(`${location.pathname}?${queryString.stringify({ tab: activeTab, sub, page: 1, limit })}`);
	};

	return (
		<>
			<Helmet titleTemplate={"Kiểm kê thường nhật"} defaultTitle={"Kiểm kê thường nhật"}>
				<meta name="description" content={"Kiểm kê thường nhật"} />
			</Helmet>

			<FilterBar params={params} activeTab={activeTab} />

			<Card>
				<Flex justify="end" style={{ marginTop: 8, marginBottom: 8 }}>
					<Button type="primary" onClick={() => setCreateOpen(true)}>
						Tạo kiểm kê qua file
					</Button>
				</Flex>
				<Tabs activeKey={activeTab} onChange={handleTabChange} items={STATUS_TABS.map((tab) => ({ key: tab.key, label: tab.label }))} style={{ marginTop: 8 }} />

				{/* {activeTab === "counting" && (
					<Tabs activeKey={activeSubTab} onChange={handleSubTabChange} items={COUNTING_SUB_TABS.map((t) => ({ key: t.key, label: t.label }))} size="small" style={{ marginBottom: 8 }} />
				)} */}

				<InventoryCountingTable records={records} loading={loading} activeTab={activeTab} page={page} limit={limit} total={total} onRefetch={refetch} />
			</Card>
			<CreateWorkDialog open={createOpen} onClose={() => setCreateOpen(false)} onSuccess={(id: number) => navigate(`/inventory-counting/${id}`)} />
		</>
	);
};

export default InventoryCountingList;
