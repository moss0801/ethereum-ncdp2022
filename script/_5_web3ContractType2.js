import Web3 from 'web3';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const tokenJson = require("./contract/Token.json");

(async () => {
    // Prepare
    const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
    const networkId = await web3.eth.net.getId(); // 5666
    const chainId = await web3.eth.getChainId();  // 4693;
    const privateKey = '8d46f2260091f89d63a73a2171234835d272e0cab9fb630b4306aaf72f22e830';
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);

    const to = '0x60e69B73db38D52C70690a8EfCeE30383190CDFA';
    const contract = new web3.eth.Contract(tokenJson.abi, to);
    const nonce = await web3.eth.getTransactionCount(account.address);
    console.log(`nonce : ${nonce}`);
    const data = contract.methods.transfer('0x911D6B77014FA58aFD85BE49e5148CBEAA3FeE39'.toLowerCase(), 1000).encodeABI();
    console.log(`data : ${data}`);
    const gasPrice = 30000000000;
    const estimateGas = await web3.eth.estimateGas({ from: account.address, to, data });
    console.log(`estimateGas : ${estimateGas}`);
    const signedTx = await account.signTransaction({
        chainId,
        nonce,
        maxPriorityFeePerGas: 2500000000,
        maxFeePerGas: 30000000000,
        gas: estimateGas,
        to,
        value: 0,
        data,
    });
    console.log(signedTx);

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log(receipt);
})();

// {
//     messageHash: '0x78aadd89c71f8457ba920d99b885df911c8431e32d06bfc6ef644c9e8ce7d2f7',
//     v: '0x0',
//     r: '0x4cceb2903806e9aaee870062cd55383de59fccd5caf318297f8b060f9589d44d',
//     s: '0x3228ce26d9ee102810e56976ba4a48b4f04785928c59112ff0964d398a8477a7',
//     rawTransaction: '0x02f8b282125505849502f9008506fc23ac0082894a9460e69b73db38d52c70690a8efcee30383190cdfa80b844a9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee390000000000000000000000000000000000000000000000000
//     0000000000003e8c080a04cceb2903806e9aaee870062cd55383de59fccd5caf318297f8b060f9589d44da03228ce26d9ee102810e56976ba4a48b4f04785928c59112ff0964d398a8477a7',
//     transactionHash: '0x17f87f8daf972dd2b1060f076c264a8ee1484b7af9ef92b2fb7f4db3505696fd'
// }
// {
//     transactionHash: '0x17f87f8daf972dd2b1060f076c264a8ee1484b7af9ef92b2fb7f4db3505696fd',
//     transactionIndex: 0,
//     blockNumber: 6,
//     blockHash: '0x0e7502f9161977672216dcbfa4e02277c252d8579e068529bd404f4f9760dd8c',
//     from: '0x942f397b7f4391b43115395f469c63072aed6e41',
//     to: '0x60e69b73db38d52c70690a8efcee30383190cdfa',
//     cumulativeGasUsed: 35146,
//     gasUsed: 35146,
//     contractAddress: null,
//     logs: [
//         {
//             address: '0x60e69B73db38D52C70690a8EfCeE30383190CDFA',
//             blockHash: '0x0e7502f9161977672216dcbfa4e02277c252d8579e068529bd404f4f9760dd8c',
//             blockNumber: 6,
//             data: '0x00000000000000000000000000000000000000000000000000000000000003e8',
//             logIndex: 0,
//             removed: false,
//             topics: [Array],
//             transactionHash: '0x17f87f8daf972dd2b1060f076c264a8ee1484b7af9ef92b2fb7f4db3505696fd',
//             transactionIndex: 0,
//             id: 'log_f2dc04dc'
//         }
//     ],
//     logsBloom: '0x000000000040000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000080000000400000000000000000000000000000000000100040000000000000400
//     0000000000000000000000000000001000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000240000000000020000000000000000000000000000000000000000000
//     0000000000000000000000000000000000000000000000000000000000000000',
//     status: true,
//     effectiveGasPrice: 2951397806,
//     type: '0x2'
// }
