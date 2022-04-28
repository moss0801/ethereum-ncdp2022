import Web3 from 'web3';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const tokenJson = require("./contract/Token.json");

(async () => {
    // Prepare
    const networkId = 5666;
    const chainId = 4693;
    const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
    const privateKey = '8d46f2260091f89d63a73a2171234835d272e0cab9fb630b4306aaf72f22e830';
    const to = '0x60e69B73db38D52C70690a8EfCeE30383190CDFA';
    const contract = new web3.eth.Contract(tokenJson, to);

    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    const nonce = await web3.eth.getTransactionCount(account.address);
    console.log(`nonce : ${nonce}`);
    const data = contract.methods.transfer('0x60e69B73db38D52C70690a8EfCeE30383190CDFA', 1000).encodeABI();
    console.log(`data : ${data}`);
    const estimateGas = await web3.eth.estimateGas({ from: account.address, to, data });
    console.log(`estimateGas : ${estimateGas}`);
    const signedTx = await account.signTransaction({
        from: account.address,
        to,
        value: 0,
        gas: estimateGas,
        nonce,
        data,
        common: {
            customChain: {
                networkId,
                chainId
            }
        }
    });
    console.log(signedTx);
    // web3.eth.accounts.signTransaction({
    //     from?: string | number;
    //     to?: string;
    //     value?: number | string | BN;
    //     gas?: number | string;
    //     gasPrice?: number | string | BN;
    //     maxPriorityFeePerGas?: number | string | BN;
    //     maxFeePerGas?: number | string | BN;
    //     data?: string;
    //     nonce?: number;
    //     chainId?: number;
    //     common?: Common;
    //     chain?: string;
    //     hardfork?: string;
    // }, privateKey);
    const result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    console.log(result);
})();