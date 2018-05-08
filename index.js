// module.exports = {
//   clientProxy: require('./client-proxy'),
//   serverProxy: require('./server-proxy'),
//   clientPrometheusInterceptor: require('./interceptors/client-prometheus-interceptor'),
//   clientZipkinInterceptor: require('./interceptors/client-zipkin-interceptor'),
// };

const _server = {
  hello(name) {
    console.log('func hello');
    console.log(`hello ${name}`);
  },
};

function boom() {
  console.log('func boom');
  return next => (...args) => {
    return next(...args);
  };
}

// function foo() {
//   console.log('func foo');
//   return next => (...args) => {
//     return next(...args);
//   };
// }

const server = require('./server-proxy')(_server);

server.use(boom);
// server.use(foo);

server.hello('bob');
