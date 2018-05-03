const interceptors = [];

const handler = {

  // set up the proxy get handler
  get(target, propKey) {

    // store the original func being called
    const origFunc = target[propKey];

    // TODO: work out how to validate this is a server method

    return function (...args) {
      // TODO: implement the logic to inject the interceptors
      return origFunc.call(target, ...args);
    };

  },

};

module.exports = (server) => {
  server.use = (interceptorFunction) => {
    interceptors.push(interceptorFunction);
  };
  return new Proxy(server, handler);
};
