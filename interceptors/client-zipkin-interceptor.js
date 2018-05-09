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

function getServiceName(path) {
    return path.split('/').filter(Boolean)[0] || 'unknown';
}

const zipkinInterceptor = function (options, nextCall) {

    const instrumentation = new Instrumentation.HttpClient({
        tracer: tracer,
        serviceName: 'BLAH',
        remoteGrpcServiceName: getServiceName(options.method_definition.path),
    });

    return new grpc.InterceptingCall(nextCall(options), {

        start: function (metadata, listener, next) {

            // add zipkin trace data to request metadata
            const { headers } = instrumentation.recordRequest({}, options.path, 'gRPC');
            for(const k in headers) {
                metadata.add(k, headers[k]);
            }

            next(metadata, {
                onReceiveMetadata: function (metadata, next) {
                    next(metadata);
                },
                onReceiveMessage: function (message, next) {
                    next(message);
                },
                onReceiveStatus: function (status, next) {
                    if (status.code !== grpc.status.OK) {
                        instrumentation.recordError(tracer.id, status.details);
                    } else {
                        instrumentation.recordResponse(tracer.id, status.code);
                    }
                    next(status);
                },

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

module.exports = zipkinInterceptor;
