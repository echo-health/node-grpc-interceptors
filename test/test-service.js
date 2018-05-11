const grpc = require('grpc');
const interceptors = require('../index');
const proto = require('./proto');

function Greet(call, callback) {
    return callback(null, { message: `Hello ${call.request.message}` });
}

function Wave(call, callback) {
    return callback(null, { message: 'Wave' });
}

function WaveAgain(call, callback) {
    return callback(null, { message: 'Wave' });
}

module.exports = port => {
    const server = interceptors.serverProxy(new grpc.Server());
    server.addService(proto.Test.Messenger.service, { Greet, Wave, WaveAgain });
    server.bind(`localhost:${port}`, grpc.ServerCredentials.createInsecure());
    const client = interceptors.clientProxy(new proto.Test.Messenger(`localhost:${port}`, grpc.credentials.createInsecure()));
    return { server, client };
};
