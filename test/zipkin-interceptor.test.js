const interceptors = require('../index');

let server;
let client;
process.env.PORT = 55055;

beforeAll(() => {
    const testService = require('./test-service')(process.env.PORT);
    server = testService.server;
    client = testService.client;
    server.start();
});

afterAll(() => {
    server.forceShutdown();
});

test('zipkin-interceptor', done => {
    client.use(interceptors.clientZipkinInterceptor('test.service'));
    server.use(interceptors.serverZipkinInterceptor);
    client.Greet({ message: null }, (err, res) => {
        expect(err).toBeNull();
        expect(res.message).toBe('Hello ');
        done();
    });
});
