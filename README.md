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

* [_0_deployContract.js](./script/_0_deployContract.js) : Token.sol 컨트랙트 배포
* [_1_txLegacy.js](./script/_1_txLegacy.js) : transfer() 호출 - Type 0 Legacy Transaction 이용
* [_2_txType1.js](./script/_2_txType1.js) : transfer() 호출 - Type 1[EIP-2930: Optional access lists] 이용
* [_3_txType2.js](./script/_3_txType2.js) : transfer() 호출 - Type 2[EIP-1559: Fee market change for ETH 1.0 chain] 이용

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
* 
```
ganache -i 5666 --chain.chainId 4693 -m "fire entire drive car hole credit stumble endless empty rice wash banner" -p 7545 -g "0x6FC23AC00" --database.dbPath "d:\ganache4693"  
```