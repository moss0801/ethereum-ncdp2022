// npm install levelup
// npm install leveldown
import levelup from 'levelup';
import leveldown from 'leveldown';

(async => {
    // leveldb path
    const path = '/mnt/d/dev/go-ethereum/data/geth/chaindata';
    const db = levelup(leveldown(path));
    let datas = [];

    db.createReadStream()
        .on('data', function (data) {
            datas.push(data.key.toString('hex') + ' : ' + data.value.toString('hex'));
        })
        .on('end', function() {
            datas.sort();
            console.log(datas);
        });
})();