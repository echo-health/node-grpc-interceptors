const grpc = require('grpc');
const { Instrumentation, Tracer, BatchRecorder, ExplicitContext } = require('zipkin');
const { HttpLogger } = require('zipkin-transport-http');

const tracer = new Tracer({
    ctxImpl: new ExplicitContext(),
    recorder: new BatchRecorder({
        logger: new HttpLogger({
            endpoint: process.env.ZIPKIN_URL || 'http://localhost:9411/api/v2/spans',
        }),
    }),
});

let clientServiceName;

const zipkinInterceptor = function (options, nextCall) {

    const components = options.method_definition.path.split('/');
    const remoteServiceName = components[1] || 'unknown';
    const remoteMethodName = components[2] || 'unknown';

    const instrumentation = new Instrumentation.HttpClient({
        tracer: tracer,
        serviceName: clientServiceName,
        remoteGrpcServiceName: remoteServiceName,
    });

    return new grpc.InterceptingCall(nextCall(options), {

        start: function (metadata, listener, next) {

            tracer.scoped(() => {

                // add zipkin trace data to request metadata
                console.log('CLIENT: recordRequest');
                const request = {};
                const path = options.method_definition.path;
                const method = remoteMethodName;
                console.log({ request, path, method });
                const { headers } = instrumentation.recordRequest(
                    request,
                    path,
                    method,
                );

                for(const k in headers) {
                    metadata.add(k, headers[k]);
                }

                console.log('CLIENT: added trace info to metadata');
                console.log(metadata);

                next(metadata, {
                    onReceiveMetadata: function (metadata, next) {
                        next(metadata);
                    },
                    onReceiveMessage: function (message, next) {
                        next(message);
                    },
                    onReceiveStatus: function (status, next) {
                        if (status.code !== grpc.status.OK) {
                            console.log('CLIENT: recordError');
                            console.log(tracer.id);
                            console.log(status);
                            instrumentation.recordError(tracer.id, status.details);
                        } else {
                            console.log('CLIENT: recordResponse');
                            console.log(tracer.id);
                            console.log(status);
                            instrumentation.recordResponse(tracer.id, status.code);
                        }
                        next(status);
                    },

                });
            });
        },
        sendMessage: function (message, next) {
            next(message);
        },
        halfClose: function (next) {
            next();
        },
    });

};

module.exports = serviceName => {
    clientServiceName = serviceName || 'unknown';
    return zipkinInterceptor;
};
