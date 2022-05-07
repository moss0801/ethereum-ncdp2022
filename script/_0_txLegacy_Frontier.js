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
    console.log('================================================')
    console.log('==== Type 0 Legacy without chainId(EIP-155) ====')
    console.log('================================================')

    // Prepare
    const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
    const privateKey = '8d46f2260091f89d63a73a2171234835d272e0cab9fb630b4306aaf72f22e830';
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    console.log(`address: ${account.address}`);

    //// 1.서명을 위한 트랜잭션 구성 및 RLP serialize 결과의 Hash값 생성
    const nonce = 0; //await web3.eth.getTransactionCount(account.address, 'pending');
    const gasPrice = "0x06fc23ac00"; // 30 * 10 ** 9 wei
    const gasLimit = "0x0f4240"; // 100,000 gas
    const to = "0x60e69B73db38D52C70690a8EfCeE30383190CDFA";
    const value = "0x";  // 0 wei
    // data: ABI Encoding of transfer('0x911D6B77014FA58aFD85BE49e5148CBEAA3FeE39', 1000)
    const data = "0xa9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8";
    let v = '0x';  // 0
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
    v = new util.BN(27 + recId);  // 27 + signatureRParity
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

    const signedTxHash = util.keccak256(signedTxRlp);
    console.log('signedTxHash : ' + hex(signedTxHash));

    //// Send Transaction
    // Error: Returned error: only replay-protected (EIP-155) transactions allowed over RPC
    console.log('\n>> Send Transaction')
    web3.eth.sendSignedTransaction(hex(signedTxRlp))
        .on('receipt', console.log);
})();

// =============================================
// ==== Type 0 Legacy without chainId(EIP-155) ====
//     =============================================
// address: 0x942F397B7f4391B43115395F469c63072aEd6E41
//
// >> Prepare Sign
// txItems: 0,0x06fc23ac00,0x0f4240,0x60e69B73db38D52C70690a8EfCeE30383190CDFA,0x,0xa9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8,0x,0x,0x
// txRlp: 0xf86a808506fc23ac00830f42409460e69b73db38d52c70690a8efcee30383190cdfa80b844a9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8808080
// txHash: 0xd01f4a8b9c55dcd791ea2dd45c406ab666bf03e134808ae4647f56d0004b6cfd
//
// >> Sign(ECDSA)
// recId: 0
// v: 0x1b
// r: 0xc24c83783278bd57896258b9f7160525c893a202f9144f7be95f65a793f06303
// s: 0x6d2e45144bfc272eb22847bb52a38e3d67497325ef160af4f461de4fad8a2385
// >> Signed Transaction
//     [
//     0,
//         '0x06fc23ac00',
//         '0x0f4240',
//         '0x60e69B73db38D52C70690a8EfCeE30383190CDFA',
//         '0x',
//         '0xa9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8',
//         '0x1b',
//         '0xc24c83783278bd57896258b9f7160525c893a202f9144f7be95f65a793f06303',
//         '0x6d2e45144bfc272eb22847bb52a38e3d67497325ef160af4f461de4fad8a2385'
//     ]
// signedTxRlp:
//     0xf8aa808506fc23ac00830f42409460e69b73db38d52c70690a8efcee30383190cdfa80b844a9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e81ba0c24c83783278bd57896258b9f7160525c893a202f9144f7be95f65a793f06303a06d2e45144bfc272eb22847bb52a38e3d67497325ef160af4f461de4fad8a2385
// signedTxHash : 0xd774c2983648463b651f69ec7042d88547f75e3103c1127ff6ac1e4814dbd1f2

// Error: Returned error: only replay-protected (EIP-155) transactions allowed over RPC