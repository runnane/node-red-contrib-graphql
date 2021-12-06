const status = require('../util/nodeStatus');

module.exports = function (RED) {
    function GraphQLSubscribeNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.graphql = config.graphql;
        node.graphqlConfig = RED.nodes.getNode(node.graphql);
        if (!node.graphqlConfig) return;

        let subscription = config.template;
        let payload = {};
        try {
            status.info(node, 'subscribed');
            node.graphqlConfig.subscribe(subscription, payload).subscribe(
                (result) => {
                    status.info(node, 'subscribed');
                    return node.send([
                        {
                            payload: result.data,
                        },
                        null,
                    ]);
                },
                (err) => {
                    status.error(node, err.message);
                    return node.send([null, { payload: err }]);
                }
            );
        } catch (err) {
            node.error(err.message, {});
            status.error(node, err.message);
        }
    }

    RED.nodes.registerType('graphql-subscribe', GraphQLSubscribeNode);
};
