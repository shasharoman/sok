const debug = require('debug')('sok:server');
const EventEmit = require('events');
const net = require('net');
const Sock = require('./Sock.js');

module.exports = class Server extends EventEmit {
    constructor(onMsg) {
        super();

        this.server = null;
        this.socks = new Set();

        this.server = net.createServer(sock => {
            debug('client connected');

            sock = new Sock(sock);
            sock.on('error', err => debug('sock error', err));
            sock.on('close', () => {
                this.socks.delete(sock);
                this.emit('disconnect');
            });
            sock.on('msg', async (...msg) => onMsg && sock.send(await onMsg(...msg)));

            this.emit('connected', msg => msg && sock.send(msg));
            this.socks.add(sock);
        });

        this.server.on('error', err => {
            debug('emit error', err);

            this.emit('error', err);
        });
    }

    async listen(path) {
        debug('try to listen on %s', path);

        return await new Promise((resolve, reject) => {
            let args = path.split(':');
            if (args.length > 1) {
                args[1] = Number(args[1]);
                args = args.reverse();
            }

            this.server.listen(...args, err => {
                if (err) {
                    debug('listen on %s error', err);
                    reject(err);
                    return;
                }

                debug('listen on %s success', path);
                resolve();
            });
        });
    }

    send(...msg) {
        this.socks.forEach(sock => {
            sock.send(...msg);
        });
    }

    close() {
        debug('try to close');

        this.socks.forEach(sock => {
            sock.close();
        });

        this.server.close();
    }
};