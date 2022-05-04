import RLP from 'rlp';
import Web3 from 'web3';
import util from 'ethereumjs-util';

const web3 = new Web3();
const LOGS_BLOOM_SIZE = 256;
function addLogsBloom(logsBloom, input) {
    const normalizedInput = input.startsWith('0x') ? input.substring(2) : input;
    const hash = util.keccak256(Buffer.from(normalizedInput, 'hex'));

    // 첫번째 2바이트 3개 를 LogBloom에 추가
    for (let index of [0,2,4]) {
        // 2바이트 추출
        let twoBytes = hash.subarray(index, index + 2);

        // bit index 계산
        // 하위 11bits, twoBytes & 0x07ff (% 2048 와 동일)
        twoBytes[0] &= 7;
        const bitIndex = Number('0x' + twoBytes.toString('hex'));

        // bytes index of 256 [ bytes size - 1 - 내림(bitIndex / 8) ]
        const byteIndex = 256 - 1 - Math.floor(bitIndex / 8);
        const bitValue = 1 << (bitIndex % 8);

        // apply to logsBloom
        logsBloom[byteIndex] |= bitValue;
    }
}

(async () => {
    const block3ReceiptHash = "0x178ed646c2ec0a894de2c3c71409417a1badb6454bbbefb254dc3d538805280a";
    const block3LogsBloom = "0x00000000004000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000008000000040000000000000000000000000000000000010004000000000000040000000000000000000000000000000010000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002400000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

    // Block3
    // 0번(rlp(0) = 0x80), 1번(rlp(1) = 0x01) 2개 영수증 존재
    // MerklePatriciaTree
    // BrancheNode ["1번 leaf Hash", "0x", "0x", "0x", "0x", "0x", "0x", "0x", "0번 leaf Hash", "0x", "0x", "0x", "0x", "0x", "0x", "0x", "0x"]
    //             1번 Tx ["0x31", "rlp(receipt1)"]                        0번 tx ["0x30", "rlp(receipt0)]
    // HP Encoding(0x1) = 0x31, HP Encoding(0x0) = 0x30

    // Legacy Receipt Trie Format = [[stateRoot, cumulativeGasUsed, bloomFilter, LOGS]]
    // LOGS = [logger, TOPICS, data]
    // TOPICS = topic 목록(최대 4개), 예) [topic0, topic1]

    const rawReceipts = [
        [
            "0x01",
            "0x9022",
            [
                [
                    "0x60e69b73db38d52c70690a8efcee30383190cdfa",
                    [
                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                        "0x000000000000000000000000942f397b7f4391b43115395f469c63072aed6e41",
                        "0x000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee39"
                    ],
                    "0x00000000000000000000000000000000000000000000000000000000000003e8"
                ]
            ]
        ],
        [
            "0x01",
            "0x012044",
            [
                [
                    "0x60e69b73db38d52c70690a8efcee30383190cdfa",
                    [
                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                        "0x000000000000000000000000942f397b7f4391b43115395f469c63072aed6e41",
                        "0x000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee39"
                    ],
                    "0x00000000000000000000000000000000000000000000000000000000000003e8"
                ]
            ]
        ]
    ];

    // logBlooms 계산
    let logsBlooms = [];
    let receipts = [];
    for (const rawReceipt of rawReceipts) {
        let logBloom = Buffer.alloc(LOGS_BLOOM_SIZE);
        for (const log of rawReceipt[2]) {
            addLogsBloom(logBloom, log[0]);
            for (const topic of log[1]) {
                addLogsBloom(logBloom, topic);
            }
        }
        logsBlooms.push(logBloom);
        receipts.push([ rawReceipt[0], rawReceipt[1], '0x' + logBloom.toString('hex'), rawReceipt[2] ]);
    }

    const receipt0Rlp = RLP.encode(receipts[0]);
    const receipt0LeafRlp = RLP.encode( ["0x30", receipt0Rlp] );
    const receipt0LeafHash = web3.utils.keccak256(receipt0LeafRlp);

    const receipt1Rlp = RLP.encode(receipts[1]);
    const receipt1LeafRlp = RLP.encode(["0x31", receipt1Rlp]);
    const receipt1LeafHash = web3.utils.keccak256(receipt1LeafRlp);

    const rootBranchRlp = RLP.encode([receipt1LeafHash, "0x", "0x", "0x", "0x", "0x", "0x", "0x", receipt0LeafHash, "0x", "0x", "0x", "0x", "0x", "0x", "0x", "0x"])
    const receiptHash = web3.utils.keccak256(rootBranchRlp);

    console.assert(block3ReceiptHash === receiptHash, 'receiptHash is not equals');
    console.log(`receiptHash: ${receiptHash}`);

    // logsBloom
    let blockLogsBloom = Buffer.alloc(LOGS_BLOOM_SIZE);
    for (const logsBloom of logsBlooms) {
        for (let i = 0; i < LOGS_BLOOM_SIZE; i++) {
            blockLogsBloom[i] |= logsBloom[i];
        }
    }
    const logsBloom = '0x' + blockLogsBloom.toString('hex');
    console.assert(block3LogsBloom === logsBloom, 'logsBloom is not equals');
    console.log(`logsBloom: ${logsBloom}`);


})();