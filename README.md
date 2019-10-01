SOK
===

SOK is a wrapper of unix socket with some common pattern.

Examples
--------

### Pub-Sub

``` {.javascript}
const sok = require('sok');

let pub = new sok.pubsub.Pub('./pub.sock');
let sub = new sok.pubsub.Sub('./pub.sock');

sub.subscribe(msg => {
    console.log(msg); // msg1 {msg: 'msg2'}
});
sub.on('connect', () => {
    pub.publish('msg1');
    pub.publish({
        msg: 'msg2'
    });
});
```

> pub-sub use amp(json mode) to encode & decode

### Req-Res

``` {.javascript}
const sok = require('sok');

let res = new sok.reqres.Res((...args) => {
    console.log(...args); // string ['array']
    return {
        code: 0,
        msg: 'ok'
    };
});
res.listen('./rpc.sock');

let req = new sok.reqres.Req('./rpc.sock');
req.on('connect', () => {
    req.send('string', ['array'], (err, res) => {
        console.log(err, res); // null {code: 0, msg: 'ok'}
    });
});
```

> req-res use amp(json mode) to encode & decode
