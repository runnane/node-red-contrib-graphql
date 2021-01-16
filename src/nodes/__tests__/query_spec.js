const helper = require('node-red-node-test-helper');
const query = require('../query.js');

helper.init(require.resolve('node-red'));

describe('query Node', function () {
    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function (done) {
        helper.unload();
        helper.stopServer(done);
    });

    it('should be loaded', function (done) {
        var flow = [{ id: 'n1', type: 'graphql-query', name: 'test name' }];
        helper.load(query, flow, function () {
            var n1 = helper.getNode('n1');
            n1.should.have.property('name', 'test name');
            done();
        });
    });
});
