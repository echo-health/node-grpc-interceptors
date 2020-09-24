const utils = require('../utils')
const proto = require('./proto')

const Greet = (call, callback) => {
  callback()
}

const WaveAgain = (call, callback) => {
  callback()
}

const waveAgain = WaveAgain

const Wave = (call, callback) => {
  callback()
}

describe('lookup service metadata', () => {
  test('should lookup service metadata from implementation key', () => {
    const lookup = utils.lookupServiceMetadata(proto.Test.Messenger.service, {
      Greet,
      Wave,
      WaveAgain,
    })
    const result = lookup('Wave')
    expect(result).toBeDefined()
    expect(result.name).toBe('Test.Messenger')
    expect(result.method).toBe('Wave')
    expect(result.type).toBe('unary')
    expect(result.path).toBe('/Test.Messenger/Wave')
  })

  test("should return undefined if implementation method isn't found", () => {
    const lookup = utils.lookupServiceMetadata(proto.Test.Messenger.service, {
      Greet,
      Wave,
      waveAgain,
    })
    const result = lookup('WaveAgain')
    expect(result).toBeUndefined()
  })

  test('should return method definition if method name is more than one word and has upper camelcase implementation', () => {
    const lookup = utils.lookupServiceMetadata(proto.Test.Messenger.service, {
      Greet,
      Wave,
      WaveAgain,
    })
    const result = lookup('WaveAgain')
    expect(result).toBeDefined()
    expect(result.name).toBe('Test.Messenger')
    expect(result.method).toBe('WaveAgain')
    expect(result.type).toBe('unary')
    expect(result.path).toBe('/Test.Messenger/WaveAgain')
  })
})
