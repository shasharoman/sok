const {
    Req,
    Res
} = require('../lib/reqres');
const expect = require('chai').expect;
const fs = require('fs');

let sockPath = './req.sock';

let res = null;

before(async () => {
    fs.existsSync(sockPath) && fs.unlinkSync(sockPath);

    res = new Res(() => 'res');
    res.listen(sockPath);
});

describe('req-res', () => {
    it('req', async () => {
        let req = await _initReq();

        return new Promise(resolve => {
            req.send('req', (err, res) => {
                expect(err).to.be.equal(null);
                expect(res).to.be.equal('res');
                resolve();
            });
        });
    });

    it('req, rate > 1000 msg/s', async () => {
        let req = await _initReq();

        return new Promise(resove => {
            let times = 0;
            let ts = Date.now();

            for (let i = 0; i < 600; i++) {
                req.send('req', () => {
                    if (times++ > 500) {
                        expect(Date.now() - ts).to.be.lt(500);
                        resove();
                    }
                });
            }
        });
    });
});

after(() => {
    res.close();
});

async function _initReq() {
    return new Promise(resolve => {
        let sub = new Req(sockPath);
        setTimeout(() => resolve(sub), 10);
    });
}