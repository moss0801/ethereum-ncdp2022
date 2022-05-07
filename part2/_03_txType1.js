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
    console.log('================================================');
    console.log('==== Type 1 EIP-2930: Optional access lists ====');
    console.log('================================================');

    // Prepare
    const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
    const chainId = '0x' + (await web3.eth.getChainId()).toString(16);  // 4693
    const privateKey = '8d46f2260091f89d63a73a2171234835d272e0cab9fb630b4306aaf72f22e830';
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);

    const type1 = Buffer.from('01', 'hex');

    const nonce = await web3.eth.getTransactionCount(account.address, 'pending');
    const to = "0x60e69B73db38D52C70690a8EfCeE30383190CDFA".toLowerCase();
    // data: ABI Encoding of transfer(address, uint256) => transfer("0xCCFABb539c00b027C4aDa322D6BAcb6A1DAf99f0", 2000)
    const data = "0xa9059cbb000000000000000000000000ccfabb539c00b027c4ada322d6bacb6a1daf99f000000000000000000000000000000000000000000000000000000000000007d0";
    // const estimateGas = await web3.eth.estimateGas({
    //     from: account.address,
    //     to: to,
    //     data: data
    // });
    // console.log(`estimateGas : ${estimateGas}`);

    const gasPrice = "0x06fc23ac00"; // 30 * 10 ** 9 wei
    const gasLimit = "0x0f4240"; // 100,000 gas
    const value = "0x";  // 0 wei
    const accessList = [];
    let signatureYParity = "0x";  // 0
    let signatureR = '0x';  // 0
    let signatureS = '0x';  // 0

    console.log('\n>> Prepare Sign')
    // 0x01 || rlp([chainId, nonce, gasPrice, gasLimit, to, value, data, accessList, signatureYParity, signatureR, signatureS])
    const txItems = [
        chainId, nonce, gasPrice, gasLimit,
        to, value, data, accessList];
    console.log(`txItems: ${txItems}`);
    const txRlp = RLP.encode(txItems);
    console.log(`txRlp: ${hex(txRlp)}`);

    // 0x02 || rlp(items)
    const txHash = util.keccak256(Buffer.concat([type1, txRlp]));
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
        chainId, nonce, gasPrice, gasLimit,
        to, value, data, accessList,
        signatureYParity, hex(signatureR), hex(signatureS)];
    console.log(`signedTxItems: ${signedTxItems}`);

    const signedTxRlp = RLP.encode(signedTxItems);
    console.log(`signedTxRlp: \n${hex(signedTxRlp)}`);

    const signedTx = Buffer.concat([type1, signedTxRlp]);
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
txItems: 0x1255,3,0x9502f900,0x06fc23ac00,0x0f4240,0x60e69b73db38d52c70690a8efcee30383190cdfa,0x,0xa9059cbb00000000000000000000000006b90a7d72e2988ba2711d22e91eb324686104a10000000000000000000000000000000000000000000000000000000000000bb8,
    txRlp: 0xf87082125503849502f9008506fc23ac00830f42409460e69b73db38d52c70690a8efcee30383190cdfa80b844a9059cbb00000000000000000000000006b90a7d72e2988ba2711d22e91eb324686104a10000000000000000000000000000000000000000000000000000000000000bb8c0
txHash: 0x02985cd10a35009c2d7282dc0cb413c8eb1cae09267309b8eb52a28fe12638c9

>> Sign(ECDSA)
recId: 1
signatureYParity: 0x1
signatureR: 0xa3f8c9bcb37fde6aec7bd8bc35f59e619f722f4bb1e323c3ff6c3820b502ba23
signatureS: 0x36e2458f7b52df560d437ff07e75d05e42136086a909ea2075562c1a77007a59
>> Signed Transaction
signedTxItems: 0x1255,3,0x9502f900,0x06fc23ac00,0x0f4240,0x60e69b73db38d52c70690a8efcee30383190cdfa,0x,0xa9059cbb00000000000000000000000006b90a7d72e2988ba2711d22e91eb324686104a10000000000000000000000000000000000000000000000000000000000000bb8,,0x1,0xa3f8c9bcb37fde6aec7bd8bc35f59e619f722f4bb1e323c3ff6c3820b502ba23,0x36e2458f7b52df560d437ff07e75d05e42136086a909ea2075562c1a77007a59
signedTxRlp:
    0xf8b382125503849502f9008506fc23ac00830f42409460e69b73db38d52c70690a8efcee30383190cdfa80b844a9059cbb00000000000000000000000006b90a7d72e2988ba2711d22e91eb324686104a10000000000000000000000000000000000000000000000000000000000000bb8c001a0a3f8c9bcb37fde6aec7bd8bc35f59e619f722f4bb1e323c3ff6c3820b502ba23a036e2458f7b52df560d437ff07e75d05e42136086a909ea2075562c1a77007a59
signedTx : 0x02f8b382125503849502f9008506fc23ac00830f42409460e69b73db38d52c70690a8efcee30383190cdfa80b844a9059cbb00000000000000000000000006b90a7d72e2988ba2711d22e91eb324686104a10000000000000000000000000000000000000000000000000000000000000bb8c001a0a3f8c9bcb37fde6aec7bd8bc35f59e619f722f4bb1e323c3ff6c3820b502ba23a036e2458f7b52df560d437ff07e75d05e42136086a909ea2075562c1a77007a59
signedTxHash : 0xa7aa82999d4b8da857fadb8f3f18a3e1b4de0e0cbac2071bbb86993c71df1235

>> Send Transaction
{
    blockHash: '0x755b635be66b356cfd8a94fe71fcfc71889dc28e590d24066e5bafc2314ad806',
        blockNumber: 3,
    contractAddress: null,
    cumulativeGasUsed: 104480,
    effectiveGasPrice: 3173020903,
    from: '0x942f397b7f4391b43115395f469c63072aed6e41',
    gasUsed: 52246,
    logs: [
    {
        address: '0x60e69B73db38D52C70690a8EfCeE30383190CDFA',
        topics: [Array],
        data: '0x0000000000000000000000000000000000000000000000000000000000000bb8',
        blockNumber: 3,
        transactionHash: '0xa7aa82999d4b8da857fadb8f3f18a3e1b4de0e0cbac2071bbb86993c71df1235',
        transactionIndex: 1,
        blockHash: '0x755b635be66b356cfd8a94fe71fcfc71889dc28e590d24066e5bafc2314ad806',
        logIndex: 1,
        removed: false,
        id: 'log_85172b05'
    }
],
    logsBloom: '0x00000000004000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000010004000000000100040000000000000000000000000000000010000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002400000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000',
    status: true,
    to: '0x60e69b73db38d52c70690a8efcee30383190cdfa',
    transactionHash: '0xa7aa82999d4b8da857fadb8f3f18a3e1b4de0e0cbac2071bbb86993c71df1235',
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
