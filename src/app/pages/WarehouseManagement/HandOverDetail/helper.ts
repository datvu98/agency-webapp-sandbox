import client from "apollo";
import query_warehouseBillListWithPagination from "graphql/queries/query_warehouseBillListWithPagination";

export const queryDetailWarehouseBillsByIds = async (ids: number[]) => {
  if (!ids?.length) return [];
  const {data} = await client.query({
    query: query_warehouseBillListWithPagination,
    variables: {
      where: {
       id: {
        _in: ids
       }
      },
    },
    fetchPolicy: 'network-only',
  });
  return data?.warehouseBillListWithPagination?.data || [];
};