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
            for (const k in implementation) {
                const name = k;
                const fn = implementation[k];
                newImplementation[name] = (call, callback) => {
                    const interceptors = intercept();
                    const first = interceptors.next();
                    if (!first.value) { // if we don't have any interceptors
                        return fn(call, callback);
                    }
                    first.value(call, function next() {
                        return new Promise(resolve => {
                            const i = interceptors.next();
                            if (i.done) {
                                return resolve(fn(call, callback));
                            }
                            return resolve(i.value(call, next));
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
