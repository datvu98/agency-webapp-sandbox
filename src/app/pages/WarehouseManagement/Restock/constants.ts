import client from "apollo";
import query_storageEquipmentList from "graphql/queries/query_storageEquipmentList";

export const OPTION_STATUS: any = [
  {
    label: 'Đã lưu kho',
    value: 'restocked'
  },
  {
    label: 'Sẵn sàng lưu kho',
    value: 'restock_ready'
  },
  {
    label: 'Đang lưu kho',
    value: 'restocking'
  }
]

export const queryStorageEquipmentbyIds = async (ids: any) => {
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