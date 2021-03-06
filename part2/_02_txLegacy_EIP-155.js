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
    console.log('==== Type 0 Legacy with chainId(EIP-155) ====')
    console.log('=============================================')

    // Prepare
    const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
    const privateKey = '8d46f2260091f89d63a73a2171234835d272e0cab9fb630b4306aaf72f22e830';
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);

    //// 1.서명을 위한 트랜잭션 구성 및 RLP serialize 결과의 Hash값 생성
    const chainId = await web3.eth.getChainId();  // 4693
    const nonce = await web3.eth.getTransactionCount(account.address, 'pending');
    const gasPrice = "0x06fc23ac00"; // 30 * 10 ** 9 wei
    const gasLimit = "0x0f4240"; // 100,000 gas
    const to = "0x60e69B73db38D52C70690a8EfCeE30383190CDFA";
    const value = "0x";  // 0 wei
    // data: ABI Encoding of transfer('0x911D6B77014FA58aFD85BE49e5148CBEAA3FeE39', 1000)
    const data = "0xa9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8";
    let v = '0x' + chainId.toString(16);  // EIP-155: chainId를 포함하여 서명을 위한 Hash 생성
    let r = '0x';  // 0
    let s = '0x';  // 0

    // Legacy Transaction (Type 0) without chainId(EIP-155)
    console.log('\n>> Prepare Sign')
    const txItems = [nonce, gasPrice, gasLimit, to, value, data, v, r, s];
    console.log('txItems: ' + txItems);

    const txRlp = RLP.encode(txItems);
    console.log('txRlp: ' + hex(txRlp));

    const txHash = util.keccak256(txRlp);
    console.log('txHash: ' + hex(txHash));

    //// 2. Hash값과 개인키로 서명 값(recId, r, s) 생성 및 v 값 계산
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

    //// 3. 서명된 트랜잭션 구성 후 RLP serialize
    //// Signed Tx with v,r,s
    console.log('>> Signed Transaction')
    const signedTxItems = [nonce, gasPrice, gasLimit, to, value, data, hex(v), hex(r), hex(s)];
    console.log(signedTxItems);

    const signedTxRlp = RLP.encode(signedTxItems);
    console.log('signedTxRlp: \n' + hex(signedTxRlp));
    // 0xf8aa808506fc23ac00830f424094911d6b77014fa58afd85be49e5148cbeaa3fee3980b844a9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e81ba06c5822e28956ad42fa7900286b6789afbe65556712cc3617de12d645218eb62ea02a0f55c0c52cf33a669d6fa73f85cb5137de00625dedf246a2627b5b883251fe
    const signedTxHash = util.keccak256(signedTxRlp);
    console.log('signedTxHash : ' + hex(signedTxHash));
    // 0x55e81096cbda1b60a3ba12dc2e365f85b12dee8988fe62b488bf838642af805b

    //// Send Transaction
    console.log('\n>> Send Transaction')
    web3.eth.sendSignedTransaction(hex(signedTxRlp))
        .on('receipt', result => {
            console.log(result);
            // topics
            console.log('topics')
            console.log(result.logs[0].topics);
        });
})();

/*
=============================================
==== Type 0 Legacy with chainId(EIP-155) ====
=============================================

>> Prepare Sign
txItems: 1,0x06fc23ac00,0x0f4240,0x60e69B73db38D52C70690a8EfCeE30383190CDFA,0x,0xa9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8,0x1255,0x,0x
txRlp: 0xf86c018506fc23ac00830f42409460e69b73db38d52c70690a8efcee30383190cdfa80b844a9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e88212558080
txHash: 0xfa71861799bc7051548df846efe3502780197ea1e85c12cf1ae434f8a6b4c29e

>> Sign(ECDSA)
recId: 1
v: 0x24ce
r: 0x9ff91eee11bcf2951d984e9449236f151725f6367b5b12480d6ebaeee69c5b23
s: 0x7fd5715dc431cccabbd508cc849c875ced617749880ba8251325a38763fd814a
>> Signed Transaction
    [
         1,
        '0x06fc23ac00',
        '0x0f4240',
        '0x60e69B73db38D52C70690a8EfCeE30383190CDFA',
        '0x',
        '0xa9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8',
        '0x24ce',
        '0x9ff91eee11bcf2951d984e9449236f151725f6367b5b12480d6ebaeee69c5b23',
        '0x7fd5715dc431cccabbd508cc849c875ced617749880ba8251325a38763fd814a'
    ]
signedTxRlp: 0xf8ac018506fc23ac00830f42409460e69b73db38d52c70690a8efcee30383190cdfa80b844a9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e88224cea09ff91eee11bcf2951d984e9449236f151725f6367b5b12480d6ebaeee69c5b23a07fd5715dc431cccabbd508cc849c875ced617749880ba8251325a38763fd814a
signedTxHash : 0xaf1ad2f6b02595cfcf8fdbb78e69be2f15e762c915dcf708fdfe3d1f02c80848

>> Send Transaction
{
    blockHash: '0xb3ee2315e2e9e485585fbe32c14a4ddfeedfc7efb6146c985df9560428092720',
    blockNumber: 2,
    contractAddress: null,
    cumulativeGasUsed: 52246,
    effectiveGasPrice: 30000000000,
    from: '0x942f397b7f4391b43115395f469c63072aed6e41',
    gasUsed: 52246,
    logs: [
    {
        address: '0x60e69B73db38D52C70690a8EfCeE30383190CDFA',
        topics: [Array],
        data: '0x00000000000000000000000000000000000000000000000000000000000003e8',
        blockNumber: 2,
        transactionHash: '0xaf1ad2f6b02595cfcf8fdbb78e69be2f15e762c915dcf708fdfe3d1f02c80848',
        transactionIndex: 0,
        blockHash: '0xb3ee2315e2e9e485585fbe32c14a4ddfeedfc7efb6146c985df9560428092720',
        logIndex: 0,
        removed: false,
        id: 'log_cedd81ba'
    }
],
    logsBloom: '0x00000000004000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000008000000040000000000000000000000000000000000010004000000000000040000000000000000000000000000000010000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002400000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    status: true,
    to: '0x60e69b73db38d52c70690a8efcee30383190cdfa',
    transactionHash: '0xaf1ad2f6b02595cfcf8fdbb78e69be2f15e762c915dcf708fdfe3d1f02c80848',
    transactionIndex: 0,
    type: '0x0'
}
logs[0].topics
    [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x000000000000000000000000942f397b7f4391b43115395f469c63072aed6e41',
        '0x000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee39'
    ]
*/
