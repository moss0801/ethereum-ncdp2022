import RLP from 'rlp';
import Web3 from 'web3';

const web3 = new Web3();

(async () => {
    const block2Hash = "0x0dcff4e9a3f2f738966b65f7b1bbf2d8c5daf04d329af0632d9eee25e8131716";

    // BlockHash = keccak-256(rlp( BLOCK_HEADER ))
    // BLOCK_HEADER = [parentHash, ommersHash, coinbase, stateRoot, transactionRoot, receiptRoot, logsBloom, difficulty,
    //      blockNumber, gasLimit, gasUsed, timestamp, extraData, mixHashOrPrevRandao, nonce(, baseFee)]
    const rawHeader = [
        "0x13c4e8a4c8432f0c4a67e32572fdb6ae55d4544803c566523f0b14a1b4a55ce2",
        "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
        "0x942f397b7f4391b43115395f469c63072aed6e41",
        "0xefd154dee7e8fe67364d4e468868e282930a9d83ba5212014b75e96ce10ea302",
        "0x0f459ff05c5514df7d1d548747c471142bbcac848a3a00d412fddd3b291a9ffd",
        "0x839a741b01f5774251c5150d7e2061acf05fac2a8fa63a0f7e55ec44ba5f111c",
        "0x00000000004000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000008000000040000000000000000000000000000000000010004000000000000040000000000000000000000000000000010000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002400000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        "0x020000",
        "0x02",
        "0x01c9c380",  // 30000000
        "0xcaba",  // 51898
        "0x626c47b8",
        "0xd883010a12846765746888676f312e31382e31856c696e7578",
        "0x941893dd052021d43a95fe338893a1fb7530ac357255814fe78188e41b5827eb",
        "0x423e1e5d20ede77c"
    ];
    // Storage Heahder: [ParentHash, UncleHash, Coinbase, StateRoot, TransactionRoot, ReceiptsRoot, LogsBloom,
    //    Difficulty, BlockNumber, GasLimit, GasUsed, Timestamp, ExtraData, MixHash, Nonce]

    const parentHash = rawHeader[0];
    const ommersHash = rawHeader[1];  // unclesHash
    const coinbase = rawHeader[2];  // beneficiary
    const stateRoot = rawHeader[3];
    const transactionRoot = rawHeader[4];
    const receiptRoot = rawHeader[5];
    const logsBloom = rawHeader[6];
    const difficulty = rawHeader[7];
    const blockNumber = rawHeader[8];
    const gasLimit = rawHeader[9];
    const gasUsed = rawHeader[10];
    const timestamp = rawHeader[11];
    const extraData = rawHeader[12];
    const mixHash = rawHeader[13];
    const nonce = rawHeader[14];

    const block = [parentHash, ommersHash, coinbase, stateRoot, transactionRoot, receiptRoot, logsBloom, difficulty,
        blockNumber, gasLimit, gasUsed,timestamp, extraData, mixHash, nonce];
    console.log(block);
    const blockRlp = RLP.encode(block);
    const blockHash = web3.utils.keccak256(blockRlp);

    console.assert(block2Hash === blockHash, `blockHash is not equal. ${block2Hash} ${blockHash}`);

    console.log(`blockHash : ${blockHash}`);
})();