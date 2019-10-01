const {
    Pub,
    Sub
} = require('../lib/pubsub');
const expect = require('chai').expect;
const fs = require('fs');

let sockPath = './pub.sock';

let pub = null;

before(async () => {
    fs.existsSync(sockPath) && fs.unlinkSync(sockPath);

    pub = new Pub(sockPath);
});

describe('pub-sub', () => {
    it('publish', async () => {
        let sub = await _initSub();

        return new Promise(resolve => {
            sub.subscribe(msg => {
                expect(msg.toString()).to.be.equals('msg');
                resolve();
            });

            pub.publish('msg');
        });
    });

    it('publish, without subscribe', async () => {
        pub.publish('msg');
    });

    it('publish, after subscriber close', async () => {
        let sub = await _initSub();
        sub.subscribe(msg => {
            expect(msg.toString()).to.be.equals('msg');
        });
        pub.publish('msg');
        sub.close();
        pub.publish('msg');
    });

    it('publish, multi subscriber', async () => {
        let sub1 = await _initSub();
        let sub2 = await _initSub();

        sub1.subscribe(msg => {
            expect(msg.toString()).to.be.equals('msg');
        });
        sub2.subscribe(msg => {
            expect(msg.toString()).to.be.equals('msg');
        });
        pub.publish('msg');

        sub1.close();
        pub.publish('msg');
        sub2.close();
        pub.publish('msg');
    });

    it('publish, rate > 1000 msg/s', async () => {
        let sub = await _initSub();

        return new Promise(resove => {
            let times = 0;
            let ts = Date.now();

            sub.subscribe(() => {
                if (times++ > 500) {
                    expect(Date.now() - ts).to.be.lt(500);
                    resove();
                }
            });

            for (let i = 0; i < 600; i++) {
                pub.publish('msg');
            }
        });
    });
});

after(() => {
    pub.close();
});

async function _initSub() {
    return new Promise(resolve => {
        let sub = new Sub(sockPath);
        setTimeout(() => resolve(sub), 10);
    });
}