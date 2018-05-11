const proto = require('./proto');
const utils = require('../utils');

const Greet = (call, callback) => {
    callback();
};

const WaveAgain = (call, callback) => {
    callback();
};

const waveAgain = WaveAgain;

const Wave = (call, callback) => {
    callback();
};

describe('lookup service metadata', () => {

    test('should lookup service metadata from implementation key', done => {
        const lookup = utils.lookupServiceMetadata(proto.Test.Messenger.service, { Greet, Wave, WaveAgain });
        const result = lookup('Wave');
        expect(result).toBeDefined();
        expect(result.name).toBe('Test.Messenger');
        expect(result.method).toBe('Wave');
        expect(result.type).toBe('unary');
        expect(result.path).toBe('/Test.Messenger/Wave');
        done();
    });

    test('should return undefined if implementation method isn\'t found', done => {
        const lookup = utils.lookupServiceMetadata(proto.Test.Messenger.service, { Greet, Wave, WaveAgain });
        const result = lookup('NotDefined');
        expect(result).toBeUndefined();
        done();
    });

    test('should return method definition if method name is more than one word and has upper camelcase implemntation', done => {
        const lookup = utils.lookupServiceMetadata(proto.Test.Messenger.service, { Greet, Wave, WaveAgain });
        const result = lookup('WaveAgain');
        expect(result).toBeDefined();
        expect(result.name).toBe('Test.Messenger');
        expect(result.method).toBe('WaveAgain');
        expect(result.type).toBe('unary');
        expect(result.path).toBe('/Test.Messenger/WaveAgain');
        done();
    });

    test('should return method definition if method name is more than one word and has lower camelcase implemntation', done => {
        const lookup = utils.lookupServiceMetadata(proto.Test.Messenger.service, { Greet, Wave, waveAgain });
        const result = lookup('WaveAgain');
        expect(result).toBeDefined();
        expect(result.name).toBe('Test.Messenger');
        expect(result.method).toBe('WaveAgain');
        expect(result.type).toBe('unary');
        expect(result.path).toBe('/Test.Messenger/WaveAgain');
        done();
    });


});
