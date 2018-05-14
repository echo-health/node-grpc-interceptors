module.exports = {
    clientProxy: (client) => { return require('./client-proxy')(client); },
    serverProxy: (server) => { return require('./server-proxy')(server); },
    clientZipkinInterceptor: serviceName => {
        return require('./interceptors/client-zipkin-interceptor')(serviceName);
    },
    serverZipkinInterceptor: serviceName => {
        return require('./interceptors/server-zipkin-interceptor')(serviceName);
    },
};
