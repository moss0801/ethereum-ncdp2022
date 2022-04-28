import RLP from 'rlp';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import util from 'ethereumjs-util';
const secp256k1 = require("ethereum-cryptography/secp256k1");
import Web3 from 'web3';
const tokenJson = require("./contract/Token.json");

function hex(buffer, prefix = true) {
    return (prefix ? '0x' : '') + buffer.toString('hex');
}

// Token.sol bytecode -> truffle compile -> build/contracts/Token.json.bytecode
const bytecode = tokenJson.bytecode;

(async () => {
    console.log('=======================================')
    console.log('==== Deploy Token Contract(Type 0) ====')
    console.log('=======================================')

    // Prepare
    const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
    const chainId = await web3.eth.getChainId();  // 4693
    const privateKey = '8d46f2260091f89d63a73a2171234835d272e0cab9fb630b4306aaf72f22e830';
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);

    const estimateGas = await web3.eth.estimateGas({
        to: null,
        data: bytecode
    });
    console.log(`estimateGas: ${estimateGas}`);

    let nonce = await web3.eth.getTransactionCount(account.address);  // 0 부터 시작
    const gasPrice = "0x06fc23ac00"; // 30 * 10 ** 9 wei
    const gasLimit = estimateGas;
    const to = "0x";  // 0x0 (contract creation)
    const value = "0x";  // 0 wei
    const init = bytecode;
    let v = '0x' + chainId.toString(16);
    let r = '0x';  // 0
    let s = '0x';  // 0

    // Legacy Transaction (Type 0) without chainId(EIP-155)
    console.log('\n>> Prepare Sign')

    const txItems = [nonce, gasPrice, gasLimit, to, value, init, v, r, s];
    console.log(txItems);

    const txRlp = RLP.encode(txItems);
    console.log('txRlp: ' + hex(txRlp));

    const txHash = util.keccak256(txRlp);
    console.log('txHash: ' + hex(txHash));

    //// ECDSA sign 생성
    console.log('\n>> Sign(ECDSA)')

    // txHash, privateKey로 서명(signature) 생성
    // 임시 개인키는 txHash, privateKey에 의해서 결정 (rfc6979#section-3.2)
    // https://github.com/paulmillr/noble-secp256k1/blob/main/index.ts

    const [signature, recId] = secp256k1.signSync(txHash, privateKey, {recovered: true, der: false});
    // https://tools.ietf.org/id/draft-jivsov-ecc-compact-05.html
    // {02, 03, 04}, where 02 or 03 represent a compressed point (x only), while 04 represents a complete point (x,y)
    // 공개키 y값이 짝수 => recId = 0, 홀수 => recId = 1
    // recovery시 recId = 0 => 02, recId = 1 => 03
    v = new util.BN(chainId * 2 + 35 + recId);  // EIP-155 (chainId * 2 + 35 + signatureRParity)
    r = Buffer.from(signature.slice(0, 32))
    s = Buffer.from(signature.slice(32, 64))
    console.log('recId: ' + recId);
    console.log('v: ' + hex(v));
    console.log('r: ' + hex(r));
    console.log('s: ' + hex(s));

    //// Signed Tx with v,r,s
    console.log('>> Signed Transaction')
    const signedTxItems = [nonce, gasPrice, gasLimit, to, value, init, hex(v), hex(r), hex(s)];
    console.log('signedTxItems:' + signedTxItems);

    const signedTxRlp = RLP.encode(signedTxItems);
    console.log('signedTxRlp: \n' + hex(signedTxRlp));

    const signedTxHash = util.keccak256(signedTxRlp);
    console.log('signedTxHash : ' + hex(signedTxHash));

    //// Send Transaction
    console.log('\n>> Send Transaction')
    web3.eth.sendSignedTransaction(hex(signedTxRlp))
        .on('receipt', console.log);
})();

// receipt
// {
//     transactionHash: '0xc301189a38e565077eca8e5df02420b29e612407c9f503a4e9d25bceddc62160',
//     transactionIndex: 0,
//     blockNumber: 1,
//     blockHash: '0xbd72371bf2e099ed5aa312f6e63e7a9eb56d00ca8380e62a430de683ff36cd6b',
//     from: '0x942f397b7f4391b43115395f469c63072aed6e41',
//     to: null,
//     cumulativeGasUsed: 433263,
//     gasUsed: 433263,
//     contractAddress: '0x60e69B73db38D52C70690a8EfCeE30383190CDFA',
//     logs: [],
//     logsBloom: '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
//     0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
//     0000000000000000000000000000000000000000000000000000000000000000',
//     status: true,
//     effectiveGasPrice: 30000000000,
//     type: '0x0'
// }
