const { Tracer, BatchRecorder, ExplicitContext } = require('zipkin')
const { HttpLogger } = require('zipkin-transport-http')

module.exports = (localServiceName) => {
  let recorder

  if (process.env.ZIPKIN_URL) {
    recorder = new BatchRecorder({
      logger: new HttpLogger({
        endpoint: process.env.ZIPKIN_URL,
      }),
    })
  } else {
    recorder = {
      record() {},
    }
  }

  return new Tracer({
    ctxImpl: new ExplicitContext(),
    localServiceName,
    recorder,
  })
}
