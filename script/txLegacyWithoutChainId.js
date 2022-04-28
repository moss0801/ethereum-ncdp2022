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

(async () => {
    console.log('=======================================')
    console.log('==== Type 0 Legacy without chainId ====')
    console.log('=======================================')
    console.log('')

    // Prepare
    const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
    const privateKey = '8d46f2260091f89d63a73a2171234835d272e0cab9fb630b4306aaf72f22e830';

    const nonce = '0x';  // 0
    const gasPrice = "0x06fc23ac00"; // 30 * 10 ** 9 wei
    const gasLimit = "0x0f4240"; // 100,000 gas
    const to = "0x911d6b77014fa58afd85be49e5148cbeaa3fee39";
    const value = "0x";  // 0 wei
    const data = "0xa9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8";

    // Legacy Transaction (Type 0) without chainId(EIP-155)
    console.log('\n>> Prepare Sign')
    const txItems = [nonce, gasPrice, gasLimit, to, value, data];
    console.log(txItems);
    const txRlp = RLP.encode(txItems);
    console.log('txRlp: ' + hex(txRlp));
    // 0xf867808506fc23ac00830f424094911d6b77014fa58afd85be49e5148cbeaa3fee3980b844a9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8

    const txHash = util.keccak256(txRlp);
    console.log('txHash: ' + hex(txHash));
    // 0x18f1d885f83df9e36bf02b6be0129b52123ad89b6cd21a9695018a2b9bf417c1

    //// ECDSA sign 생성
    console.log('\n>> Sign(ECDSA)')

    // txHash, privateKey로 서명(signature) 생성
    // 임시 개인키는 txHash, privateKey에 의해서 결정 (rfc6979#section-3.2)
    // https://github.com/paulmillr/noble-secp256k1/blob/main/index.ts

    const [signature, recId] = secp256k1.signSync(txHash, privateKey, {recovered: true, der: false});
    // https://tools.ietf.org/id/draft-jivsov-ecc-compact-05.html
    // {02, 03, 04}, where 02 or 03 represent a compressed point (x only), while 04 represents a complete point (x,y)
    // 공개키 y값이 짝수 => recId = 0, 홀수 => recId = 1
    // recId = 0 => 02, recId = 1 => 03
    const v = new util.BN(27 + recId);
    const r = Buffer.from(signature.slice(0, 32))
    const s = Buffer.from(signature.slice(32, 64))
    console.log('recId: ' + recId);
    console.log('v: ' + hex(v));
    console.log('r: ' + hex(r));
    console.log('s: ' + hex(s));

    //// Signed Tx with v,r,s
    console.log('>> Signed Transaction')
    const signedTxItems = [nonce, gasPrice, gasLimit, to, value, data, hex(v), hex(r), hex(s)];
    console.log(signedTxItems);

    const signedTxRlp = RLP.encode(signedTxItems);
    console.log('signedTxRlp: \n' + hex(signedTxRlp));
    // 0xf8aa808506fc23ac00830f424094911d6b77014fa58afd85be49e5148cbeaa3fee3980b844a9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e81ba06c5822e28956ad42fa7900286b6789afbe65556712cc3617de12d645218eb62ea02a0f55c0c52cf33a669d6fa73f85cb5137de00625dedf246a2627b5b883251fe
    const signedTxHash = util.keccak256(signedTxRlp);
    console.log('signedTxHash : ' + hex(signedTxHash));
    // 0x55e81096cbda1b60a3ba12dc2e365f85b12dee8988fe62b488bf838642af805b

    //// Send Transaction
    console.log('\n>> Send Transaction')
    web3.eth.sendSignedTransaction(hex(signedTxRlp))
        .on('receipt', console.log);
})();