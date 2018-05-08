const _server = {
  hello(name) {
    console.log(`hello ${name}`);
  },
};

function foo(next) {
  console.log('foo');
  next();
}
function bar(next) {
  console.log('bar');
  next();
}
function boom(next) {
  console.log('boom');
  next();
}

const server = require('./server-proxy')(_server);

server.use(foo);
server.use(bar);
server.use(boom);

server.hello('bob');
