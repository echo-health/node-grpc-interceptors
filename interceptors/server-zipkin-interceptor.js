const { option, Instrumentation, Tracer, BatchRecorder, ExplicitContext } = require('zipkin');
const { HttpLogger } = require('zipkin-transport-http');

const tracer = new Tracer({
    ctxImpl: new ExplicitContext(),
    recorder: new BatchRecorder({
        logger: new HttpLogger({
            endpoint: process.env.ZIPKIN_URL || 'http://localhost:9411/api/v2/spans',
        }),
    }),
});

const zipkinInterceptor = function (ctx, next) {

    console.log('SERVER: received metadata');
    console.log(ctx.call.metadata);

    const instrumentation = new Instrumentation.HttpServer({
        tracer: tracer,
        serviceName: ctx.service.name,
        port: process.env.PORT,
    });

    tracer.scoped(async() => {

        function readHeader(header) {
            const val = ctx.call.metadata.get(header);
            if (val) {
                return new option.Some(val);
            }
            return option.None;
        }

        console.log('SERVER: recordRequest');
        console.log({ method: ctx.service.method, path: ctx.service.path });
        const id = instrumentation.recordRequest(
            ctx.service.method,
            ctx.service.path,
            readHeader
        );

        try {
            await next();
        } catch(err) {
            console.log('SERVER: recordResponse (err)');
            console.log(id, err);
            instrumentation.recordResponse(id, 500, err);
            throw err;
        }

        console.log('SERVER: recordResponse (success)');
        console.log(id);
        instrumentation.recordResponse(id, 200, null);

    });

};

module.exports = zipkinInterceptor;
