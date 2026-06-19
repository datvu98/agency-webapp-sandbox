import client from "apollo";
import query_processingListItemListWithPagination from "graphql/queries/query_processingListItemListWithPagination";
import query_warehouseBillListWithPagination from "graphql/queries/query_warehouseBillListWithPagination";
import query_workSessionDeviceRuntimeWithPagination from "graphql/queries/query_workSessionDeviceRuntimeWithPagination";

export const queryWarehouseBillList = async (ids) => {
  if (ids?.length == 0) return [];

  const { data } = await client.query({
    query: query_warehouseBillListWithPagination,
    variables: {
      where: {
        id: { _in: ids },
      },
    },
    fetchPolicy: "network-only",
  });

  return data?.warehouseBillListWithPagination?.data || [];
};

export const queryProcessingListItemByWhBill = async (warehouseBillId) => {
  if (!warehouseBillId) return null;

  const { data } = await client.query({
    query: query_processingListItemListWithPagination,
    variables: {
      where: {
        warehouseBill: { 
          id: {
            _eq: Number(warehouseBillId)
          },
          tempLabelUrl: {_is_null: false}
        },
        status: {
					_eq: 'PACKED'
				}
      },
    },
    fetchPolicy: "network-only",
  });

  return data?.processingListItemListWithPagination?.data?.[0] || null;
};

export const queryWorkSessionDeviceRuntime = async (code) => {
  if (code?.length == 0) return null;

  const { data } = await client.query({
    query: query_workSessionDeviceRuntimeWithPagination,
    variables: {
      where: {
        storageEquipment: {
          code: {
            _eq: code
          }
        }, 
      },
    },
    fetchPolicy: "network-only",
  });

  return data?.workSessionDeviceRuntimeWithPagination?.data?.[0] || null;
};
