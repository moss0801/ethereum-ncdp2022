// https://github.com/ethereumjs/ethereumjs-monorepo/tree/master/packages/tx
// npm install @ethereumjs/common
// npm install @ethereumjs/tx
// npm install ethereum-cryptography
// npm install rlp
import RLP from 'rlp';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import util from 'ethereumjs-util';
const secp256k1 = require("ethereum-cryptography/secp256k1");
import Web3 from 'web3';

function hex(buffer, prefix = true) {
    return (prefix ? '0x' : '') + buffer.toString('hex');
}

(async () => {
    console.log('=========================')
    console.log('==== Type 2 EIP-1559 ====')
    console.log('=========================')

    // Prepare
    const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
    const chainId = '0x' + (await web3.eth.getChainId()).toString(16);  // 4693
    const privateKey = '8d46f2260091f89d63a73a2171234835d272e0cab9fb630b4306aaf72f22e830';
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);

    const type2 = Buffer.from('02', 'hex');

    const nonce = await web3.eth.getTransactionCount(account.address);

    const destination = "0x60e69B73db38D52C70690a8EfCeE30383190CDFA".toLowerCase();
    // data: ABI Encoding of transfer('0x911D6B77014FA58aFD85BE49e5148CBEAA3FeE39', 1000)
    const data = "0xa9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8";
    const estimateGas = await web3.eth.estimateGas({
        from: account.address,
        to: destination,
        data: data
    });
    console.log(`estimateGas : ${estimateGas}`);

    const maxPriorityFeePerGas = '0x9502f900';  // 2500000000 wei
    const maxFeePerGas = "0x06fc23ac00"; // 30 * 10 ** 9 wei
    const gasLimit = estimateGas;
    const amount = "0x";  // 0 wei
    const accessList = [];
    let signatureYParity = "0x";  // 0
    let signatureR = '0x';  // 0
    let signatureS = '0x';  // 0

    console.log('\n>> Prepare Sign')
    // 0x02 || rlp([chain_id, nonce, max_priority_fee_per_gas, max_fee_per_gas, gas_limit, destination, amount, data, access_list, signature_y_parity, signature_r, signature_s])
    const txItems = [
        chainId, nonce,
        maxPriorityFeePerGas, maxFeePerGas, gasLimit,
        destination, amount, data, accessList];
    console.log(`txItems: ${txItems}`);
    const txRlp = RLP.encode(txItems);
    console.log(`txRlp: ${hex(txRlp)}`);

    // 0x02 || rlp(items)
    const txHash = util.keccak256(Buffer.concat([type2, txRlp]));
    console.log(`txHash: ${hex(txHash)}`);

    //// ECDSA sign 생성
    console.log('\n>> Sign(ECDSA)')

    const [signature, recId] = secp256k1.signSync(txHash, privateKey, {recovered: true, der: false});

    signatureYParity = recId === 0 ? '0x' : '0x1';
    signatureR = Buffer.from(signature.slice(0, 32))
    signatureS = Buffer.from(signature.slice(32, 64))
    console.log(`recId: ${recId}`);
    console.log(`signatureYParity: ${signatureYParity}`);
    console.log(`signatureR: ${hex(signatureR)}`);
    console.log(`signatureS: ${hex(signatureS)}`);

    //// Signed Tx with v,r,s
    console.log('>> Signed Transaction')
    const signedTxItems = [
        chainId, nonce,
        maxPriorityFeePerGas, maxFeePerGas, gasLimit,
        destination, amount, data, accessList,
        signatureYParity, hex(signatureR), hex(signatureS)];
    console.log(`signedTxItems: ${signedTxItems}`);

    const signedTxRlp = RLP.encode(signedTxItems);
    console.log(`signedTxRlp: \n${hex(signedTxRlp)}`);

    const signedTx = Buffer.concat([type2, signedTxRlp]);
    console.log(`signedTx : ${hex(signedTx)}`);

    const signedTxHash = util.keccak256(signedTx);
    console.log(`signedTxHash : ${hex(signedTxHash)}`);

    //// Send Transaction
    console.log('\n>> Send Transaction')
    web3.eth.sendSignedTransaction(hex(signedTx))
        .on('receipt', console.log);
})();

// {
//     transactionHash: '0xc1371d884d98fcb6fe38b85434bdf697ca4ab68661f1e8693660e116d15c03b8',
//     transactionIndex: 0,
//     blockNumber: 4,
//     blockHash: '0x527fc885f50a7974d5fb48638043885cc83c238fa85787ebd6e47f1af32f8364',
//     from: '0x942f397b7f4391b43115395f469c63072aed6e41',
//     to: '0x60e69b73db38d52c70690a8efcee30383190cdfa',
//     cumulativeGasUsed: 35146,
//     gasUsed: 35146,
//     contractAddress: null,
//     logs: [
//         {
//             address: '0x60e69B73db38D52C70690a8EfCeE30383190CDFA',
//             blockHash: '0x527fc885f50a7974d5fb48638043885cc83c238fa85787ebd6e47f1af32f8364',
//             blockNumber: 4,
//             data: '0x00000000000000000000000000000000000000000000000000000000000003e8',
//             logIndex: 0,
//             removed: false,
//             topics: [Array],
//             transactionHash: '0xc1371d884d98fcb6fe38b85434bdf697ca4ab68661f1e8693660e116d15c03b8',
//             transactionIndex: 0,
//             id: 'log_97cf0db1'
//         }
//     ],
//     logsBloom: '0x000000000040000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000080000000400000000000000000000000000000000000100040000000000000400
//     0000000000000000000000000000001000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000240000000000020000000000000000000000000000000000000000000
//     0000000000000000000000000000000000000000000000000000000000000000',
//     status: true,
//     effectiveGasPrice: 3089090405,
//     type: '0x2'
// }
