const Server = require('./Server');
const Client = require('./Client');

class Res extends Server {
    constructor(handle) {
        if (typeof handle !== 'function') {
            throw new Error('res handle must be function');
        }

        super(async (reqId, ...args) => {
            try {
                return [reqId, 0, await handle(...args)];
            }
            catch (err) {
                return [reqId, err.toString().replace(/^Error: /, '')];
            }
        });
    }
}

class Req extends Client {
    constructor(path, timeout = 15000) {
        super(path, res => {
            let [reqId, code, ret] = res;
            if (!this._reqId2Callback[reqId]) {
                return;
            }

            this._reqId2Callback[reqId](code === 0 ? null : new Error(code), ret);
            delete this._reqId2Callback[reqId];
            if (this._reqId2Timer[reqId]) {
                clearTimeout(this._reqId2Timer[reqId]);
                delete this._reqId2Timer[reqId];
            }
        });

        this.timeout = timeout;

        this._count = 0;
        this._reqId2Callback = {};
        this._reqId2Timer = {};
    }

    send(...args) {
        let reqId = ++this._count;
        args.unshift(reqId);

        if (typeof args[args.length - 1] === 'function') {
            this._reqId2Callback[reqId] = args.pop();
            this._reqId2Timer[reqId] = setTimeout(() => {
                if (!this._reqId2Callback[reqId]) {
                    return;
                }
                this._reqId2Callback[reqId](new Error('timeout'));
                delete this._reqId2Callback[reqId];
            }, this.timeout);
        }

        super.send(...args);
    }
}

module.exports = {
    Res,
    Req
};