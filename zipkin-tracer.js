const { HttpLogger } = require('zipkin-transport-http');
const { Tracer, ConsoleRecorder, BatchRecorder, ExplicitContext } = require('zipkin');

module.exports = localServiceName => {
    let recorder;

    if (process.env.ZIPKIN_URL) {
        recorder = new BatchRecorder({
            logger: new HttpLogger({
                endpoint: process.env.ZIPKIN_URL,
            }),
        });
    } else {
        recorder = new ConsoleRecorder();
    }

    return new Tracer({
        ctxImpl: new ExplicitContext(),
        recorder,
        localServiceName,
    });
};
