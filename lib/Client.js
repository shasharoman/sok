const debug = require('debug')('sok:client');
const EventEmit = require('events');
const net = require('net');
const Sock = require('./Sock.js');

module.exports = class Client extends EventEmit {
    constructor(path, onMsg) {
        super();

        this.path = path;

        let sock = new net.Socket();
        this.sock = new Sock(sock);

        this.sock.on('error', err => this.emit('error', err));
        this.sock.on('close', hadErr => this.emit('close', hadErr));
        this.sock.on('connect', () => this.emit('connect'));
        this.sock.on('msg', (...msg) => onMsg && onMsg(...msg));

        this.sock.connect(this.path);
    }

    send(...msg) {
        this.sock.send(...msg);
    }

    close() {
        debug('try to close');

        this.sock.close();
    }
};