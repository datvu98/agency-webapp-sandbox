import client from "apollo";
import query_storageEquipmentList from "graphql/queries/query_storageEquipmentList";
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

export const queryStorageEquipmentbyIds = async (ids: number[]) => {
  if (!ids?.length) return [];
  let variables = {
    searchs: [],
    searchFields: [],
    warehouseId: null,
    containerType_in: [],
    deviceType_in: [],
    isActive: null,
    ids: ids
  }
  const {data} = await client.query({
    query: query_storageEquipmentList,
    variables: variables,
    fetchPolicy: 'network-only',
  });
  return data?.storageEquipmentList?.data || [];
};
