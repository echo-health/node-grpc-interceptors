const utils = require('./utils');
const grpc = require('grpc');

const handler = {
  get(target, propKey) {
    if (propKey !== 'addService') {
      return target[propKey];
    }
    return (service, implementation) => {
      const newImplementation = {};
      const lookup = utils.lookupServiceMetadata(service, implementation);
      for (const k in implementation) {
        const name = k;
        const fn = implementation[k];
        newImplementation[name] = (call, callback) => {
          const ctx = {
            call,
            service: lookup(name),
          };
          const newCallback = callback => {
            return (...args) => {
              ctx.status = {
                code: grpc.status.OK,
              };
              const err = args[0];
              if (err) {
                ctx.status = {
                  code: grpc.status.UNKNOWN,
                  details: err,
                };
              }
              callback(...args);
            };
          };

          const interceptors = target.intercept();
          const first = interceptors.next();
          if (!first.value) { // if we don't have any interceptors
            return new Promise(resolve => {
              return resolve(fn(call, newCallback(callback)));
            });
          }
          first.value(ctx, function next() {
            return new Promise(resolve => {
              const i = interceptors.next();
              if (i.done) {
                return resolve(fn(call, newCallback(callback)));
              }
              return resolve(i.value(ctx, next));
            });
          });
        };
      }
      return target.addService(service, newImplementation);
    };
  },
};

module.exports = (server) => {
  server.interceptors = [];
  server.use = fn => {
    server.interceptors.push(fn);
  };
  server.intercept = function* intercept() {
    let i = 0;
    while (i < server.interceptors.length) {
      yield server.interceptors[i];
      i++;
    }
  };
  return new Proxy(server, handler);
};
