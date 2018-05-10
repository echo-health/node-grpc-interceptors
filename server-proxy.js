const utils = require('./utils');
const grpc = require('grpc');

const interceptors = [];

const isNext = Symbol('isNext');

const compose = (...mw) =>
    async function(...args) {
        const nxt = args[args.length - 1][isNext] ? args.pop() : () => {};
        await mw.reduceRight((next, curr) =>
            async function() {
                next[isNext] = true;
                await curr(...args.concat(next));
            }, nxt)();
    };

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
                    
                    compose(...interceptors)(ctx);
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
