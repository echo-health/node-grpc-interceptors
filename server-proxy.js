const utils = require('./utils');
const grpc = require('grpc');

const _interceptors = [];

function* intercept() {
    let i = 0;
    while (i < _interceptors.length) {
        yield _interceptors[i];
        i++;
    }
}

const wrapCallback = (ctx, callback) => {
    return (...args) => {
        ctx.status = {
            code: grpc.status.OK,
        };
        const err = args[0];
        if (err) {
            ctx.status = {
                code: grpc.status.UNKNOWN,
                details: err,
            };
        }
        callback(...args);
    };
}

const handler = {
    get(target, propKey) {
        if (propKey !== 'addService') {
            return target[propKey];
        }
        return (service, implementation) => {
            const newImplementation = {};
            const lookup = utils.lookupServiceMetadata(service, implementation);
            for (const k in implementation) {
                const name = k;
                const fn = implementation[k];
                newImplementation[name] = (call, callback) => {
                    const ctx = {
                        call,
                        service: lookup(name),
                    };
                    const interceptors = intercept();
                    const first = interceptors.next();
                    if (!first.value) { // if we don't have any interceptors
                        return new Promise(resolve => {
                            return resolve(fn(call, wrapCallback(ctx, callback)));
                        });
                    }
                    first.value(ctx, function next() {
                        return new Promise(resolve => {
                            const i = interceptors.next();
                            if (i.done) {
                                return resolve(fn(call, wrapCallback(ctx, callback)));
                            }
                            return resolve(i.value(ctx, next));
                        });
                    });
                };
            }
            return target.addService(service, newImplementation);
        };
    },
};

module.exports = (server) => {
    server.use = fn => {
        _interceptors.push(fn);
    };
    return new Proxy(server, handler);
};
