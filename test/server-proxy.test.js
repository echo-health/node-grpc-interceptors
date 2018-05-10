let callStack = [];

async function one(ctx, next) {
    callStack.push('one');
    await next();
    callStack.push('one');
}

async function two(ctx, next) {
    callStack.push('two');
    await next();
}

async function three(ctx, next) {
    callStack.push('three');
    await next();
}

describe('server-proxy', () => {

    describe('without interceptors', () => {

        const { server, client } = require('./test-service')(55051);

        beforeAll(() => {
            server.start();
        });

        afterAll(() => {
            server.forceShutdown();
        });

        test('should execute the server function', done => {
            callStack = [];
            client.Greet({ message: 'test' }, (err, res) => {
                expect(err).toBeNull();
                expect(res.message).toBe('Hello test');
                expect(callStack).toHaveLength(0);
                done();
            });
        });

    });

    describe('with interceptors', () => {

        const { server, client } = require('./test-service')(55052);

        beforeAll(() => {
            server.use(one);
            server.use(two);
            server.use(three);
            server.start();
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
                expect(callStack[3]).toBe('one');
                client.Wave({ message: 'test' }, (err, res) => {
                    expect(err).toBeNull();
                    expect(res.message).toBe('Wave');
                    expect(callStack).toHaveLength(8);
                    expect(callStack[4]).toBe('one');
                    expect(callStack[5]).toBe('two');
                    expect(callStack[6]).toBe('three');
                    expect(callStack[7]).toBe('one');
                    done();
                });
            });
        });

    });

});
