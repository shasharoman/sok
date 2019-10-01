const debug = require('debug')('sok:client');
const Server = require('./Server');
const Client = require('./Client');

class Pub extends Server {
    constructor(path) {
        super();

        super.listen(path);
    }

    publish(msg) {
        return super.send(msg);
    }
}

class Sub extends Client {
    constructor(path) {
        super(path, msg => {
            this.subers.forEach(fn => fn(msg));
        });

        this.subers = [];
    }

    subscribe(fn) {
        debug('try to subscribe');

        this.subers.push(fn);
    }
}

module.exports = {
    Pub,
    Sub
};