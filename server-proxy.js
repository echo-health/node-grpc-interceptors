const _interceptors = [];

function* intercept() {
  let i = 0;
  while (i < _interceptors.length) {
    yield _interceptors[i];
    i++;
  }
}

const handler = {
  get(target, propKey) {
    if (propKey !== 'addService') {
      return target[propKey];
    }
    return (service, implementation) => {
      const name = Object.keys(implementation)[0];
      const newImplementation = {
        [name]: (call, callback) => {
          const interceptors = intercept();
          interceptors.next().value(call, function next() {
            return new Promise(resolve => {
              const i = interceptors.next();
              if (i.done) {
                return resolve(implementation[name](call, callback));
              }
              return resolve(next.value(call, next));
            });
          });
        },
      };
      return target.addService(service, newImplementation);
    };
  },
};

module.exports = (server) => {
  server.use = fn => {
    _interceptors.push(fn);
  };
  return new Proxy(server, handler);
};
