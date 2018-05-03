module.exports = {
  clientProxy: require('./client-proxy'),
  serverProxy: require('./server-proxy'),
  clientPrometheusInterceptor: require('./interceptors/client-prometheus-interceptor'),
  clientZipkinInterceptor: require('./interceptors/client-zipkin-interceptor'),
};
