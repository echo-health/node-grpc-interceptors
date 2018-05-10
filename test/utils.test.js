const proto = require('./proto');
const utils = require('../utils');

const Greet = (call, next) => {
    next();
};

const Wave = (call, next) => {
    next();
};

describe('lookup service metadata', () => {

    test('should lookup service metadata from implementation key', done => {
        const lookup = utils.lookupServiceMetadata(proto.Test.Messenger.service, { Greet, Wave });
        const result = lookup('Wave');
        expect(result).toBeDefined();
        expect(result.name).toBe('Test.Messenger');
        expect(result.method).toBe('Wave');
        expect(result.type).toBe('unary');
        expect(result.path).toBe('/Test.Messenger/Wave');
        done();
    });

    test('should return undeifned if implementation method isn\'t found', done => {
        const lookup = utils.lookupServiceMetadata(proto.Test.Messenger.service, { Greet, Wave });
        const result = lookup('NotDefined');
        expect(result).toBeUndefined();
        done();
    });

});
