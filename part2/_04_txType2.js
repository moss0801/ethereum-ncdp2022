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

    const nonce = await web3.eth.getTransactionCount(account.address, 'pending');

    const destination = "0x60e69B73db38D52C70690a8EfCeE30383190CDFA".toLowerCase();
    // data: ABI Encoding of transfer(address, uint256) => transfer("0x06B90a7D72E2988ba2711d22e91eb324686104A1", 3000)
    const data = "0xa9059cbb00000000000000000000000006b90a7d72e2988ba2711d22e91eb324686104a10000000000000000000000000000000000000000000000000000000000000bb8";
    // const estimateGas = await web3.eth.estimateGas({
    //     from: account.address,
    //     to: destination,
    //     data: data
    // });
    // console.log(`estimateGas : ${estimateGas}`);

    const maxPriorityFeePerGas = '0x9502f900';  // 2500000000 wei
    const maxFeePerGas = "0x06fc23ac00"; // 30 * 10 ** 9 wei
    const gasLimit = "0x0f4240"; // 100,000 gas
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
        .on('receipt', result => {
            console.log(result);
            // topics
            console.log('topics')
            console.log(result.logs[0].topics);
        });
})();
/*
=========================
==== Type 2 EIP-1559 ====
=========================

>> Prepare Sign
txItems: 0x1255,6,0x9502f900,0x06fc23ac00,0x0f4240,0x60e69b73db38d52c70690a8efcee30383190cdfa,0x,0xa9059cbb00000000000000000000000006b90a7d72e2988ba2711d22e91eb324686104a10000000000000000000000000000000000000000000000000000000000000bb8,
    txRlp: 0xf87082125506849502f9008506fc23ac00830f42409460e69b73db38d52c70690a8efcee30383190cdfa80b844a9059cbb00000000000000000000000006b90a7d72e2988ba2711d22e91eb324686104a10000000000000000000000000000000000000000000000000000000000000bb8c0
txHash: 0xd2c0c75d5e51151fcc9a83b5c830dc505cfd11dcd31cb3ddf7fb1d86f0a2d043

>> Sign(ECDSA)
recId: 0
signatureYParity: 0x
signatureR: 0xba942f839b668b66dcd3f82b89b504c06e3eeb982fccfe1240a98cc3868c4f90
signatureS: 0x7781a0672f66a393e41e87c3ecc6a4f00897d076684f1ea9a0d03623e651c355
>> Signed Transaction
signedTxItems: 0x1255,6,0x9502f900,0x06fc23ac00,0x0f4240,0x60e69b73db38d52c70690a8efcee30383190cdfa,0x,0xa9059cbb00000000000000000000000006b90a7d72e2988ba2711d22e91eb324686104a10000000000000000000000000000000000000000000000000000000000000bb8,,0x,0xba942f839b668b66dcd3f82b89b504c06e3eeb982fccfe1240a98cc3868c4f90,0x7781a0672f66a393e41e87c3ecc6a4f00897d076684f1ea9a0d03623e651c355
signedTxRlp:
    0xf8b382125506849502f9008506fc23ac00830f42409460e69b73db38d52c70690a8efcee30383190cdfa80b844a9059cbb00000000000000000000000006b90a7d72e2988ba2711d22e91eb324686104a10000000000000000000000000000000000000000000000000000000000000bb8c080a0ba942f839b668b66dcd3f82b89b504c06e3eeb982fccfe1240a98cc3868c4f90a07781a0672f66a393e41e87c3ecc6a4f00897d076684f1ea9a0d03623e651c355
signedTx : 0x02f8b382125506849502f9008506fc23ac00830f42409460e69b73db38d52c70690a8efcee30383190cdfa80b844a9059cbb00000000000000000000000006b90a7d72e2988ba2711d22e91eb324686104a10000000000000000000000000000000000000000000000000000000000000bb8c080a0ba942f839b668b66dcd3f82b89b504c06e3eeb982fccfe1240a98cc3868c4f90a07781a0672f66a393e41e87c3ecc6a4f00897d076684f1ea9a0d03623e651c355
signedTxHash : 0x44026d9def394f87e1a2960e2e36d88ed61019f13eac46a83ed03b09ff5e0d57

>> Send Transaction
{
    blockHash: '0x4752441a45a6fa92e22818a1e4a36cee020e06477984e254425ff534f59e5ee7',
        blockNumber: 6,
    contractAddress: null,
    cumulativeGasUsed: 104480,
    effectiveGasPrice: 2951150207,
    from: '0x942f397b7f4391b43115395f469c63072aed6e41',
    gasUsed: 52246,
    logs: [
    {
        address: '0x60e69B73db38D52C70690a8EfCeE30383190CDFA',
        topics: [Array],
        data: '0x0000000000000000000000000000000000000000000000000000000000000bb8',
        blockNumber: 6,
        transactionHash: '0x44026d9def394f87e1a2960e2e36d88ed61019f13eac46a83ed03b09ff5e0d57',
        transactionIndex: 1,
        blockHash: '0x4752441a45a6fa92e22818a1e4a36cee020e06477984e254425ff534f59e5ee7',
        logIndex: 1,
        removed: false,
        id: 'log_1383b38b'
    }
],
    logsBloom: '0x00000000004000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000010004000000000100040000000000000000000000000000000010000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002400000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000',
    status: true,
    to: '0x60e69b73db38d52c70690a8efcee30383190cdfa',
    transactionHash: '0x44026d9def394f87e1a2960e2e36d88ed61019f13eac46a83ed03b09ff5e0d57',
    transactionIndex: 1,
    type: '0x2'
}
topics
    [
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x000000000000000000000000942f397b7f4391b43115395f469c63072aed6e41',
        '0x00000000000000000000000006b90a7d72e2988ba2711d22e91eb324686104a1'
    ]
*/