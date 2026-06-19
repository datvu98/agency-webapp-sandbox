import {
    ApolloClient,
    HttpLink,
    from,
    split,
    InMemoryCache,
    fromPromise,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { RetryLink } from "@apollo/client/link/retry";
import { WebSocketLink } from "@apollo/client/link/ws";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { asyncAuthLink, accountHeaders } from "./AccountsLink";
import { onError } from "@apollo/client/link/error";
import ws from "ws";
import mutate_agencyRefreshToken from "graphql/mutations/mutate_agencyRefreshToken";


const { REACT_APP_GRAPHQL_ENDPOINT , REACT_APP_GRAPHQL_WS_ENDPOINT} = process.env || {}

const retryLink = new RetryLink();

const httpLink = new HttpLink({
    uri: REACT_APP_GRAPHQL_ENDPOINT,
    credentials: "same-origin",
});

const subscriptionClient = new SubscriptionClient(
    REACT_APP_GRAPHQL_WS_ENDPOINT,
    {
        reconnect: true,
        lazy: true,
        connectionParams: accountHeaders,
    }, ws,
);

const wsLink = new WebSocketLink(subscriptionClient);

const link = from([
    asyncAuthLink,
    retryLink,
    split(
        ({ query }) => {
            const definition = getMainDefinition(query);
            return (
                definition.kind === "OperationDefinition" &&
                definition.operation === "subscription"
            );
        },
        wsLink,
        httpLink,
    ),
]);

const link_ssr = from([
    retryLink,
    split(
        ({ query }) => {
            const definition = getMainDefinition(query);
            return (
                definition.kind === "OperationDefinition" &&
                definition.operation === "subscription"
            );
        },
        wsLink,
        httpLink,
    ),
]);

const cache = new InMemoryCache({
    typePolicies: {
        // address: { keyFields: ['id'] },
        // users: { keyFields: ['id'] },
    },
});

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    console.log('graphQLErrors, networkError',graphQLErrors, networkError)
    if (graphQLErrors) {
        for (let err of graphQLErrors) {
            console.log(
                `[GraphQL error]: Message: ${err.message}`,
                err
            );
            if (err.message == 'Authentication hook unauthorized this request') {            
                // window.location.replace(`${process.env.REACT_APP_SME_ENDPOINT}/auth/login?source=chat`);
                return fromPromise(
                    new Promise(async (resolve) => {
                        let cout = 0;
                        let _interval = setInterval(async () => {
                            const refreshToken = localStorage.getItem('refresh_token');

                            if (!!refreshToken) {
                                window.localStorage.removeItem('accessToken');
                                clearInterval(_interval);

                                try {
                                    const { data } = await client.mutate({
                                        mutation: mutate_agencyRefreshToken,
                                        variables: {
                                            token: refreshToken
                                        }
                                    });

                                    if (!!data?.agencyRefreshToken?.success) {
                                        localStorage.setItem('refresh_token', data?.agencyRefreshToken?.refreshToken);
                                        resolve(data?.agencyRefreshToken?.accessToken)
                                    } else {
                                        resolve(null)
                                    }
                                } catch (error) {
                                    resolve(null)
                                }
                            }

                            cout++;
                            if (cout >= 5) {
                                clearInterval(_interval)
                                resolve(null)
                            }
                        }, 1000);

                    })
                        .then(token => {
                            if (!!token) {
                                localStorage.setItem('accessToken', token)
                                return token
                            }
                            window.localStorage.removeItem('accessToken')
                            window.location.replace('/login');
                            return null;
                        })
                        .catch(e => {
                            window.location.replace('/login');
                            window.localStorage.removeItem('accessToken')
                            return null
                        })
                )
                    .filter(value => {
                        console.log('value', value)
                        return !!value
                    })
                    .flatMap(() => {
                        console.log('forward')
                        // retry the request, returning the new observable
                        return forward(operation);
                    })
            }
        };
    }
});


const client = new ApolloClient({
    link: errorLink.concat(link),
    cache,
    defaultOptions: { mutate: { errorPolicy: "all" } },
    // name: "device",
    // version: "1.0.0",
    // connectToDevTools: false,
});


// client.onClearStore(async () => {
//     console.log("onClearStore");
//     await persistor.purge();
// });

export function createApolloClientSSR() {
    return new ApolloClient({
        link: errorLink.concat(link),
        cache,
    });
}

export default client;
