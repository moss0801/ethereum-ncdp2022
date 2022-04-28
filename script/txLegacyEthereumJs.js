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
import Tx from "@ethereumjs/tx";

function hex(buffer, prefix = true) {
    return (prefix ? '0x' : '') + buffer.toString('hex');
}

(async () => {
    console.log('=============================================')
    console.log('==== Type 0 Legacy with chainId(EIP-155) ====')
    console.log('=============================================')

    // Prepare
    const chainId = 4693;
    const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
    const privateKey = '8d46f2260091f89d63a73a2171234835d272e0cab9fb630b4306aaf72f22e830';

    const txParams = {
        nonce: '0x00',
        gasPrice: '0x06fc23ac00',  // 30,000,000,000 wei
        gasLimit: '0x0f4240',  // 1,000,000 gas
        to: '0x911d6b77014fa58afd85be49e5148cbeaa3fee39',
        value: '0x00',
        data: '0xa9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8'
    }

    const common = Common.custom({ chainId: chainId })
    const tx = Tx.Transaction.fromTxData(txParams, { common })
    const txRlp = tx.serialize();
    console.log('txRlp: ' + txRlp.toString('hex'));
    // 0xf86a808506fc23ac00830f424094911d6b77014fa58afd85be49e5148cbeaa3fee3980b844a9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8808080
    const txHas = tx.hash();
    console.log('txHash = ' + hex(txHas));
    // tx hash: 0xbb91c440d43e3149e5e5d5bb8aa90683ada52ce496b9b687229a106d60aa39ed

    //// Sign (ECDSA)
    console.log('\n>> Sign(ECDSA)')
    const signedTx = tx.sign(Buffer.from(privateKey, 'hex'));
    console.log('v: ' + hex(signedTx.v));
    console.log('r: ' + hex(signedTx.r));
    console.log('s: ' + hex(signedTx.s));
    console.log('signedTxRlp: \n' + hex(signedTx.serialize()));
    // 0xf8ac808506fc23ac00830f424094911d6b77014fa58afd85be49e5148cbeaa3fee3980b844a9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e88224cda07af4d4405862cd91b833db1e3da1fd80bb751c53affd07e148f5180f4926b56aa0125f62784beff2462792fee879dca75ffd9da521c5d1d87944afebf93e7b47c1
    console.log('signedTxHash : ' + hex(signedTx.hash()));
    // 0x8d00a1a23f0efa4c77fdbda58e23b61375ab7d4892ccec32699de10f386e2012

    //// Send Transaction
    console.log('\n>> Send Transaction')
    web3.eth.sendSignedTransaction(hex(signedTx.serialize()))
        .on('receipt', console.log);
})();