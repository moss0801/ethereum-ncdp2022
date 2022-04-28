// https://github.com/ethereumjs/ethereumjs-monorepo/tree/master/packages/tx
// npm install @ethereumjs/common
// npm install @ethereumjs/tx
// npm install ethereum-cryptography
// npm install rlp
import RLP from 'rlp';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Common = require('@ethereumjs/common').default;  // https://github.com/ethereumjs/ethereumjs-monorepo/issues/978
import Tx from '@ethereumjs/tx'
import util from 'ethereumjs-util';
//const { ecdsaSign, ecdsaRecover, publicKeyConvert } = require("ethereum-cryptography/secp256k1");
const secp256k1 = require("ethereum-cryptography/secp256k1");

function hex(buffer, prefix = true) {
    return (prefix ? '0x' : '') + buffer.toString('hex');
}

// legacy Transaction (Type 0) && EIP-155: Simple replay attack protection
// https://eips.ethereum.org/EIPS/eip-155

const chainId = 4693;

const txParams = {
    nonce: '0x00',
    gasPrice: '0x06fc23ac00',  // 30,000,000,000 wei
    gasLimit: '0x0f4240',  // 1,000,000 gas
    to: '0x911d6b77014fa58afd85be49e5148cbeaa3fee39',
    value: '0x00',
    data: '0xa9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8',
}

// chainId : 4693 => 0x1255
// data : ABI Encoding( transfer('0x911d6b77014fa58afd85be49e5148cbeaa3fee39', 1000) )
// const txParams = {
//   nonce: '0x00',
//   gasPrice: '0x06fc23ac00',  // 30,000,000,000 wei
//   gasLimit: '0x0f4240',  // 1,000,000 gas
//   to: '0x911d6b77014fa58afd85be49e5148cbeaa3fee39',
//   value: '0x00',
//   data: '0xa9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8',
//   v: 0,
//   r: 0,
//   s: 0
// }

//// raw
const txItems = ["0x","0x06fc23ac00","0x0f4240","0x911d6b77014fa58afd85be49e5148cbeaa3fee39","0x","0xa9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8","0x","0x","0x"];
const txRlp = RLP.encode(txItems);
console.log('[raw] txRlpSerialized: ' + hex(txRlp));
// 0xf86a808506fc23ac00830f424094911d6b77014fa58afd85be49e5148cbeaa3fee3980b844a9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8808080

// txHash = keccak-256(txRlpEncode) = 0xbb91c440d43e3149e5e5d5bb8aa90683ada52ce496b9b687229a106d60aa39ed
const txHash = util.keccak256(txRlp);
console.log('[raw] txHash: ' + hex(txHash));
// 0xbb91c440d43e3149e5e5d5bb8aa90683ada52ce496b9b687229a106d60aa39ed

//// ethereumjs
const common = Common.custom({ chainId: chainId })
const tx = Tx.Transaction.fromTxData(txParams, { common })
const ethereumJsTxRlp = tx.serialize();
console.log('[ethereumjs] tx rlp serialized: ' + ethereumJsTxRlp.toString('hex'));
// 0xf86a808506fc23ac00830f424094911d6b77014fa58afd85be49e5148cbeaa3fee3980b844a9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8808080
const ethereumJsTxHash = tx.hash();
console.log('[ethereumjs] tx hash = ' + hex(ethereumJsTxHash));
// tx hash: 0xbb91c440d43e3149e5e5d5bb8aa90683ada52ce496b9b687229a106d60aa39ed

if (hex(txRlp) !== hex(ethereumJsTxRlp)) {
    throw new Error('tx rlp not equals. ' + hex(txRlp) + ' ' + hex(ethereumJsTxRlp));
} else if (hex(txHash) !== hex(ethereumJsTxHash)) {
    throw new Error('tx hash not equals.' + hex(txHash) + ' ' + hex(ethereumJsTxHash));
}

//// 서명 전 rlp 및 tx hash 체크 통과
const privateKey = Buffer.from(
    '8d46f2260091f89d63a73a2171234835d272e0cab9fb630b4306aaf72f22e830',
    'hex'
);

//// ECDSA sign 생성
console.log('//// Start ECDSA')

// txHash, privateKey로 서명(signature) 생성
// 임시 개인키는 txHash, privateKey에 의해서 결정 (rfc6979#section-3.2)
// [raw]
// https://github.com/paulmillr/noble-secp256k1/blob/main/index.ts

