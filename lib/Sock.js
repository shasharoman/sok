const debug = require('debug')('sok:sock');
const EventEmit = require('events');
const amp = require('@shasharoman/amp');

module.exports = class Sock extends EventEmit {
    constructor(sock) {
        super();

        this.busy = false;
        this.connected = true;
        this.closed = false;

        this.sock = sock;
        this.sock.setNoDelay();
        this.parser = new amp.Parser();
        this.chunkParser = new amp.ChunkParser(this.parser);

        this.chunkParser.on('msg', (...msg) => this.emit('msg', ...msg));

        this._bindEvent();
    }

    send(...msg) {
        if (this.busy || this.closed || !this.connected) {
            return false;
        }
        if (!msg && msg !== null) {
            return false;
        }

        let chunk = this.parser.encode(...msg);
        return this.busy = !this.sock.write(chunk);
    }

    connect(...args) {
        debug('try to connect', ...args);

        this.connected = false;
        this.sock.connect(...args);
    }

    close() {
        debug('try to close');

        !this.sock.destroyed && this.sock.destroy();
    }

    _bindEvent() {
        this.sock.on('error', err => {
            debug('emit error', err);

            !this.sock.destroyed && this.sock.destroy();
            this.emit('error', err);
        });
        this.sock.on('close', hadErr => {
            debug('emit close');

            this.closed = true;
            this.emit('close', hadErr);
        });
        this.sock.on('data', chunk => {
            this.chunkParser.write(chunk);
        });

        this.sock.on('connect', () => {
            debug('emit connect');

            this.connected = true;
            this.emit('connect');
        });

        this.sock.on('drain', () => {
            debug('emit drain');

            this.busy = false;
        });
    }
};