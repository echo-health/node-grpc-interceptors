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
    server.forceShutdown();
    nock.restore();
});

test('zipkin-interceptor', done => {

    expect.assertions(25);

    const tests = [
        {
            serviceName: 'test.messenger.server', // Server POST
            annotations: [{ value: 'sr' }, { value: 'ss' }],
        },
        {
            serviceName: 'test.messenger.client', // Client POST
            annotations: [{ value: 'cs' }, { value: 'cr' }],
        },
    ];

    // Use nock to set the expected POST requests to zipkin
    for (const t of tests.reverse()) {
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
                expect(body.annotations[0].value).toBe(t.annotations[0].value);
                expect(body.annotations[0].endpoint.serviceName).toBe(t.serviceName);
                expect(body.annotations[1].value).toBe(t.annotations[1].value);
                expect(body.annotations[1].endpoint.serviceName).toBe(t.serviceName);
            });

    }

    // instrument the client & server with the zipkin interceptor
    client.use(interceptors.clientZipkinInterceptor('Test.Messenger.Client'));
    server.use(interceptors.serverZipkinInterceptor('Test.Messenger.Server'));

    // make the gRPC call from client to server
    client.Greet({ message: null }, err => {

        expect(err).toBeNull();

        // wait for nock requests to complete before calling done()
        const timer = setInterval(() => {
            if (nock.isDone()) {
                clearInterval(timer);
                done();
            }
        }, 500);

    });

    // results are asserted in the nock reply() callbacks at the top of this test

});