// chainId 설정하여 hash 다시 계산 (EIP-155, 서명을 위한 hash에 chainId 추가)
const txItems2 = ["0x","0x06fc23ac00","0x0f4240","0x911d6b77014fa58afd85be49e5148cbeaa3fee39","0x","0xa9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8",chainId,"0x","0x"];
const txRlp2 = RLP.encode(txItems2);
console.log('[raw] txRlp2: ' + hex(txRlp2));
// txHash2 = keccak-256(txRlp2) = 0xce828505203d88da5400950c7986a5cc8c17e5005356044cdf92a2ecc2fe34d7
const txHash2 = util.keccak256(txRlp2);
console.log('[raw] txHash2: ' + hex(txHash2));

const [signature, recId] = secp256k1.signSync(txHash2, privateKey, {recovered: true, der: false});
// https://tools.ietf.org/id/draft-jivsov-ecc-compact-05.html
// {02, 03, 04}, where 02 or 03 represent a compressed point (x only), while 04 represents a complete point (x,y)
// 공개키 y값이 짝수 => recId = 0, 홀수 => recId = 1
// recId = 0 => 02, recId = 1 => 03
const rawV = new util.BN(chainId * 2 + 35 + recId);
const rawR = Buffer.from(signature.slice(0, 32))
const rawS = Buffer.from(signature.slice(32, 64))
console.log('[raw] recId: ' + recId);
console.log('[raw] v: ' + hex(rawV));
console.log('[raw] r: ' + hex(rawR));
console.log('[raw] s: ' + hex(rawS));


const signature2 = util.ecsign(txHash2, privateKey, chainId);
console.log('[raw2] v: ' + hex(new util.BN(signature2.v)));
console.log('[raw2] r: ' + hex(signature2.r));
console.log('[raw2] s: ' + hex(signature2.s));

// [ethereumjs]
// https://github.com/ethereumjs/ethereumjs-monorepo/blob/master/packages/tx/src/baseTransaction.ts#L298
const ethereumJsSignedTx = tx.sign(privateKey)
console.log('[ethereumJs] v: ' + hex(ethereumJsSignedTx.v))
console.log('[ethereumJs] r: ' + hex(ethereumJsSignedTx.r))
console.log('[ethereumJs] s: ' + hex(ethereumJsSignedTx.s))

if (hex(rawV) !== hex(ethereumJsSignedTx.v)) {
    throw new Error('v not equals. ' + hex(rawV) + ' ' + hex(ethereumJsSignedTx.v));
} else if (hex(rawR) !== hex(ethereumJsSignedTx.r)) {
    throw new Error('r not equals.' + hex(rawR) + ' ' + hex(ethereumJsSignedTx.r));
} else if (hex(rawS) !== hex(ethereumJsSignedTx.s)) {
    throw new Error('s not equals.' + hex(rawS) + ' ' + hex(ethereumJsSignedTx.s));
}

//// Result
const txItems3 = ["0x","0x06fc23ac00","0x0f4240","0x911d6b77014fa58afd85be49e5148cbeaa3fee39","0x","0xa9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8","0x24cd","0x7af4d4405862cd91b833db1e3da1fd80bb751c53affd07e148f5180f4926b56a","0x125f62784beff2462792fee879dca75ffd9da521c5d1d87944afebf93e7b47c1"];
const txRlp3 = RLP.encode(txItems3);
console.log('[raw] result: \n' + hex(txRlp3));
// 0x
// f8ac808506fc23ac00830f424094911d6b77014fa58afd85be49e5148cbeaa3fee3980b844a9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e88224cda07af4d4405862cd91b833db1e3da1fd80bb751c53affd07e148f5180f4926b56aa0125f62784beff2462792fee879dca75ffd9da521c5d1d87944afebf93e7b47c1


const ethereumJsSignTxRlp = ethereumJsSignedTx.serialize()
console.log('[ethereumJs] result: \n' + hex(ethereumJsSignTxRlp));
// 0xf8ac808506fc23ac00830f424094911d6b77014fa58afd85be49e5148cbeaa3fee3980b844a9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e88224cda07af4d4405862cd91b833db1e3da1fd80bb751c53affd07e148f5180f4926b56aa0125f62784beff2462792fee879dca75ffd9da521c5d1d87944afebf93e7b47c1

