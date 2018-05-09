const grpc = require('grpc');
const interceptors = require('../index');
const proto = require('./proto');

function Greet(call, callback) {
    callStack.push('greet');
    return callback(null, { message: `Hello ${call.request.message}` });
}

function Wave(call, callback) {
    callStack.push('wave');
    return callback(null, { message: 'Wave' });
}

let callStack = [];

function one(call, next) {
    callStack.push('one');
    next();
}

function two(call, next) {
    callStack.push('two');
    next();
}

function three(call, next) {
    callStack.push('three');
    next();
}

describe('server-proxy', () => {

    describe('without interceptors', () => {

        let server;
        let client;

        beforeAll(() => {
            server = interceptors.serverProxy(new grpc.Server());
            server.addService(proto.Test.Messenger.service, { Greet, Wave });
            server.bind('localhost:55051', grpc.ServerCredentials.createInsecure());
            server.start();
            client = new proto.Test.Messenger('localhost:55051', grpc.credentials.createInsecure());
        });

        afterAll(() => {
            server.forceShutdown();
        });

        test('should execute the server function', done => {
            callStack = [];
            client.Greet({ message: 'test' }, (err, res) => {
                expect(err).toBeNull();
                expect(res.message).toBe('Hello test');
                expect(callStack).toHaveLength(1);
                expect(callStack[0]).toBe('greet');
                done();
            });
        });

    });

    describe('with interceptors', () => {

        let server;
        let client;

        beforeAll(() => {
            server = interceptors.serverProxy(new grpc.Server());
            server.addService(proto.Test.Messenger.service, { Greet, Wave });
            server.bind('localhost:55052', grpc.ServerCredentials.createInsecure());
            server.use(one);
            server.use(two);
            server.use(three);
            server.start();
            client = new proto.Test.Messenger('localhost:55052', grpc.credentials.createInsecure());
        });

        afterAll(() => {
            server.forceShutdown();
        });

        test('should execute interceptors in order', done => {
            callStack = [];
            client.Greet({ message: 'test' }, (err, res) => {
                expect(err).toBeNull();
                expect(res.message).toBe('Hello test');
                expect(callStack).toHaveLength(4);
                expect(callStack[0]).toBe('one');
                expect(callStack[1]).toBe('two');
                expect(callStack[2]).toBe('three');
                expect(callStack[3]).toBe('greet');
                client.Wave({ message: 'test' }, (err, res) => {
                    expect(err).toBeNull();
                    expect(res.message).toBe('Wave');
                    expect(callStack).toHaveLength(8);
                    expect(callStack[4]).toBe('one');
                    expect(callStack[5]).toBe('two');
                    expect(callStack[6]).toBe('three');
                    expect(callStack[7]).toBe('wave');
                    done();
                });
            });
        });

    });

});
