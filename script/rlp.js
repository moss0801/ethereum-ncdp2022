// https://github.com/ethereumjs/ethereumjs-monorepo/tree/master/packages/rlp
// npm install rlp
import RLP from 'rlp';

function hex(uint8Array, prefix = true) {
    return (prefix ? '0x' : '') + Buffer.from(uint8Array).toString('hex');
}

console.log(hex(RLP.encode("a")));
// 0x61
console.log(hex(RLP.encode("abc")));
// 0x83616263
console.log(hex(RLP.encode("abcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghij")));
// 0xb83c6162636465666768696a6162636465666768696a6162636465666768696a6162636465666768696a6162636465666768696a6162636465666768696a
console.log(hex(RLP.encode(["a", "abc"])));
// 0xc56183616263
console.log(hex(RLP.encode(["a", "abc", "abcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghij"])));
// 0xf8436183616263b83c6162636465666768696a6162636465666768696a6162636465666768696a6162636465666768696a6162636465666768696a6162636465666768696a

// 서명전 트랜잭션
// ["0x","0x06fc23ac00","0x0f4240","0x911d6b77014fa58afd85be49e5148cbeaa3fee39","0x","0xa9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8","0x","0x","0x"]
console.log(hex(RLP.encode([
    // nonce: 0
    "0x",
    // gasPrice: 30,000,000,000 wei
    "0x06fc23ac00",
    // gasLimit: 1,000,000 gas
    "0x0f4240",
    // to: 0x911d6b77014fa58afd85be49e5148cbeaa3fee39
    "0x911d6b77014fa58afd85be49e5148cbeaa3fee39",
    // value: 0
    "0x",
    // ABIEncoding( transfer("0x911d6b77014fa58afd85be49e5148cbeaa3fee39",1000) )
    "0xa9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8",
    // v : 0 (서명전 고정값)
    "0x",
    // r : 0 (서명전 고정값)
    "0x",
    // s : 0 (서명전 고정값)
    "0x"
])));
// 0xf86a808506fc23ac00830f424094911d6b77014fa58afd85be49e5148cbeaa3fee3980b844a9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8808080

// 서명후 트랜잭션
// chainId:
// ["0x","0x06fc23ac00","0x0f4240","0x911d6b77014fa58afd85be49e5148cbeaa3fee39","0x","0xa9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8","0x24cd","0x7af4d4405862cd91b833db1e3da1fd80bb751c53affd07e148f5180f4926b56a","0x125f62784beff2462792fee879dca75ffd9da521c5d1d87944afebf93e7b47c1"]
console.log(hex(RLP.encode([
    "0x",
    "0x06fc23ac00",
    "0x0f4240",
    "0x911d6b77014fa58afd85be49e5148cbeaa3fee39",
    "0x",
    "0xa9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8",
    // v = chainId * 2 + 35 + ECDSA recId => chainId: 4693, recId: 0 => (4693 * 2) + 35 + 0 = 9421 = 0x24cd
    "0x24cd",
    // r : ECDSA 임시 공개키 x 좌표
    "0x7af4d4405862cd91b833db1e3da1fd80bb751c53affd07e148f5180f4926b56a",
    // s : ECDSA 서명값
    "0x125f62784beff2462792fee879dca75ffd9da521c5d1d87944afebf93e7b47c1"
])));
// 0xf8ac808506fc23ac00830f424094911d6b77014fa58afd85be49e5148cbeaa3fee3980b844a9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e88224cda07af4d4405862cd91b833db1e3da1fd80bb751c53affd07e148f5180f4926b56aa0125f62784beff2462792fee879dca75ffd9da521c5d1d87944afebf93e7b47c1