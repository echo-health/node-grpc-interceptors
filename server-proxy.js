const _interceptors = [];

function* intercept() {
  let i = 0;
  while (i < _interceptors.length) {
    yield _interceptors[i];
    i++;
  }
}

const handler = {

  // set up the proxy get handler
  get(target, propKey) {

    // store the original func being called
    const origFunc = target[propKey];

    if (propKey !== 'hello') {
      return function(...args) {
        return target[propKey](...args);
      };
    }

    const interceptors = intercept();

    return function(...args) {
      interceptors.next().value(function n() {
        const next = interceptors.next();
        if (next.done) return origFunc(...args);
        return next.value(n);
      });
    };

  },

};

module.exports = (server) => {
  server.use = fn => {
    _interceptors.push(fn);
  };
  return new Proxy(server, handler);
};
