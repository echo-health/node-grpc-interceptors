const { option, Instrumentation } = require('zipkin');

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
    const tracer = require('../zipkin-tracer')(localServiceName);
    return zipkinInterceptor.bind(tracer);
};
