const path = require('path')
const grpc = require('grpc')
const protobufjs = require('protobufjs')

const proto = protobufjs.loadSync(
  path.resolve(__dirname, 'message.proto'),
  new protobufjs.Root({ keepCase: true }),
)

const root = grpc.loadObject(proto)

module.exports = root
