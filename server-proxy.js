const utils = require('./utils');
const grpc = require('grpc');
const compose = require('koa-compose');

const interceptors = [];

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
                newImplementation[name] = async (call, callback) => {
                    const ctx = {
                        call,
                        service: lookup(name),
                    };
                    const newCallback = callback => {
                        return (...args) => {
                            ctx.status = {
                                code: grpc.status.OK,
                            };
                            const err = args[0];
                            if (err) {
                                ctx.status = err;
                            }
                            callback(...args);
                        };
                    };
                    
                    compose(interceptors)(ctx);
                    await fn(call, newCallback(callback));
                };
            }
            return target.addService(service, newImplementation);
        };
    },
};

module.exports = (server) => {
    server.use = fn => {
        interceptors.push(fn);
    };
    return new Proxy(server, handler);
};
