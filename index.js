module.exports = {
  clientProxy: (client) => {
    return require('./client-proxy')(client)
  },
  clientZipkinInterceptor: (serviceName) => {
    return require('./interceptors/client-zipkin-interceptor')(serviceName)
  },
  serverProxy: (server) => {
    return require('./server-proxy')(server)
  },
  serverZipkinInterceptor: (serviceName) => {
    return require('./interceptors/server-zipkin-interceptor')(serviceName)
  },
}
