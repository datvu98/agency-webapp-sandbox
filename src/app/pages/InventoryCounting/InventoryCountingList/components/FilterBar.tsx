import { Card, Col, DatePicker, Input, Row, Select, Switch } from "antd";
import { useQuery } from "@apollo/client";
import dayjs from "dayjs";
import queryString from "querystring";
import React, { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import query_sme_warehouse_list from "graphql/queries/query_sme_warehouse_list";

interface Props {
	params: Record<string, any>;
	activeTab: string;
}

const FilterBar = ({ params, activeTab }: Props) => {
	const navigate = useNavigate();
	const location = useLocation();
    const [searchText, setSearchText] = useState(params?.q || '')

	const { data: warehouseData } = useQuery(query_sme_warehouse_list, {
		fetchPolicy: "cache-first",
	});

	const warehouseOptions = (warehouseData?.smeWarehouseByAgency?.data ?? []).map((w: any) => ({
		label: w?.name,
		value: String(w?.id),
	}));

	const pushParams = useCallback(
		(patch: Record<string, any>) => {
			const next = { ...params, page: 1, ...patch };
			Object.keys(next).forEach((k) => {
				const v = next[k];
				if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) {
					delete next[k];
				}
			});
			navigate(`${location.pathname}?${queryString.stringify(next)}`?.replaceAll("%2C", ","));
		},
		[params, navigate, location.pathname]
	);

	const fromDate = useMemo(() => {
        if(!params?.fromDate) return null
        return dayjs.unix(Number(params?.fromDate))
    }, [params?.fromDate]);

    const toDate = useMemo(() => {
        if(!params?.toDate) return null
        return dayjs.unix(Number(params?.toDate))
    }, [params?.toDate]);

	const warehouseValue = params?.warehouseId ? params.warehouseId : null;

	return (
		<Card>
			<Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
				<Col span={12}>
					<Input.Search
						placeholder="Tìm mã kiểm kê"
						value={searchText}
						allowClear
						onChange={(e) => {
                            console.log(e)
                            setSearchText(e.target.value)
						}}
						onSearch={(v) => pushParams({ q: v })}
					/>
				</Col>

				<Col span={12}>
					<Select allowClear placeholder="Kho" style={{ width: "100%" }} options={warehouseOptions} value={warehouseValue} onChange={(val) => pushParams({ warehouseId: val })} />
				</Col>
			</Row>
			<Row gutter={[12, 12]}>
				<Col span={12}>
					<DatePicker.RangePicker
						value={[fromDate, toDate]}
						style={{ width: "100%" }}
						format="DD/MM/YYYY"
						onChange={(_, strs) => {
                            console.log(strs)
                            pushParams({ 
                                fromDate: dayjs(strs?.[0], 'DD/MM/YYYY').startOf("day").unix(), 
                                toDate: dayjs(strs?.[1], 'DD/MM/YYYY').endOf("day").unix() 
                            })
                        }}
					/>
				</Col>

				{activeTab === "completed" && (
					<Col span={12} style={{ display: "flex", alignItems: "center", gap: 8 }}>
						<span>Phát sinh chênh lệch</span>
						<Switch checked={params?.hasDiff === "true"} onChange={(checked) => pushParams({ hasDiff: checked ? "true" : undefined })} />
					</Col>
				)}
			</Row>
		</Card>
	);
};

export default FilterBar;
