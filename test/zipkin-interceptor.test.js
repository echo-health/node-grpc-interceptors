const interceptors = require('../index');

let server;
let client;

beforeAll(() => {
    const testService = require('./test-service')(55055);
    server = testService.server;
    client = testService.client;
    server.start();
});

afterAll(() => {
    server.forceShutdown();
});

xtest('zipkin-interceptor', done => {
    client.use(interceptors.clientZipkinInterceptor);
    server.use(interceptors.serverZipkinInterceptor);
    client.Greet({ message: null }, (err, res) => {
        expect(err).toBeNull();
        expect(res.message).toBe('Hello ');
        done();
    });
});
