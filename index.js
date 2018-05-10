module.exports = {
    clientProxy: (client) => { return require('./client-proxy')(client); },
    serverProxy: (server) => { return require('./server-proxy')(server); },
    clientZipkinInterceptor: require('./interceptors/client-zipkin-interceptor'),
    serverZipkinInterceptor: require('./interceptors/server-zipkin-interceptor'),
};
