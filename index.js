module.exports = {
    clientProxy: (client) => { return require('./client-proxy')(client); },
    serverProxy: (server) => { return require('./server-proxy')(server); },
    clientZipkinInterceptor: clientServiceName => {
        return require('./interceptors/client-zipkin-interceptor')(clientServiceName);
    },
    serverZipkinInterceptor: require('./interceptors/server-zipkin-interceptor'),
};
