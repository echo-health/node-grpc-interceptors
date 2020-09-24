const path = require('path')
const protoLoader = require('@grpc/proto-loader')
const grpc = require('grpc')

const packageDefinition = protoLoader.loadSync(path.resolve(__dirname, 'message.proto'), {
  keepCase: true,
})

const packageObject = grpc.loadPackageDefinition(packageDefinition)

module.exports = packageObject
