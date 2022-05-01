import RLP from 'rlp';
import Web3 from 'web3';

(async () => {
    const web3 = new Web3();

    // Block3
    // 0번(rlp(0) = 0x80), 1번(rlp(1) = 0x01) 2개 트랜잭션 존재
    // MerklePatriciaTree
    // BrancheNode ["1번 leaf Hash", "0x", "0x", "0x", "0x", "0x", "0x", "0x", "0번 leaf Hash", "0x", "0x", "0x", "0x", "0x", "0x", "0x", "0x"]
    //             1번 Tx ["0x31", "rlp(tx1)"]                        0번 tx ["0x30", "rlp(tx0)]
    // HP Encoding(0x1) = 0x31, HP Encoding(0x0) = 0x30

    // TransactionHash = hash(rlp(root branchNode))

    const block3TransactionHash = "0x8fe0f4a6d58fa0860448ba06b486c33dd2ac885b2366926f1cc3e3ed7f36f14f";

    const leaf_path_8_0 = "0x30";
    const tx0 = [
            "0x02",
            "0x06fc23ac00",
            "0x0f4240",
            "0x60e69b73db38d52c70690a8efcee30383190cdfa",
            "0x",
            "0xa9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8",
            "0x24ce",
            "0x61cc1567c14389143b141e5c62bb329ff930d2f3896260763c68295fee5eb15f",
            "0x5eaffc2b63f8e3c9b9783f28de4b6c5d151798479b9636ca25506ebe416cdd42"
        ];
    const tx0Rlp = RLP.encode(tx0);
    const tx0LeafRlp = RLP.encode([leaf_path_8_0, tx0Rlp]);
    const tx0LeafHash = web3.utils.keccak256(tx0LeafRlp);

    const leaf_path_0_1 = "0x31";
    const tx1 = [
        "0x03",
        "0x06fc23ac00",
        "0x0f4240",
        "0x60e69b73db38d52c70690a8efcee30383190cdfa",
        "0x",
        "0xa9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8",
        "0x24ce",
        "0x4f04ab51aeef264726e27a4e049080abc9dc8b4ed931ec7ee5a64ebdffa763d2",
        "0x191086693aae0271415913df25ae8abdd2445432c900028ee67b21f49cbcd719"
    ]
    const tx1Rlp = RLP.encode(tx1);
    const tx1LeafRlp = RLP.encode([leaf_path_0_1, tx1Rlp]);
    const tx1LeafHash = web3.utils.keccak256(tx1LeafRlp);

    const rootBranchRlp = RLP.encode([tx1LeafHash, "0x", "0x", "0x", "0x", "0x", "0x", "0x", tx0LeafHash, "0x", "0x", "0x", "0x", "0x", "0x", "0x", "0x"])
    const rootHash = web3.utils.keccak256(rootBranchRlp);

    console.assert(block3TransactionHash === rootHash,
        "ERROR: transactionHash is not equal. " + rootHash);
})();

