const handler = {

    // set up the proxy get handler
    get(target, propKey) {

    // store the original func being called
        const origFunc = target[propKey];

        // IMPORTANT - we only want to intercept gRPC request functions!
        // Validate this is a gRPC request func by checking the object for
        // a requestSerialize() function
        let grpcMethod = false;
        for (const k in origFunc) {
            if (k === 'requestSerialize' && typeof origFunc[k] === 'function') {
                grpcMethod = true;
                break;
            }
        }

        // if this doesn't look like a gRPC request func, return the original func
        if (!grpcMethod) {
            return function (...args) {
                return origFunc.call(target, ...args);
            };
        }

        // insert the zipkin client interceptor into the call
        return function (...args) {

            let message, options, callback;

            if (args.length >= 3) {
                message = args[0];
                options = args[1];
                callback = args[2];
            } else {
                message = args[0] || undefined;
                callback = args[1] || undefined;
            }

            if (!options) {
                options = {};
            }

            if (!(options.interceptors && Array.isArray(options.interceptors))) {
                options.interceptors = [];
            }

            options.interceptors = options.interceptors.concat(target.interceptors);

            return origFunc.call(target, message, options, callback);

        };

    },

};

module.exports = (client) => {
    client.interceptors = [];
    client.use = fn => {
        client.interceptors.push(fn);
    };
    return new Proxy(client, handler);
};
