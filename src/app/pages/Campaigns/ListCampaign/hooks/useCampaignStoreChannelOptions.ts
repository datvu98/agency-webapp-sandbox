import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import query_smeStore from 'graphql/queries/query_smeStore';
import query_scListConnectorStoreAgency from 'graphql/queries/query_scListConnectorStoreAgency';

export default function useCampaignStoreChannelOptions() {
  const { data: dataStores, loading: loadingStores } = useQuery(query_smeStore, {
    fetchPolicy: 'cache-and-network',
  });

  const { data: dataScListConnectorStoreAgency } = useQuery(query_scListConnectorStoreAgency, {
    variables: { status: [0, 1] },
    fetchPolicy: 'cache-and-network',
  });

  const optionsChannel = useMemo(() => {
    // Hiện tại chỉ dùng cho TikTok
    const channels = dataStores?.op_connector_channels || [];
    const tiktokChannels = channels.filter((channel: any) => channel?.code == 'tiktok');

    return tiktokChannels.map((channel: any) => ({
      ...channel,
      value: channel?.code,
      label: channel?.name,
    })) || [];
  }, [dataStores]);

  const optionsStore = useMemo(() => {
    if (!dataStores || !dataScListConnectorStoreAgency) return [];

    return (
      dataStores.scAgencySaleStores?.data
        ?.filter((store: any) =>
          dataScListConnectorStoreAgency.scListConnectorStoreAgency
            ?.map((item: any) => item?.store_id)
            .includes(store?.id)
        )
        // Chỉ lấy các gian hàng thuộc sàn TikTok
        ?.filter((store: any) => store?.connector_channel_code == 'tiktok')
        ?.map((store: any) => {
          const channel = dataStores.op_connector_channels?.find((cn: any) => cn?.code == store?.connector_channel_code);

          return {
            ...store,
            channel,
            value: store?.id,
            label: store?.name,
            logo: channel?.logo_asset_url,
          };
        }) || []
    );
  }, [dataStores, dataScListConnectorStoreAgency]);

  return {
    dataStores,
    optionsChannel,
    optionsStore,
    loadingStores,
  };
}

