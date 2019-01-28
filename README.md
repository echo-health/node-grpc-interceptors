# grpc-interceptors
This library provides a way to instrument Node.js gRPC clients and servers with interceptors/middleware e.g. for Prometheus metrics, Zipkin tracing etc.

### Usage
```js
const interceptors = require('grpc-interceptors');
const grpc = require('grpc');

const server = interceptors.serverProxy(new grpc.Server());
server.addService(proto.MyPackage.MyService.service, { Method1, Method2 });

const myMiddlewareFunc = async function (ctx, next, errorCb) {

    try {
    // do stuff before call
    console.log('Making gRPC call...');
    await next()
    // do stuff after call
    console.log(ctx.status.code);
    } catch(e) {
        errorCb({
            code: grpc.status.INTERNAL,
            message: 'Some error occurred!'
        });
    }
}

server.use(myMiddlewareFunc);


```

### Available Interceptors
- [client-zipkin-interceptor](interceptors/client-zipkin-interceptor.js)
- [server-zipkin-interceptor](interceptors/server-zipkin-interceptor.js)
- [prometheus-interceptor](https://github.com/echo-health/node-grpc-prometheus)
