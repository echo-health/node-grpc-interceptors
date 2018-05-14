const { option, Instrumentation, Tracer, BatchRecorder, ExplicitContext } = require('zipkin');
const { HttpLogger } = require('zipkin-transport-http');

const zipkinInterceptor = async function (ctx, next) {

    const tracer = this; // 'this' is bound to the tracer created in the module exports

    const serviceName = tracer._localEndpoint.serviceName || 'unknown';
    const port = process.env.PORT || 0;

    const instrumentation = new Instrumentation.HttpServer({
        tracer,
        serviceName,
        port,
    });

    function readHeader(header) {
        const val = ctx.call.metadata.get(header);
        if (val.length) {
            return new option.Some(val[0]);
        }
        return option.None;
    }

    const id = instrumentation.recordRequest(
        ctx.service.method,
        ctx.service.path,
        readHeader
    );

    try {
        await next();
    } catch(err) {
        instrumentation.recordResponse(id, ctx.status.code, err);
        throw err;
    }

    instrumentation.recordResponse(id, ctx.status.code);

};

module.exports = localServiceName => {
    const tracer = new Tracer({
        ctxImpl: new ExplicitContext(),
        recorder: new BatchRecorder({
            logger: new HttpLogger({
                endpoint: process.env.ZIPKIN_URL || 'http://localhost:9411/api/v2/spans',
            }),
        }),
        localServiceName,
    });
    return zipkinInterceptor.bind(tracer);
};
