# Contract

테스트를 [IERC20.sol](./contract/contracts/IERC20.sol), [Token.sol](./contract/contracts/Token.sol) contract 포함

Script 실행에 필요한 파일은 [./script/contract/Token.json](./script/contract/Token.json) 파일에 
abi와 bytecode만 복사하여 script에서 참조하므로 Contract를 Complile할 필요는 없습니다. 

## Truffle 설치
```
npm install -g truffle
```

## Contract Compile
```
cd contract
truffle compile
```

## Token ABI & bytecode

contract/build/contract/Token.json 에서 ABI 와 bytecode 확인 가능

# Script
이더리움 트랜잭션 분석 참조를 위한 코드

## ABI && RLP

* [abi.js](./script/abi.js) : ABI Encoding 참조
* [rlp.js](./script/rlp.js) : RLP Serialize 참조

## 트랜잭션

* [_00_deployContract.js](./script/_0_deployContract.js) : Token.sol 컨트랙트 배포
* [_1_txLegacy.js](./script/_1_txLegacy.js) : transfer() 호출 - Type 0 Legacy Transaction 이용
* [_2_txType1.js](./script/_2_txType1.js) : transfer() 호출 - Type 1[EIP-2930: Optional access lists] 이용
* [_3_txType2.js](./script/_3_txType2.js) : transfer() 호출 - Type 2[EIP-1559: Fee market change for ETH 1.0 chain] 이용
* [_4_web3ContractType0.js](./script/_4_web3ContractType0.js) : transfer() 호출 - Type0, web3&contract abi 를 이용한 호출
* [_5_web3ContractType2.js](./script/_5_web3ContractType2.js) : transfer() 호출 - Type2, web3&contract abi 를 이용한 호출

# 실행

## Ganache 설치

```
npm install -g ganache
```

### Windows 10
Python3, Visual Studio 설치 필요

* Python3 Download: https://www.python.org/downloads/
* Visual Studio Community : [Download Page](https://visualstudio.microsoft.com/ko/downloads/)
  * C++ 도구 설치 필요

## Ganache 실행

Ganache Startup Options : https://github.com/trufflesuite/ganache#startup-options

조정 옵션
* -i, --chain.networkId : 5666
* --chain.chainId : 4693
* -m, --wallet.mnemonic : "fire entire drive car hole credit stumble endless empty rice wash banner"
* -k, --chain.hardfork : "london" (default)
* --database.dbPath : "d:\ganache4693" (적절하게 수정합니다.)
* -g, --miner.defaultGasPrice : "0x6FC23AC00" (30 gwei)
* -p, --server.port, --port : 7545
```
ganache -i 5666 --chain.chainId 4693 -m "fire entire drive car hole credit stumble endless empty rice wash banner" -p 7545 -g "0x6FC23AC00" --database.dbPath "d:\ganache4693"  
```

## Contract 배포
```
cd script
npm install
node _00_deployContract.js
```

## transfer('0x911D6B77014FA58aFD85BE49e5148CBEAA3FeE39', 1000) 트랜잭션 실행

```
node _1_txLegacy.js
node _2_txType1.js
node _3_txType2.js
node _4_web3ContractType0.js
node _5_web3ContractType2.js
```

## leveldb 조회

```
node leveldb.js
```

# geth LevelDB 조회

## genesis.json

gasLimit 참고: https://etherscan.io/chart/gaslimit


[core/genesis.go](https://github.com/ethereum/go-ethereum/blob/master/core/genesis.go), 
[params/config.go](https://github.com/ethereum/go-ethereum/blob/master/params/config.go),
[params/protocol_params.go](https://github.com/ethereum/go-ethereum/blob/master/params/protocol_params.go)

* difficulty : protocol_params.GenesisDifficulty

```
{
  "config": {
    "chainId": 4693,
    "homesteadBlock": 0,
    "eip150Block": 0,
    "eip155Block": 0,
    "eip158Block": 0,
    "byzantiumBlock": 0,
    "constantinopleBlock": 0,
    "petersburgBlock": 0,
    "istanbulBlock": 0,
    "muirGlacierBlock": 0,
    "berlinBlock": 0,
    "londonBlock": 0,
    "arrowGlacierBlock": 0,
    "ethash": {}
  },
  "difficulty": "131072",
  "extraData": "",
  "gasLimit": "29970705",
  "alloc": {
    "942F397B7f4391B43115395F469c63072aEd6E41": { "balance": "1000000000000000000000" }
  }
}
```

## 초기화
```
geth init --datadir data genesis.json
```

## geth 실행
* networkId : 5666
* chainId: 4693
* port: 7545
```
geth --datadir data --networkid 5666 --nodiscover --ipcdisable --http --http.port 7545 --http.api personal,eth,net,web3 --http.corsdomain '*' console 
```

기본 명령어
```
eth.blockNumber
eth.mining
miner.setEtherbase("0x942F397B7f4391B43115395F469c63072aEd6E41")
eth.coinbase
miner.start(1)
miner.stop()

eth.getBlock(0)
eth.getTransaction()
eth.getTransactionReceipt()
```

##  시나리오
geth private network 에서 type1, type2로 호출 불가

1. geth 초기화
2. leveldb 조회 (Block 0)
3. Token contract 배포
4. mining block and stop
5. leveldb 조회 (Block 1)
6. type 0 transfer(_1_txLegancy.js) 호출
7. mining block and stop
8. leveldb 조회 (Block 2)
