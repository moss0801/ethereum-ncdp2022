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