import React, { memo, useCallback, useMemo } from "react";
import { Table, message, Spin, Col, Row } from "antd";
import { useMutation, useQuery } from "@apollo/client";
import EditableVertical from "./EditableVertical"; // phiên bản mới dùng AntD Popover
import { toAbsoluteUrl } from "utils/helper";
import query_sizeConversionList from "graphql/queries/query_sizeConversionList";
import mutate_sizeConversionUpsert from "graphql/mutations/mutate_sizeConversionUpsert";

const SizeManagementTable = memo(({ warehouseId }: any) => {
	const { data, loading, refetch } = useQuery(query_sizeConversionList, {
		variables: { warehouseId },
		fetchPolicy: "cache-and-network",
	});

	const [sizeConversionUpsert, { loading: loadingUpdate }] = useMutation(mutate_sizeConversionUpsert, {
		awaitRefetchQueries: true,
		refetchQueries: ["sizeConvertionList"],
	});

	const handleUpdate = useCallback(
		async (ratio, code, callback) => {
			try {
				const { data: dataUpdate } = await sizeConversionUpsert({
					variables: {
						upsert: {
							code,
							radio: +ratio,
							warehouseId,
						},
					},
				});

				if (dataUpdate?.sizeConversionUpsert?.success) {
					message.success("Cập nhật tỷ lệ chuyển đổi thành công");
					refetch();
					callback?.();
				} else {
					message.error("Cập nhật tỷ lệ chuyển đổi thất bại");
				}
			} catch (err) {
				message.error("Có lỗi xảy ra khi cập nhật");
			}
		},
		[warehouseId, refetch, sizeConversionUpsert]
	);

	const dataTable = useMemo(() => {
		const sizeList = ["XS", "S", "M", "L", "XL", "XXL"];
		return sizeList.map((size) => {
			const currentSize = data?.sizeConversionList?.data?.find((item) => item?.code === size);
			return {
				key: size,
				name: size,
				ratio: currentSize?.radio,
			};
		});
	}, [data]);

	const columns = [
		{
			title: "Danh mục kích cỡ",
			dataIndex: "name",
			key: "name",
			align: "left",
			width: 160,
		},
		{
			title: "Bội số so với kích cỡ nhỏ nhất",
			key: "ratio",
			align: "left",
			width: 160,
			render: (_, record) =>
				record.name === "XS" ? <span>1 XS</span> : <EditableVertical id={record.name} text={record.ratio} onConfirm={(value, callback) => handleUpdate(value?.ratio, record.name, callback)} />,
		},
	];

	return (
		<div style={{ borderRadius: 6, minHeight: 220, marginTop: 20 }}>
			<Spin spinning={loading || loadingUpdate}>
				<Row>
					<Col span={12}>
						<Table
							columns={columns as any}
							dataSource={dataTable}
							pagination={false}
							locale={{
								emptyText: (
									<div
										style={{
											display: "flex",
											flexDirection: "column",
											alignItems: "center",
											justifyContent: "center",
											padding: "40px 0",
										}}
									>
										<img src={toAbsoluteUrl("/media/empty.png")} alt="empty" width={80} style={{ opacity: 0.7 }} />
										<span style={{ marginTop: 16 }}>Chưa có dữ liệu</span>
									</div>
								),
							}}
							style={{ margin: "0 16px 16px" }}
						/>
					</Col>
				</Row>
			</Spin>
		</div>
	);
});

export default SizeManagementTable;
