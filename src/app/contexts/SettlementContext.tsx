import { useQuery } from '@apollo/client';
import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import queryString from 'querystring';
import { pickBy } from 'lodash';
import query_smeStore from 'graphql/queries/query_smeStore';
import query_agencyGetSme from 'graphql/queries/query_agencyGetSme';
import query_scListConnectorStoreAgency from 'graphql/queries/query_scListConnectorStoreAgency';
import { useLocation } from 'react-router-dom';
interface SettlementProviderProps {
    children: ReactNode
}

interface SettlementContextProps {
    optionsStore?: any[],
    optionsChannel?: any[],
    optionSmes?: any[]
}

const SettlementContext = createContext<SettlementContextProps>({});

export function useSettlementContext() {
    return useContext(SettlementContext);
};

export function SettlementProvider({ children }: SettlementProviderProps) {
    const location = useLocation();
    const params = queryString.parse(location.search.slice(1, 100000)) as any;

    const { data: dataStores } = useQuery(query_smeStore, {
        fetchPolicy: 'cache-and-network'
    });

    const { data: dataScListConnectorStoreAgency } = useQuery(query_scListConnectorStoreAgency, {
        variables: {
            status: [0, 1]
        },
        fetchPolicy: 'cache-and-network'
    })

    const { data: dataSmes } = useQuery(query_agencyGetSme, {
        fetchPolicy: 'cache-and-network'
    })
    const optionsChannel = useMemo(() => {
        return dataStores?.op_connector_channels?.map(channel => ({
            ...channel,
            value: channel?.code,
            label: channel?.name
        }))
    }, [dataStores]);

    const optionSmes = useMemo(() => {
        return dataSmes?.agencyGetSme?.map(sme => ({
            ...sme,
            value: sme?.sme_id,
            label: sme?.full_name
        }))
    }, [dataSmes]);

    const optionsStore = useMemo(() => {
        const stores = dataStores?.scAgencySaleStores?.data?.filter(store => {
            return dataScListConnectorStoreAgency?.scListConnectorStoreAgency?.map(item => item?.store_id)?.includes(store?.id)
        })?.map(store => {
            const channel = dataStores?.op_connector_channels?.find(cn => cn?.code == store?.connector_channel_code);
            return {
                ...store,
                channel,
                value: store?.id,
                label: store?.name
            }
        })
        if (params?.smes) {
            return stores?.filter(store => params?.smes?.includes(store?.sme_id))
        }
        return stores || []
    }, [dataStores, params?.smes, dataScListConnectorStoreAgency]);

    const stores = useMemo(() => {
        if (params?.store_ids) {
            return params?.store_ids
        }
        if (params?.smes) {
            return optionsStore?.map(item => item?.id)?.toString()
        }
        return null
    }, [optionsStore, params?.smes, params?.store_ids])

    const value = useMemo(() => {
        return {
            optionsStore, optionsChannel, optionSmes
        }
    }, [optionsStore, optionsChannel, optionSmes]);

    return (
        <SettlementContext.Provider value={value}>
            {children}
        </SettlementContext.Provider>
    )
}