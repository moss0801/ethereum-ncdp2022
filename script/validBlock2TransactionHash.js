import RLP from 'rlp';
import Web3 from 'web3';


// Block2
// 0번(0x80) Transaction만 존재
// MerklePatriciaTree => [0x2080, rlp(tx0)]
// TransactionHash = hash(rlp(["0x2080", rlp(tx)]));
(async () => {
    const block2TransactionHash = "0x0f459ff05c5514df7d1d548747c471142bbcac848a3a00d412fddd3b291a9ffd";
    const leaf_path0 = "0x2080";
    const tx = [
        "0x1",
        "0x6fc23ac00",
        "0xf4240",
        "0x60e69b73db38d52c70690a8efcee30383190cdfa",
        "0x",
        "0xa9059cbb000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee3900000000000000000000000000000000000000000000000000000000000003e8",
        "0x24ce",
        "0x9ff91eee11bcf2951d984e9449236f151725f6367b5b12480d6ebaeee69c5b23",
        "0x7fd5715dc431cccabbd508cc849c875ced617749880ba8251325a38763fd814a"
    ];

    const txRlp = RLP.encode(tx);
    const rootNode = [leaf_path0, txRlp];
    const rootNodeRlp = RLP.encode(rootNode);

    const web = new Web3();
    const transactionHash = web.utils.sha3(rootNodeRlp);
    console.log(web.utils.sha3(rootNodeRlp));

    console.assert(block2TransactionHash === transactionHash,
        "ERROR: transactionHash is not equal. " + transactionHash)

    // Block3
    // 0번(0x80), 1번(0x1) 2개 트랜잭션 존재
    // MerklePatriciaTree
    // BrancheNode ["0x", "1번 leaf Hash", "0x", "0x", "0x", "0x", "0x", "0x", "0번 leaf Hash", "0x", "0x", "0x", "0x", "0x", "0x", "0x", "0x"]
    //             1번 Tx ["0x20", "rlp(tx1)"]                        0번 tx ["0x30", "rlp(tx0)]

    // TransactionHash = hash(rlp(root branchNode))

    const block3TransactionHash = "0x8fe0f4a6d58fa0860448ba06b486c33dd2ac885b2366926f1cc3e3ed7f36f14f";

    const leaf_path_8_0 = "0x30";
    const leaf_path_1 = "0x20";

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




})();