// var address = "0xf15090c01bec877a122b567e5552504e5fd22b79";
// var abi = [{"constant":true,"inputs":[],"name":"getCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"increment","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_count","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];
//
// var account = "<REDACTED ACCOUNT ADDRESS>";
// var privateKey = "<REDACTED PRIVATE KEY WITHOUT 0x PREFIX>";
//
// var web3 = new Web3(new Web3.providers.HttpProvider(
//     "https://ropsten.infura.io/<REDACTED API KEY"));
//
// web3.eth.getTransactionCount(account, function (err, nonce) {
//     var data = web3.eth.contract(abi).at(address).increment.getData();
//
//     var tx = new ethereumjs.Tx({
//         nonce: nonce,
//         gasPrice: web3.toHex(web3.toWei('20', 'gwei')),
//         gasLimit: 100000,
//         to: address,
//         value: 0,
//         data: data,
//     });
//     tx.sign(ethereumjs.Buffer.Buffer.from(privateKey, 'hex'));
//
//     var raw = '0x' + tx.serialize().toString('hex');
//     web3.eth.sendRawTransaction(raw, function (err, transactionHash) {
//         console.log(transactionHash);
//     });
// });


// console.log(serializedTx.toString('hex'));
// console.log(signedTx.v);
// console.log(signedTx.r);
// console.log(signedTx.s);



// https://github.com/ethereumjs/ethereumjs-monorepo/blob/master/packages/tx/src/legacyTransaction.ts#L225
// const msgHash = this.getMessageToSign(true)
// const { v, r, s } = ecsign(msgHash, privateKey)
// const tx = this._processSignature(v, r, s)

// http://blog.somi.me/math/2019/06/10/understanding-ECC-ECDSA/
// seed
// https://github.com/paulmillr/noble-secp256k1/blob/main/index.ts#L1124
// h1 = msgHash, d = privateKeyNumber
// const seedArgs = [int2octets(d), bits2octets(h1)];
// int2octets => 32bytes left padding hex
// bits2octets(h1) => hash를 숫자로 변환 => n mod 의 [0,n] 사이 값
// [32bytes privateKey left padding hex, ]
// extry entropy가 없으면 seedArgs concat 결과가 seed
// const seed = concatBytes(...seedArgs);
// const m = bits2int(h1);
// return { seed, m, d };
// HMAC_DRBG : pseudorandom number generator
// Steps B, C, D, E, F, G
// const drbg = new HmacDrbg();
// drbg.reseedSync(seed);
// Step H3, repeat until k is in range [1, n-1]
// while (!(sig = kmdToSig(drbg.generateSync(), m, d))) drbg.reseedSync();
// Converts signature params into point & r/s, checks them for validity.
// k: signatrture's k param, m : message, d : privateKey
// s = (1/k * (m + dr) mod n
// const s = mod(invert(k, n) * mod(m + d * r, n), n);
// const sig = new Signature(r, s);
// compressed point elliptic curve (0x02 or 0x03)
// const recovery = (q.x === sig.r ? 0 : 2) | Number(q.y & _1n);
// q.x !== sig.r 인 경우는 x가 음수인 경우?
// y의 홀짝 여부는 recId 홀짝 여부와 같다.
// return { sig, recovery };
// return finalizeSig(sig, opts);
// 결론: 임시 비밀키는 tx hash와 private key를 사용해서 결정적으로 생성된다. (rfc6979#section-3.2)
// recId는 0,1 만 생성 될 것으로 생각, 짝수???

// recovery , // compressed point elliptic curve
// const prefix = recovery & 1 ? '03' : '02';

// const R = Point.fromHex(prefix + numTo32bStr(r))

// https://tools.ietf.org/id/draft-jivsov-ecc-compact-05.html
//   {02, 03, 04}, where 02 or 03 represent a compressed point (x only), while 04 represents a complete point (x,y)


// const { v, r, s } = ecsign(msgHash, privateKey)
// v = recId, r = 임시 공개키 x좌표, s = 서명

// const tx = this._processSignature(v, r, s)
// _processSignature(v: number, r: Buffer, s: Buffer) :https://github.com/ethereumjs/ethereumjs-monorepo/blob/master/packages/tx/src/legacyTransaction.ts#L336
// const vBN = new BN(v)
// if (this.supports(Capability.EIP155ReplayProtection)) {
//   vBN.iadd(this.common.chainIdBN().muln(2).addn(8))
// }
// new Transaction.fromTxData({ ...
//   v: vBN,
//   r: new BN(r),
//   s: new BN(s),
// },



// If you choose to only hash 6 values, then v continues to be set to {0,1} + 27 as previously.
// v: 27 + yParity or 2*(chainId) + 35 + yParity (Spurious Dragon, 2016-11-22)
// 0x1c = 28

// 4693 -> signed -> 0x24cd = 9421
// 9421 - 35 = 9386
// 9386 % 2 = 0