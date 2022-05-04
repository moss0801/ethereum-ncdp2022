import RLP from 'rlp';
import util from 'ethereumjs-util';

function hex(input) {
  return input.toString('hex');
}


(async () => {
  //==== Leaf Node 1
  // ["0x3a", "0x03"]
  const leaf1Node = [Buffer.from("3a", "hex"), Buffer.from("03", "hex")];
  // "0xc23a03"
  const leaf1Value = Buffer.from(RLP.encode(leaf1Node));
  // "0x9ad2b2688efb6abe61e1d4af3464eac90dd5cb1ea4114cfc29a85a2c6b848038"
  const leaf1Key = util.keccak256(leaf1Value);

  console.log("Leaf 1");
  console.log(leaf1Node);
  console.log(`Leaf 1 Value : ${hex(leaf1Value)}`);
  console.log(`Leaf 1 Key : ${hex(leaf1Key)}`);

  //==== Leaf Node 2
  // ["0x20ab", "0x04"]
  const leaf2Node = [Buffer.from("20ab", "hex"), Buffer.from("04", "hex")];
  // "0xc48220ab04"
  const leaf2Value = Buffer.from(RLP.encode(leaf2Node));
  // "0x1ced0505978bc31e134f58ef3e8a15bf089f031921ddb3a3533c6f97e2572fc5"
  const leaf2Key = util.keccak256(leaf2Value);

  console.log("Leaf 2");
  console.log(leaf2Node);
  console.log(`Leaf 2 Value : ${hex(leaf2Value)}`);
  console.log(`Leaf 2 Key : ${hex(leaf2Key)}`);

  //==== Leaf Node 3
  // ["0x20", "0x05"]
  const leaf3Node = [Buffer.from("20", "hex"), Buffer.from("05", "hex")];
  // "0xc22005"
  const leaf3Value = Buffer.from(RLP.encode(leaf3Node));
  // "0xd21b3a1ada9987e50e2b4dc805be4bea8ce445e56f20ff1536188edb1ef28bc0"
  const leaf3Key = util.keccak256(leaf3Value);

  console.log("Leaf 3");
  console.log(leaf3Node);
  console.log(`Leaf 3 Value : ${hex(leaf3Value)}`);
  console.log(`Leaf 3 Key : ${hex(leaf3Key)}`);

  //==== Branch Node
  // [ 0x, leaf1Key, 0x, 0x, 0x, 0x, leaf2Key, 0x, 0x, 0x, 0x, 0x, leaf3Key, 0x, 0x, 0x, 0x02]
  // [ 0x,  0x9a…38, 0x, 0x, 0x, 0x,  0x1c…c5, 0x, 0x, 0x, 0x, 0x,  0xd2…c0, 0x, 0x, 0x, 0x02]
  const empty = Buffer.from([]);
  const branchNode = [empty, leaf1Key, empty, empty, empty, empty, leaf2Key, empty, empty, empty,
    empty, empty, leaf3Key, empty, empty, empty, Buffer.from("02", "hex")];
  const branchNodeValue = Buffer.from(RLP.encode(branchNode));
  const branchNodeKey = util.keccak256(branchNodeValue);

  console.log("Branch");
  console.log(branchNode);
  console.log(`Branch Value : ${hex(branchNodeValue)}`);
  console.log(`Branch Key : ${hex(branchNodeKey)}`);

  //==== Extension
  // [ 0x1123, 0x9e21a34e4349dcd5eccddd1f99eb07ceb3ab97ce15789baee9eec7b14a9c32a5 ]
  const extensionNode = [
    Buffer.from("1123", "hex"),
    Buffer.from("9e21a34e4349dcd5eccddd1f99eb07ceb3ab97ce15789baee9eec7b14a9c32a5","hex") ];
  const extensionValue = Buffer.from(RLP.encode(extensionNode));
  const extensionKey = util.keccak256(extensionValue);

  console.log("Extension");
  console.log(extensionNode);
  console.log(`Branch Value : ${hex(extensionValue)}`);
  console.log(`Branch Key : ${hex(extensionKey)}`);

  const merkleRoot = extensionKey;

  console.log(`Merkle Root : ${hex(merkleRoot)}`);




})();
