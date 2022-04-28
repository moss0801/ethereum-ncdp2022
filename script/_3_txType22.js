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
    console.log('=============================================')
    console.log('==== Type 2 EIP-1559 ====')
    console.log('=============================================')

    // Prepare
    const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
    const chainId = await web3.eth.getChainId();
    const privateKey = '8d46f2260091f89d63a73a2171234835d272e0cab9fb630b4306aaf72f22e830';

    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    console.log(account.address);

    const type2 = Buffer.from('02', 'hex');
    const nonce = await web3.eth.getTransactionCount(account.address);
    const maxPriorityFeePerGas = '0x9502f900';  // 2500000000 wei
    const maxFeePerGas = "0x06fc23ac00"; // 30 * 10 ** 9 wei
    //const gasLimit = "0x0f4240"; // 100,000 gas
    const gasLimit = "0x894A";  // 35146
    const destination = "0x60e69B73db38D52C70690a8EfCeE30383190CDFA".toLowerCase();
    const amount = "0x";  // 0 wei
    const data = "0xa9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8";
    const accessList = [];

    // Legacy Transaction (Type 0) without chainId(EIP-155)
    console.log('\n>> Prepare Sign')
    // rlp([chain_id, nonce, max_priority_fee_per_gas, max_fee_per_gas, gas_limit, destination, amount, data, access_list, signature_y_parity, signature_r, signature_s])
    const txItems = [
        '0x' + chainId.toString(16), nonce,
        maxPriorityFeePerGas, maxFeePerGas, gasLimit,
        destination, amount, data, accessList];
    console.log(txItems);
    const txRlp = RLP.encode(txItems);
    console.log('txRlp: ' + hex(txRlp));

    // 0x02 || rlp(items)
    const txHash = util.keccak256(Buffer.concat([type2, txRlp]));
    console.log('txHash: ' + hex(txHash));

    //// ECDSA sign 생성
    console.log('\n>> Sign(ECDSA)')

    const [signature, recId] = secp256k1.signSync(txHash, privateKey, {recovered: true, der: false});

    let signatureYParity = (recId === 0 ? '0x' : '0x1');
    let signatureR = Buffer.from(signature.slice(0, 32))
    let signatureS = Buffer.from(signature.slice(32, 64))
    console.log('recId: ' + recId);
    console.log('signatureYParity: ' + signatureYParity);
    console.log('signatureR: ' + hex(signatureR));
    console.log('signatureS: ' + hex(signatureS));

    //// Signed Tx with v,r,s
    console.log('>> Signed Transaction')
    const signedTxItems = [
        '0x' + chainId.toString(16), nonce,
        maxPriorityFeePerGas, maxFeePerGas, gasLimit,
        destination, amount, data, accessList,
        signatureYParity, hex(signatureR), hex(signatureS)];
    console.log(signedTxItems);

    const signedTxRlp = RLP.encode(signedTxItems);
    console.log('signedTxRlp: \n' + hex(signedTxRlp));

    const signedTx = Buffer.concat([type2, signedTxRlp]);
    console.log('signedTx : ' + hex(signedTx));

    const signedTxHash = util.keccak256(signedTx);
    console.log('signedTxHash : ' + hex(signedTxHash));

    //// Send Transaction
    console.log('\n>> Send Transaction')
    web3.eth.sendSignedTransaction(hex(signedTx))
        .on('receipt', console.log);
})();