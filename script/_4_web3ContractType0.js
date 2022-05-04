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
    const data = contract.methods.transfer('0x60e69B73db38D52C70690a8EfCeE30383190CDFA', 1000).encodeABI();
    console.log(`data : ${data}`);
    const gasPrice = 30000000000;
    const estimateGas = await web3.eth.estimateGas({ from: account.address, to, data });
    console.log(`estimateGas : ${estimateGas}`);
    const signedTx = await account.signTransaction({
        nonce,
        gasPrice,
        gas: estimateGas,  // gasLimit
        to,
        value: 0,
        data,
        common: {
            customChain: {
                networkId,
                chainId
            }
        }
    });
    console.log(signedTx);

    // Send Transaction
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log(receipt);
})();

// {
//     messageHash: '0x979cd154b1fe154ce72b51d122b571e0ae291464533c44c58a642733af88f300',
//     v: '0x24ce',
//     r: '0xb5b9424bf068f442127a525969c094fd0f27ce94d2a9b14c9448d7a2659af274',
//     s: '0x39321af643f4758709e16c6e8366413683da0e7651e41e7798242238aed1caa2',
//     rawTransaction: '0xf8ab048506fc23ac0082cc169460e69b73db38d52c70690a8efcee30383190cdfa80b844a9059cbb00000000000000000000000060e69b73db38d52c70690a8efcee30383190cdfa00000000000000000000000000000000000000000000000000000000000003e8822
//     4cea0b5b9424bf068f442127a525969c094fd0f27ce94d2a9b14c9448d7a2659af274a039321af643f4758709e16c6e8366413683da0e7651e41e7798242238aed1caa2',
//     transactionHash: '0xa0a06d7dfd696962114199f381529dbc4e6f211e777c06fed3e3867e9d2c2c5f'
// }
// {
//     transactionHash: '0xa0a06d7dfd696962114199f381529dbc4e6f211e777c06fed3e3867e9d2c2c5f',
//     transactionIndex: 0,
//     blockNumber: 5,
//     blockHash: '0x4dbb588f5bb6d316a4aa0abaa1747e7f0be6f8b104ab6aa6d859febd02062074',
//     from: '0x942f397b7f4391b43115395f469c63072aed6e41',
//     to: '0x60e69b73db38d52c70690a8efcee30383190cdfa',
//     cumulativeGasUsed: 52246,
//     gasUsed: 52246,
//     contractAddress: null,
//     logs: [
//         {
//             address: '0x60e69B73db38D52C70690a8EfCeE30383190CDFA',
//             blockHash: '0x4dbb588f5bb6d316a4aa0abaa1747e7f0be6f8b104ab6aa6d859febd02062074',
//             blockNumber: 5,
//             data: '0x00000000000000000000000000000000000000000000000000000000000003e8',
//             logIndex: 0,
//             removed: false,
//             topics: [Array],
//             transactionHash: '0xa0a06d7dfd696962114199f381529dbc4e6f211e777c06fed3e3867e9d2c2c5f',
//             transactionIndex: 0,
//             id: 'log_e3271146'
//         }
//     ],
//     logsBloom: '0x000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000004000000000000000000000000000000000100040000000000000400
//     0000000000000000000000000000001000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000240000000000000000000020000000000000000000000000000000000
//     0000000000000000000000000000000000000000000000000000000000000000',
//     status: true,
//     effectiveGasPrice: 30000000000,
//     type: '0x0'
// }
