const path = require('path');
const protobufjs = require('protobufjs');
const grpc = require('grpc');

const proto = protobufjs.loadSync(
    path.resolve(__dirname, 'message.proto'),
    new protobufjs.Root({ keepCase: true })
);

const root = grpc.loadObject(proto);

module.exports = root;
