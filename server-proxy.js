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
        [name]: (...args) => {
          const interceptors = intercept();
          interceptors.next().value(function n() {
            const next = interceptors.next();
            if (next.done) return implementation[name](...args);
            return next.value(n);
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
