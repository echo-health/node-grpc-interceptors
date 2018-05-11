const interceptors = require('../index');
const url = require('url');
const nock = require('nock');

const zipkinHostname = 'http://localhost:9411';
const zipkinPath = '/api/v2/spans';

let server;
let client;

beforeAll(() => {

    // setup environment
    process.env.PORT = 55055;
    process.env.ZIPKIN_URL = url.resolve(zipkinHostname, zipkinPath);

    // get a client & server to use for the test
    const testService = require('./test-service')(process.env.PORT);
    server = testService.server;
    client = testService.client;
    server.start();

});

afterAll(() => {
    jest.useRealTimers();
    nock.restore();
    server.forceShutdown();
});

test('zipkin-interceptor', done => {

    // Expected POST to zipkin from server
    nock(zipkinHostname)
        .post(zipkinPath)
        .reply(202, (path, body) => {
            expect(body).toHaveLength(1);
            body = body[0];
            expect(body).toHaveProperty('traceId');
            expect(body).toHaveProperty('id');
            expect(body.id).toBe(body.traceId);
            expect(body).toHaveProperty('name');
            expect(body.name).toBe('greet');
            expect(body).toHaveProperty('annotations');
            expect(body.annotations).toHaveLength(2);
            expect(body.annotations[0].value).toBe('sr');
            expect(body.annotations[0].endpoint.serviceName).toBe('test.messenger');
            expect(body.annotations[1].value).toBe('ss');
            expect(body.annotations[1].endpoint.serviceName).toBe('test.messenger');
        });

    // Expected POST to zipkin from client
    nock(zipkinHostname)
        .post(zipkinPath)
        .reply(202, (path, body) => {
            expect(body).toHaveLength(1);
            body = body[0];
            expect(body).toHaveProperty('traceId');
            expect(body).toHaveProperty('id');
            expect(body.id).toBe(body.traceId);
            expect(body).toHaveProperty('name');
            expect(body.name).toBe('greet');
            expect(body).toHaveProperty('annotations');
            expect(body.annotations).toHaveLength(2);
            expect(body.annotations[0].value).toBe('cs');
            expect(body.annotations[0].endpoint.serviceName).toBe('test.service');
            expect(body.annotations[1].value).toBe('cr');
            expect(body.annotations[1].endpoint.serviceName).toBe('test.service');
            done();
        });

    // instrument the client & server with the zipkin interceptor
    client.use(interceptors.clientZipkinInterceptor('Test.Service'));
    server.use(interceptors.serverZipkinInterceptor);

    // use fake timers so we don't have to wait for the zipkin BatchRecorder to fire
    jest.useFakeTimers();

    // make the gRPC call from client to server
    client.Greet({ message: null }, err => {
        expect(err).toBeNull();
        // Only fire the timers AFTER the client has received the response from the server.
        // At this point we know both the client and server have finished with zipkin
        jest.runOnlyPendingTimers();
    });

    // results are asserted in the nock reply() callbacks at the top of this test

});
