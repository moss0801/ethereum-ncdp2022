import util from 'ethereumjs-util';

(async () => {
  function bitcoinHash(input) {
    return util.sha256(util.sha256(input));
  }

  const tx0 = Buffer.from("Tx0 A ➡ B 100 BTC", "utf-8");
  const tx1 = Buffer.from("Tx1 B ➡ C 200 BTC", "utf-8");
  const tx2 = Buffer.from("Tx2 A ➡ C 100 BTC", "utf-8");
  const tx3 = Buffer.from("Tx3 C ➡ D 500 BTC", "utf-8");

  // hash
  const hash_0 = bitcoinHash(tx0);
  const hash_1 = bitcoinHash(tx1);
  const hash_2 = bitcoinHash(tx2);
  const hash_3 = bitcoinHash(tx3);

  const hash_4 = bitcoinHash(Buffer.concat([hash_0, hash_1]));
  const hash_5 = bitcoinHash(Buffer.concat([hash_2, hash_3]));

  const merkleRoot = bitcoinHash(Buffer.concat([hash_4, hash_5]));

  console.log(`tx0 : ${tx0}`);
  console.log(`tx1 : ${tx1}`);
  console.log(`tx2 : ${tx2}`);
  console.log(`tx3 : ${tx3}`);
  console.log(`hash 0: ${hash_0.toString('hex')}`);
  console.log(`hash 1: ${hash_1.toString('hex')}`);
  console.log(`hash 2: ${hash_2.toString('hex')}`);
  console.log(`hash 3: ${hash_3.toString('hex')}`);
  console.log(`hash 4: ${hash_4.toString('hex')}`);
  console.log(`hash 5: ${hash_5.toString('hex')}`);
  console.log(`hash merkleRoot: ${merkleRoot.toString('hex')}`);
})();


(async () => {
  function bitcoinHash(input) {
    return util.sha256(util.sha256(input));
  }

  const tx0 = Buffer.from("Tx0 A ➡ B 100 BTC", "utf-8");
  const tx1 = Buffer.from("Tx1 B ➡ H 200 BTC", "utf-8");
  const tx2 = Buffer.from("Tx2 A ➡ C 100 BTC", "utf-8");
  const tx3 = Buffer.from("Tx3 C ➡ D 500 BTC", "utf-8");

  // hash
  const hash_0 = bitcoinHash(tx0);
  const hash_1 = bitcoinHash(tx1);
  const hash_2 = bitcoinHash(tx2);
  const hash_3 = bitcoinHash(tx3);

  const hash_4 = bitcoinHash(Buffer.concat([hash_0, hash_1]));
  const hash_5 = bitcoinHash(Buffer.concat([hash_2, hash_3]));

  const merkleRoot = bitcoinHash(Buffer.concat([hash_4, hash_5]));

  console.log(`tx0 : ${tx0}`);
  console.log(`tx1 : ${tx1}`);
  console.log(`tx2 : ${tx2}`);
  console.log(`tx3 : ${tx3}`);
  console.log(`hash 0: ${hash_0.toString('hex')}`);
  console.log(`hash 1: ${hash_1.toString('hex')}`);
  console.log(`hash 2: ${hash_2.toString('hex')}`);
  console.log(`hash 3: ${hash_3.toString('hex')}`);
  console.log(`hash 4: ${hash_4.toString('hex')}`);
  console.log(`hash 5: ${hash_5.toString('hex')}`);
  console.log(`hash merkleRoot: ${merkleRoot.toString('hex')}`);
})();
