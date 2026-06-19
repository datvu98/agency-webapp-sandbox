import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import mutate_affUpsertCampaign from "graphql/mutations/mutate_affUpsertCampaign";
import query_affGetCampaignDetail from "graphql/queries/query_affGetCampaignDetail";
import query_scGetProductByIdsWithoutScope from "graphql/queries/query_scGetProductByIdsWithoutScope";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showAlert } from "utils/helper";

function useDetailCampaign(id?: number) {
  const navigate = useNavigate();
  const apolloClient = useApolloClient();
  const { data, loading: loadingDetailCampaign } = useQuery(
    query_affGetCampaignDetail,
    {
      skip: !id,
      variables: id
        ? {
          filter: { id },
        }
        : undefined,
    }
  );

  const dataDetailCampaign = useMemo(() => {
    return data?.affGetCampaignDetail?.data ?? null;
  }, [data]);

  // Mỗi store có smeId riêng nên phải gọi scGetProductByIdsWithoutScope theo từng store.
  const [productsByStore, setProductsByStore] = useState<any[]>([]);
  const [loadingScGetProductByIds, setLoadingScGetProductByIds] = useState(false);

  useEffect(() => {
    const stores = (dataDetailCampaign?.stores ?? []) as any[];
    const storeQueries = stores
      .map((store) => ({
        smeId: store?.smeId,
        productIds: (store?.products ?? [])
          .map((product: any) => product?.scProductId)
          .filter((scProductId: any) => scProductId != null),
      }))
      .filter((store) => store.smeId != null && store.productIds.length > 0);

    if (storeQueries.length === 0) {
      setProductsByStore([]);
      return;
    }

    let cancelled = false;
    setLoadingScGetProductByIds(true);

    Promise.all(
      storeQueries.map((store) =>
        apolloClient
          .query({
            query: query_scGetProductByIdsWithoutScope,
            variables: { product_ids: store.productIds, sme_id: store.smeId },
            fetchPolicy: "network-only",
          })
          .then((response) => ({
            smeId: store.smeId,
            products: response?.data?.scGetProductByIdsWithoutScope ?? [],
          }))
      )
    )
      .then((results) => {
        if (!cancelled) setProductsByStore(results);
      })
      .finally(() => {
        if (!cancelled) setLoadingScGetProductByIds(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dataDetailCampaign, apolloClient]);

  const dataScGetProductByIds = useMemo(() => {
    return productsByStore;
  }, [productsByStore]);

  const [updateCampaign, { loading: loadingUpdateCampaign }] = useMutation(mutate_affUpsertCampaign, {
    awaitRefetchQueries: true,
    refetchQueries: ['affGetCampaignDetail'],
    onCompleted: (data) => {
      if (data?.affUpsertCampaign?.success) {
        showAlert.success(data?.affUpsertCampaign?.message || 'Cập nhật chiến dịch thành công');
        navigate('/campaign-manage/list-campaign');
      } else {
        showAlert.error(data?.affUpsertCampaign?.message || 'Cập nhật chiến dịch thất bại');
      }
    },
  });

  return {
    dataDetailCampaign,
    loadingDetailCampaign,
    loadingUpdateCampaign,
    updateCampaign,
    dataScGetProductByIds,
    loadingScGetProductByIds,
  };
}

export { useDetailCampaign };
