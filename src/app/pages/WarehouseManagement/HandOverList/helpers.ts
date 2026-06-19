import client from "apollo";
import _ from "lodash";
import query_handoverListListWithPagination from "graphql/queries/query_handoverListListWithPagination";
import query_warehouseBillListWithPagination from "graphql/queries/query_warehouseBillListWithPagination";

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

export const queryHandoverListByIds = async (ids) => {
	if (!ids) return null;

	const { data } = await client.query({
		query: query_handoverListListWithPagination,
		variables: {
			where: {
				id: {
					_in: ids,
				},
			},
		},
		fetchPolicy: "network-only",
	});

	return data?.handoverListListWithPagination?.data || null;
};

export const buildBatches = (bills: any[]): any[][] =>
    _.chain(bills ?? []).groupBy('shippingCarrier').flatMap(g => _.chunk(g, 50)).value();

type BatchResult = {
    totalItems: number;
    successCount: number;
    failedItems: { warehouseBillId: number; code: string; error: string }[];
    createdHandoverLists: any[];
};

export const aggregate = (results: BatchResult[]): BatchResult =>
    (results ?? []).reduce(
        (acc, r) => ({
            totalItems: acc?.totalItems + (r?.totalItems ?? 0),
            successCount: acc?.successCount + (r?.successCount ?? 0),
            failedItems: [...(acc?.failedItems ?? []), ...(r?.failedItems ?? [])],
            createdHandoverLists: [...(acc?.createdHandoverLists ?? []), ...(r?.createdHandoverLists ?? [])],
        }),
        { totalItems: 0, successCount: 0, failedItems: [], createdHandoverLists: [] }
    );
