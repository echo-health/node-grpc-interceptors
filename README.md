# grpc-interceptors

@theo.gravity - Modified to work with our proto-loader impl. Removes all the `toLowerCamelCase` references.

This library provides a way to instrument Node.js gRPC clients and servers with interceptors/middleware e.g. for Prometheus metrics, Zipkin tracing etc.

### Usage

```js
const interceptors = require('grpc-interceptors');

const server = interceptors.serverProxy(new grpc.Server());
server.addService(proto.MyPackage.MyService.service, { Method1, Method2 });

const myMiddlewareFunc = function (ctx, next) {

    // do stuff before call
    console.log('Making gRPC call...');

    await next()

    // do stuff after call
    console.log(ctx.status.code);
}

server.use(myMiddlewareFunc);
```

### Available Interceptors

- [client-zipkin-interceptor](interceptors/client-zipkin-interceptor.js)
- [server-zipkin-interceptor](interceptors/server-zipkin-interceptor.js)
- [prometheus-interceptor](https://github.com/echo-health/node-grpc-prometheus)
