import RLP from 'rlp';
import Web3 from 'web3';

// contact address 주소 생성
// CREATE : keccak256(rlp([sender, nonce]))[12:]

// 0. sender address & nonce
const sender = "0x942F397B7f4391B43115395F469c63072aEd6E41".toLowerCase();
const nonce = 0;
const length = sender.length - 2;

// 1. [sender, nonce] rlp 인코딩
const rlp = RLP.encode([sender, nonce]);
console.log(rlp)

// 2. keccak-256
const web3 = new Web3();
const hash = web3.utils.keccak256(rlp);
console.log(hash);

// 3. hash 결과의 뒤 160 bit
const address = hash.substring(hash.length - length);
console.log(address)

// 4. EIP-55 checkSum address
const checksumAddress = web3.utils.toChecksumAddress(address);
console.log(checksumAddress);  // 0x60e69B73db38D52C70690a8EfCeE30383190CDFA