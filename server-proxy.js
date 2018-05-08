const interceptors = [];

const handler = {

  // set up the proxy get handler
  get(target, propKey) {

    // store the original func being called
    let origFunc = target[propKey];

    // TODO: work out how to validate this is a server method

    return function(...args) {
      interceptors.forEach(interceptor => {
        origFunc = interceptor()(origFunc);
      });
      return origFunc.call(target, ...args);
    };

  },

};

module.exports = (server) => {
  server.use = fn => {
    interceptors.push(fn);
  };
  return new Proxy(server, handler);
};
