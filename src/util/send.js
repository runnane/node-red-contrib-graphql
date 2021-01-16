const status = require('./nodeStatus');

module.exports = (node, msg, err, result) => {
    if (err) {
        node.error(err.message, msg);
        status.error(node, err.message);
        msg.payload = err;
        return node.send([null, msg]);
    }
    status.clear(node);
    msg.payload = result;
    return node.send([msg, null]);
};
