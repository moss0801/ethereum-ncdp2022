// https://github.com/ethereumjs/ethereumjs-monorepo/tree/master/packages/tx
// npm install @ethereumjs/common
// npm install @ethereumjs/tx
// npm install ethereum-cryptography
// npm install rlp
import RLP from 'rlp';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Common = require('@ethereumjs/common').default;  // https://github.com/ethereumjs/ethereumjs-monorepo/issues/978
import util from 'ethereumjs-util';
const secp256k1 = require("ethereum-cryptography/secp256k1");
import Web3 from 'web3';

function hex(buffer, prefix = true) {
    return (prefix ? '0x' : '') + buffer.toString('hex');
}

// Legacy Transaction (Type 0) with EIP-155: Simple replay attack protection
// https://eips.ethereum.org/EIPS/eip-155

const chainId = 4693;

const txParams = {
    nonce: '0x00',
    gasPrice: '0x06fc23ac00',  // 30,000,000,000 wei
    gasLimit: '0x0f4240',  // 1,000,000 gas
    to: '0x911d6b77014fa58afd85be49e5148cbeaa3fee39',
    value: '0x00',
    data: '0xa9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8'
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
//   v: '0x1255',
//   r: 0,
//   s: 0
// }

//// raw
const txItems = [
    "0x",
    "0x06fc23ac00",
    "0x0f4240",
    "0x911d6b77014fa58afd85be49e5148cbeaa3fee39",
    "0x",
    "0xa9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8",
    "0x1255",
    "0x",
    "0x"
];
const txRlp = RLP.encode(txItems);
console.log('[raw] txRlpSerialized: ' + hex(txRlp));
// 0xf86a808506fc23ac00830f424094911d6b77014fa58afd85be49e5148cbeaa3fee3980b844a9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8808080

// txHash = keccak-256(txRlpEncode) = 0xbb91c440d43e3149e5e5d5bb8aa90683ada52ce496b9b687229a106d60aa39ed
const txHash = util.keccak256(txRlp);
console.log('[raw] txHash: ' + hex(txHash));
// 0xbb91c440d43e3149e5e5d5bb8aa90683ada52ce496b9b687229a106d60aa39ed

//// ECDSA sign 생성
console.log('//// Start ECDSA')

const privateKey = Buffer.from(
    '8d46f2260091f89d63a73a2171234835d272e0cab9fb630b4306aaf72f22e830',
    'hex'
);

// txHash, privateKey로 서명(signature) 생성
// 임시 개인키는 txHash, privateKey에 의해서 결정 (rfc6979#section-3.2)
// https://github.com/paulmillr/noble-secp256k1/blob/main/index.ts

const [signature, recId] = secp256k1.signSync(txHash, privateKey, {recovered: true, der: false});

// https://tools.ietf.org/id/draft-jivsov-ecc-compact-05.html
// {02, 03, 04}, where 02 or 03 represent a compressed point (x only), while 04 represents a complete point (x,y)
// 공개키 y값이 짝수 => recId = 0, 홀수 => recId = 1
// recId = 0 => 02, recId = 1 => 03
const v = new util.BN(chainId * 2 + 35 + recId);
const r = Buffer.from(signature.slice(0, 32))
const s = Buffer.from(signature.slice(32, 64))
console.log('recId: ' + recId);
console.log('v: ' + hex(v));
console.log('r: ' + hex(r));
console.log('s: ' + hex(s));

//// Result
const signedTxItems = [
    "0x",
    "0x06fc23ac00",
    "0x0f4240",
    "0x911d6b77014fa58afd85be49e5148cbeaa3fee39",
    "0x",
    "0xa9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8",
    hex(v),
    hex(r),
    hex(s)
];
const signedTxRlp = RLP.encode(signedTxItems);
console.log('signedTxRlp: \n' + hex(signedTxRlp));
// 0xf8ac808506fc23ac00830f424094911d6b77014fa58afd85be49e5148cbeaa3fee3980b844a9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e88224cda07af4d4405862cd91b833db1e3da1fd80bb751c53affd07e148f5180f4926b56aa0125f62784beff2462792fee879dca75ffd9da521c5d1d87944afebf93e7b47c1
const signedTxHash = util.keccak256(signedTxRlp);
console.log('signedTxHash : ' + hex(signedTxHash));

// Check Signature
const publicKey = secp256k1.getPublicKey('8d46f2260091f89d63a73a2171234835d272e0cab9fb630b4306aaf72f22e830');
console.log('public key : ' + hex(Buffer.from(publicKey)));

const isVerify = secp256k1.verify(signature, txHash, publicKey);
console.log('is verified : ' + isVerify);

//const rs = new secp256k1.Signature(new util.BN(hex(r, false), 16), new util.BN(hex(s, false), 16));
const rs = hex(r, false) + hex(s, false);
const recIdFromV = v.toNumber() % 2;
console.log('rs : ' + rs);
console.log('recIdFromV : ' + recIdFromV);
const recoverPublicKey = secp256k1.recoverPublicKey(txHash, rs, recIdFromV);
console.log(recoverPublicKey);
console.log('recover public key : ' + hex(Buffer.from(recoverPublicKey)));
const isVerify2 = secp256k1.verify(signature, txHash, recoverPublicKey);
console.log('is verified : ' + isVerify2);
if (hex(publicKey) !== hex(recoverPublicKey)) {
    throw new Error('public key and recover public key is not equal');
}

// Sign verify





// Send Transaction

// const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
// const signedTx = hex(signedTxRlp);
// web3.eth.sendSignedTransaction(hex(signedTxRlp))
//       .on('receipt', console.log);