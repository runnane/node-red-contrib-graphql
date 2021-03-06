const ws = require('ws');
const fetch = require('node-fetch');
const { WebSocketLink } = require('apollo-link-ws');
const { SubscriptionClient } = require('subscriptions-transport-ws');
const { ApolloClient } = require('apollo-client');
const { InMemoryCache } = require('apollo-cache-inmemory');
const gql = require('graphql-tag');
const { ApolloLink } = require('apollo-link');
const { HttpLink } = require('apollo-link-http');

module.exports = function (RED) {
    function GraphQLConfigNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const webSocketEnpoint = (config.endpoint || '').replace(/^http/, 'ws');

        const hasSubscriptionOperation = ({ query: { definitions } }) =>
            definitions.some(
                ({ kind, operation }) =>
                    kind === 'OperationDefinition' &&
                    operation === 'subscription'
            );
        const headers = {};
        if (config.authorizationHeader && config.authorizationToken) {
            headers[config.authorizationHeader] = config.authorizationToken;
        }

        const link = ApolloLink.split(
            hasSubscriptionOperation,
            new WebSocketLink(
                new SubscriptionClient(
                    webSocketEnpoint,
                    {
                        lazy: true,
                        reconnect: true,
                        timeout: 30000,
                        connectionParams: {
                            headers,
                        },
                    },
                    ws
                )
            ),
            new HttpLink({
                uri: config.endpoint,
                fetch,
                headers,
            })
        );
        node.client = new ApolloClient({
            connectToDevTools: false,
            ssrMode: false,
            link,
            cache: new InMemoryCache(),
            name: '@alpine-code/node-red-contrib-graphql',
            version: '1.0.0',
            queryDeduplication: false,
            defaultOptions: {
              query: {
                fetchPolicy: 'no-cache',
              }
            },
        });

        node.query = function (query, variables) {
            return node.client.query({
                query: gql`
                    ${query}
                `,
                variables,
            });
        };

        node.mutate = function (mutation, variables) {
            return node.client.mutate({
                mutation: gql`
                    ${mutation}
                `,
                variables,
            });
        };

        node.subscribe = function (subscription, variables) {
            return node.client.subscribe({
                query: gql`
                    ${subscription}
                `,
                variables,
            });
        };

        node.on('close', function (done) {
            return done();
        });
    }

    RED.nodes.registerType('graphql-config', GraphQLConfigNode);
};
