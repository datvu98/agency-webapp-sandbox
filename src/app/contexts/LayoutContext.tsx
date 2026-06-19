import { useQuery } from '@apollo/client';
import query_conversationLabelList from 'graphql/queries/query_conversationLabelList';
import query_smeStoresWarehouse from 'graphql/queries/query_smeStoresWarehouse';
import query_stores from 'graphql/queries/query_stores';
import React, { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import queryString from 'querystring';

interface LayoutProviderProps {
    children: ReactNode
}

export interface BreadcrumbProps {
    title: string,
    pathname: string
}

interface LayoutContextProps {
    breadcrumbs?: Array<BreadcrumbProps>,
    appendBreadcrumb?: any,
    optionsStore?: any,
    loadingConversationLabel?: boolean,
    dataConversationLabel?: any,
    messageListReferance?: any,
    optionSmes?: any
}

const LayoutContext = createContext<LayoutContextProps>({});

export function useLayoutContext() {
    return useContext(LayoutContext);
};

export function LayoutProvider({ children }: LayoutProviderProps) {
    const messageListReferance = useRef<any>(null);
    const location = useLocation()
    const [breadcrumbs, setBreadcrumbs] = useState<Array<BreadcrumbProps>>([]);
    const params = queryString.parse(location.search.slice(1, location.search.length));

    const { data: dataStores } = useQuery(query_stores, {
        fetchPolicy: 'cache-and-network'
    });

    const { data: dataSmes } = useQuery(query_smeStoresWarehouse, {
        fetchPolicy: 'cache-and-network'
    })

    const { data: dataConversationLabel } = useQuery(query_conversationLabelList, {
        variables: {
            page: 1,
            pageSize: 200,
            smeId: 1
        },
        fetchPolicy: 'cache-and-network'
    })

    const optionsStore = useMemo(() => {
        const stores = dataStores?.scAgencyConversationStores?.data?.map(store => {
            const channel = dataStores?.op_connector_channels?.find(cn => cn?.code == store?.connector_channel_code);
            return {
                ...store,
                channel
            }
        })
        return stores || []
    }, [dataStores]);

    const appendBreadcrumb = useCallback(
        (item: Array<BreadcrumbProps>) => {
            setBreadcrumbs(item)
        }, []
    );
    const optionSmes = useMemo(() => {
        return dataSmes?.agencyGetSme
    }, [dataSmes])

    const value = useMemo(
        () => {
            return {
                breadcrumbs, appendBreadcrumb, optionsStore, messageListReferance, optionSmes, dataConversationLabel
            }
        }, [breadcrumbs, optionsStore, messageListReferance, optionSmes, dataConversationLabel]
    );

    return (
        <LayoutContext.Provider value={value}>
            {children}
        </LayoutContext.Provider>
    );
};