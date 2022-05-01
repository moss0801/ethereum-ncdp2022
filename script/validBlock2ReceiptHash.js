// https://ethereum.github.io/execution-specs/autoapi/ethereum/frontier/bloom/index.html
// LogsBoolm 계산 , 대상: address, topic
import RLP from 'rlp';
import Web3 from 'web3';
import util from 'ethereumjs-util';

// node , TransactionReceipt.writeToForReceiptTrie
// Hash 계산 시, revertReason 은 제외
// Receipt 트랜잭션 Type별 Format
//  Legacy Tx  = [[stateRoot, cumulativeGasUsed, bloomFilter, LOGS]]
//  Typed  Tx  = 0x{type} || [stateRoot, cumulativeGasUsed, bloomFilter, LOGS]]
// Log.writeTo
// LOGS = [logger, TOPICS, data]
// TOPICS = topic 목록(최대 4개), 예) [topic0, topic1]

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
        const byteIndex = LOGS_BLOOM_SIZE - 1 - Math.floor(bitIndex / 8);
        const bitValue = 1 << (bitIndex % 8);
        console.log(`index: ${bitIndex}, byteIndex: ${byteIndex}, bitValue: ${bitIndex % 8}, ${bitValue}`)

        // apply to logsBloom
        logsBloom[byteIndex] |= bitValue;
    }
}

(async () => {
    const block2ReceiptHash = "0x839a741b01f5774251c5150d7e2061acf05fac2a8fa63a0f7e55ec44ba5f111c";
    const block2LogsBloom = "0x00000000004000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000008000000040000000000000000000000000000000000010004000000000000040000000000000000000000000000000010000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002400000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
    const receipts = [
        [
            "0x01",
            "0xcaba",  // 51898
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

    // Legacy = [[stateRoot, cumulativeGasUsed, bloomFilter, LOGS]]
    // LOGS = [logger, TOPICS, data]
    // TOPICS = topic 목록, 예) [topic0, topic1]
    const receipt = receipts[0];
    // https://eips.ethereum.org/EIPS/eip-658
    // For blocks where block.number >= BYZANTIUM_FORK_BLKNUM, the intermediate state root is replaced by a status code,
    // 0 indicating failure (due to any operation that can cause the transaction or top-level call to revert) and 1 indicating success.
    const stateRoot = receipt[0];
    const cumulativeGasUsed = receipt[1];
    const logs = receipt[2];

    let logsBloom = Buffer.alloc(LOGS_BLOOM_SIZE); // 2048 bits
    for (let log of logs) {
        const logger = log[0];
        const topics = log[1];
        addLogsBloom(logsBloom, logger);
        for (let topic of topics) {
            addLogsBloom(logsBloom, topic);
        }
    }
    console.assert(block2LogsBloom, logsBloom.toString('hex'), "Invalid logsBloom");
    console.log(`logsBloom: ${logsBloom.toString('hex')}`);

    const receipt0Value = [stateRoot, cumulativeGasUsed, '0x' + logsBloom.toString('hex'), logs];
    console.log(receipt0Value);
    const receipt0Rlp = RLP.encode(receipt0Value);
    console.log(receipt0Rlp.toString('hex'));
    const receipt0Node = ["0x2080", receipt0Rlp];
    const receipt0NodeRlp = RLP.encode(receipt0Node);

    const rootNodeRlp = receipt0NodeRlp;

    const receiptHash = '0x' + util.keccak256(rootNodeRlp).toString('hex');
    console.assert(block2ReceiptHash === receiptHash,
        'receiptHash not equals ' + block2ReceiptHash + ' ' + receiptHash)
    console.log(receiptHash);



})();

