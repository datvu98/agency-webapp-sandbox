import { useQuery } from "@apollo/client";
import React, { useMemo } from "react";
import { flatten, uniqWith } from "lodash";
import { Col, Flex, Input, Modal, Row, Spin, Table, Typography } from "antd";
import query_sme_catalog_product_variant_stock from "graphql/queries/query_sme_catalog_product_variant_stock";
const { Text } = Typography;
const DetailsVariantUnit = ({ show, onHide, data }) => {
	const {
		data: dataVariant,
		loading,
		error,
		refetch,
	} = useQuery(query_sme_catalog_product_variant_stock, {
		variables: {
			where: {
				sme_catalog_product: {
					id: {
						_eq: data?.product_id,
					},
				},
				product_status_id: {
					_is_null: true,
				},
			},
		},
		fetchPolicy: "cache-and-network",
	});

	const units = useMemo(() => {
		const listVariant = dataVariant?.sme_catalog_product_variant;
		const uniqUnit = listVariant?.map((variant) => {
			return {
				main_unit_name: !variant?.variant_unit ? variant?.unit : "",
				variant_unit: variant?.variant_unit,
				variant_id: variant?.id,
				sku: variant?.sku,
				unit: variant?.unit,
			};
		});
		return uniqUnit;
	}, [dataVariant, data]);
	console.log(units);
	const columns = [
		{
			title: "Đơn vị chuyển đổi",
			dataIndex: "unit",
			key: "unit",
			align: "center",
			width: "30%",
			render: (_item, record) => {
				return <Text>{record?.variant_unit?.name}</Text>;
			},
		},
		{
			title: "SKU",
			dataIndex: "sku",
			key: "sku",
			align: "center",
			width: "40%",
			render: (item, record) => {
				return <Text>{record?.sku}</Text>;
			},
		},
		{
			title: "Tỉ lệ chuyển đổi",
			dataIndex: "description",
			key: "description",
			align: "center",
			width: "40%",
			render: (item, record) => {
				return (
					<>
						<Text>{record?.variant_unit?.description}</Text>
					</>
				);
			},
		},
	];
	console.log(units?.find((item) => !item?.variant_unit && !!item?.unit));
	return (
		<>
			<Modal width={1000} open={show} centered onCancel={onHide} footer={null} destroyOnClose title="Đơn vị chuyển đổi">
				<Spin spinning={loading}>
					<Row align={"middle"} gutter={10} style={{ marginBottom: 10 }} justify={"space-between"}>
						<Col span={12} style={{ display: "flex", alignItems: "center" }}>
							<Text style={{ width: "100%" }}>Đơn vị tính chính:</Text>
							<Input disabled={true} value={units?.find((item) => !!item?.main_unit_name)?.main_unit_name || ""} />
						</Col>

						<Col span={10}>SKU: {units?.find((item) => !!item?.main_unit_name)?.sku || "--"}</Col>
					</Row>

					<Table bordered={true} columns={columns as any} dataSource={(units?.filter((item: any) => !item?.main_unit_name) || []) as any} scroll={{ y: 350 }} pagination={false} />
				</Spin>
			</Modal>
		</>
	);
};

export default DetailsVariantUnit;
