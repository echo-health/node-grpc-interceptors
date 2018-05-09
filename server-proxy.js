const utils = require('./utils');

const _interceptors = [];

function* intercept() {
    let i = 0;
    while (i < _interceptors.length) {
        yield _interceptors[i];
        i++;
    }
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
                        return fn(call, callback);
                    }
                    first.value(ctx, function next() {
                        return new Promise(resolve => {
                            const i = interceptors.next();
                            if (i.done) {
                                return resolve(fn(call, callback));
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
