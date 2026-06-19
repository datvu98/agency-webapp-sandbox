import React, { useState, useEffect } from "react";
import { Select, Spin } from "antd";
import { useLazyQuery } from "@apollo/client";

const { Option } = Select;

interface InfiniteSelectProps {
	query: any; // GraphQL query document
	pageSize?: number;
	placeholder?: string;
	extraVariables?: Record<string, any>; // extra variables for query
	valueKey?: string; // key to use for Option value
	labelKey?: string; // key to use for Option label
	onChange?: (value: any) => void;
	mode?: "multiple" | "tags" | undefined;
}

const InfiniteGraphQLSelect: React.FC<InfiniteSelectProps> = ({
	query,
	pageSize = 20,
	placeholder = "Select an item",
	extraVariables = {},
	valueKey = "id",
	labelKey = "name",
	onChange,
	mode = undefined,
}) => {
	const [options, setOptions] = useState<any[]>([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [searchText, setSearchText] = useState("");

	const [loadData, { loading, data }] = useLazyQuery(query, {
		fetchPolicy: "network-only",
	});

	useEffect(() => {
		loadData({ variables: { page, pageSize, searchText, ...extraVariables } });
	}, [page, searchText, extraVariables]);

	useEffect(() => {
		if (data) {
			const items = data?.[Object.keys(data)[0]]?.items || [];
			const pagination = data?.[Object.keys(data)[0]]?.pagination;

			if (page === 1) {
				setOptions(items);
			} else {
				setOptions((prev) => [...prev, ...items]);
			}

			setHasMore(page < (pagination?.totalPage || 1));
		}
	}, [data]);

	const handleSearch = (value: string) => {
		setSearchText(value);
		setPage(1);
	};

	const handleScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
		const target = e.target as HTMLDivElement;
		if (!loading && hasMore && target.scrollTop + target.offsetHeight >= target.scrollHeight - 1) {
			setPage((prev) => prev + 1);
		}
	};

	return (
		<Select
			style={{ width: "100%" }}
			placeholder={placeholder}
			showSearch
			mode={mode}
			onSearch={handleSearch}
			filterOption={false}
			onPopupScroll={handleScroll}
			onChange={onChange}
			notFoundContent={loading ? <Spin size="small" /> : null}
		>
			{options.map((item) => (
				<Option key={item[valueKey]} value={item[valueKey]}>
					{item[labelKey]}
				</Option>
			))}
		</Select>
	);
};

export default InfiniteGraphQLSelect;
