import { useQuery } from '@apollo/client';
import query_stores from 'graphql/queries/query_stores';
import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import queryString from 'querystring';
import { pickBy } from 'lodash';
import { generateTypeDate } from 'app/pages/Report/ReportHelper';
import query_smeStore from 'graphql/queries/query_smeStore';
import query_prvPublicListSmesByAgency from 'graphql/queries/query_prvPublicListSmesByAgency';
import query_agencyGetSme from 'graphql/queries/query_agencyGetSme';
import query_scListConnectorStoreAgency from 'graphql/queries/query_scListConnectorStoreAgency';
import { useLocation } from 'react-router-dom';
interface ReportProviderProps {
    children: ReactNode
}

interface ReportContextProps {
    optionsStore?: any[],
    optionsChannel?: any[],
    variablesQuery?: {
        channel_codes?: string,
        store_ids?: string,
        from?: number,
        to?: number,
        type?: string
    },
    optionSmes?: any[]
}

const ReportContext = createContext<ReportContextProps>({});

export function useReportContext() {
    return useContext(ReportContext);
};

export function ReportProvider({ children }: ReportProviderProps) {
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

    const lisConnectedStore = useMemo(() => {
        if (!dataScListConnectorStoreAgency?.scListConnectorStoreAgency) return []
        if (params?.contract_type == 3) {
            return dataScListConnectorStoreAgency?.scListConnectorStoreAgency
        } else if (params?.contract_type == 2) {
            return dataScListConnectorStoreAgency?.scListConnectorStoreAgency?.filter(st => st?.status == 0)
        } else {
            return dataScListConnectorStoreAgency?.scListConnectorStoreAgency?.filter(st => st?.status == 1)
        }
    }, [dataScListConnectorStoreAgency, params?.contract_type])
    const storeStatus = useMemo(() => {
        if (params?.contract_type == 3) {
            return null
        } else if (params?.contract_type == 2) {
            return 2
        } else {
            return 1
        }
    }, [params?.contract_type])
    const optionsStore = useMemo(() => {
        const stores = dataStores?.scAgencySaleStores?.data?.filter(store => {
            return lisConnectedStore?.map(item => item?.store_id)?.includes(store?.id)
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
    }, [dataStores, params?.smes, lisConnectedStore]);

    const stores = useMemo(() => {
        if (params?.store_ids) {
            return params?.store_ids
        }
        return optionsStore?.map(item => item?.id)?.toString()
    }, [optionsStore, params?.smes, params?.store_ids, params?.contract_type])

    const variablesQuery = useMemo(() => {
        const [from, to] = [
            Number(params?.from) || null,
            Number(params?.to) || null,
        ];

        const variables = {
            channel_codes: params?.channel_codes || null,
            store_ids: stores?.length ? stores : '-1',
            type: params?.type || 'hours',
            source: params?.sources || '',
            last_type: params?.type_filter || 'today',
            from,
            to,
            store_status: storeStatus
        }

        return pickBy(variables, value => !!value)
    }, [params, storeStatus]);

    const value = useMemo(() => {
        return {
            optionsStore, optionsChannel, variablesQuery, optionSmes
        }
    }, [optionsStore, optionsChannel, variablesQuery, optionSmes]);

    return (
        <ReportContext.Provider value={value}>
            {children}
        </ReportContext.Provider>
    )
}