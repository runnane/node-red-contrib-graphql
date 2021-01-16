const send = require('../util/send');
const status = require('../util/nodeStatus');

module.exports = function (RED) {
    function GraphQLQueryNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.graphql = config.graphql;
        node.graphqlConfig = RED.nodes.getNode(node.graphql);
        if (!node.graphqlConfig) return;

        node.on('input', async function (msg) {
            status.info(node, 'processing');

            let query = config.template || msg.query;
            let payload = msg.payload;

            try {
                let result = await node.graphqlConfig.query(query, payload);
                send(node, msg, null, result.data);
            } catch (err) {
                send(node, msg, err);
            }
        });
    }

    RED.nodes.registerType('graphql-query', GraphQLQueryNode);
};
