const grpc = require('grpc');
const { Instrumentation } = require('zipkin');

const zipkinInterceptor = function (options, nextCall) {

    const tracer = this; // 'this' is bound to the tracer created in the module exports

    const components = options.method_definition.path.split('/');
    const remoteMethodName = components[2] || 'unknown';

    const instrumentation = new Instrumentation.HttpClient({ tracer });

    return new grpc.InterceptingCall(nextCall(options), {

        start: function (metadata, listener, next) {

            // add zipkin trace data to request metadata
            const { headers } = instrumentation.recordRequest(
                {},
                options.method_definition.path,
                remoteMethodName,
            );

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

module.exports = localServiceName => {
    const tracer = require('../zipkin-tracer')(localServiceName);
    return zipkinInterceptor.bind(tracer);
};
