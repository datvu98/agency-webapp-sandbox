import { useQuery } from '@apollo/client';
import React, { createContext, ReactNode, useContext, useMemo, useRef, useState } from 'react';
import queryString from 'querystring';
import { pickBy } from 'lodash';
import query_smeStore from 'graphql/queries/query_smeStore';
import query_agencyGetSme from 'graphql/queries/query_agencyGetSme';
import query_scListConnectorStoreAgency from 'graphql/queries/query_scListConnectorStoreAgency';
import { useLocation } from 'react-router-dom';
interface FullfillmentProviderProps {
    children: ReactNode
}

interface FullfillmentContextProps {
    optionsStore?: any[],
    loadingStores?: boolean,
    optionsChannel?: any[],
    variablesQuery?: {
        channel_codes?: string,
        store_ids?: string,
        from?: number,
        to?: number,
        type?: string
    },
    optionSmes?: any[],
    // PackageScan states
    isLoadPackages?: boolean,
    setIsLoadPackages?: (value: boolean) => void,
    searchParams?: {
        search: string;
    },
    setSearchParams?: (value: any) => void,
    packagesSession?: any[],
    setPackagesSession?: (value: any) => void,
    inputRefOrder?: React.RefObject<any>;
}

const FullfillmentContext = createContext<FullfillmentContextProps>({});

export function useFullfillmentContext() {
    return useContext(FullfillmentContext);
};

export function FullfillmentProvider({ children }: FullfillmentProviderProps) {
    const location = useLocation();
    const params = queryString.parse(location.search.slice(1, 100000)) as any;

    // PackageScan states
    const [isLoadPackages, setIsLoadPackages] = useState(false);
    const [searchParams, setSearchParams] = useState({
        search: '',
    });
    const inputRefOrder = useRef<any>(null);
    const [packagesSession, setPackagesSession] = useState<any[]>([]);

    const { data: dataStores, loading: loadingStores } = useQuery(query_smeStore, {
        fetchPolicy: 'cache-and-network'
    });

    const { data: dataScListConnectorStoreAgency, loading: loadingDataScListConnectorStoreAgency } = useQuery(query_scListConnectorStoreAgency, {
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
                label: store?.name,
                logo: channel?.logo_asset_url
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
        return optionsStore?.map(item => item?.id)?.toString()
    }, [optionsStore, params?.smes, params?.store_ids])
    const variablesQuery = useMemo(() => {
        const [from, to] = [
            Number(params?.from) || null,
            Number(params?.to) || null,
        ];

        const variables = {
            channel_codes: params?.channel_codes || null,
            store_ids: stores,
            type: params?.type || 'hours',
            source: params?.sources || '',
            last_type: params?.type_filter || 'today',
            from,
            to,
        }

        return pickBy(variables, value => !!value)
    }, [params]);

    const value = useMemo(() => {
        return {
            optionsStore, 
            optionsChannel, 
            variablesQuery, 
            optionSmes, 
            loadingStores,
            // PackageScan states
            isLoadPackages,
            setIsLoadPackages,
            searchParams,
            setSearchParams,
            packagesSession,
            setPackagesSession,
            inputRefOrder
        }
    }, [optionsStore, loadingStores, optionsChannel, variablesQuery, optionSmes, isLoadPackages, searchParams, packagesSession]);

    return (
        <FullfillmentContext.Provider value={value}>
            {children}
        </FullfillmentContext.Provider>
    )
}