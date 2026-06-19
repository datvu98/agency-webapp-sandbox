import client from "apollo";
import query_processingListGetById from "graphql/queries/query_processingListGetById";
import query_sme_catalog_product_variant from "graphql/queries/query_sme_catalog_product_variant";
import query_storageEquipmentList from "graphql/queries/query_storageEquipmentList";
import query_warehouseBillListWithPagination from "graphql/queries/query_warehouseBillListWithPagination";
import query_workSessionItemWithPagination from "graphql/queries/query_workSessionItemWithPagination";

export const queryProcessingListById = async (id) => {
	if (!id) return null;

	const { data } = await client.query({
		query: query_processingListGetById,
		variables: {
			id: id,
		},
		fetchPolicy: "network-only",
	});

	return data?.processingListGetById?.data || null;
};

export const queryStorageEquipmentById = async (id) => {
	if (!id) return null;

	const { data } = await client.query({
		query: query_storageEquipmentList,
		variables: {
			ids: [id],
		},
		fetchPolicy: "network-only",
	});

	return data?.storageEquipmentList?.data?.[0] || null;
};

export const queryWarehouseBillByIds = async (ids) => {
	if (!ids) return null;

	const { data } = await client.query({
		query: query_warehouseBillListWithPagination,
		variables: {
			where: {
				id: {
					_in: ids,
				},
			},
		},
		fetchPolicy: "network-only",
	});

	return data?.warehouseBillListWithPagination?.data || null;
};

export const querySmeVariantByIds = async (ids) => {
	if (!ids?.length) return [];

	const { data } = await client.query({
		query: query_sme_catalog_product_variant,
		variables: {
			where: {
				id: {
					_in: ids,
				},
			},
		},
		fetchPolicy: "network-only",
	});

	return data?.sme_catalog_product_variant || [];
};

export const queryWorkSessionItemByText = async (text, workSessionId, type) => {
	if (!text?.length || !workSessionId) return null;

	const { data } = await client.query({
		query: query_workSessionItemWithPagination,
		variables: {
			limit: 1,
			offset: 0,
			where: {
				workSessionId: {
					_eq: Number(workSessionId),
				},
				status: {
					_in: type == 'SIO' ? ["NEW"] : ['NEW', 'DOING'],
				},
				_or: type == 'SIO' ? [
					{
						variant: {
							sku: {
								_eq: text,
							},
						},
					},
					{
						variant: {
							gtin: {
								_eq: text,
							},
						},
					},
					{
						warehouseBill: {
							orderCode: {
								_eq: text,
							},
						},
					},
					{
						warehouseBill: {
							code: {
								_eq: text,
							},
						},
					},
					{
						warehouseBill: {
							systemPackageNumber: {
								_eq: text,
							}
						}
					}
				] : [
					{
						variant: {
							sku: {
								_eq: text,
							},
						},
					},
					{
						variant: {
							gtin: {
								_eq: text,
							},
						},
					}],
			},
		},
		fetchPolicy: "network-only",
	});
	console.log(data)
	return data?.workSessionItemWithPagination?.data?.[0] || null;
};
