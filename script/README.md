
# 개발환경 구성

## 윈도우 10
Python3, Visual Studio Community 설치
https://www.python.org/downloads/
https://visualstudio.microsoft.com/ko/thank-you-downloading-visual-studio/?sku=BuildTools

## Ganache
https://github.com/trufflesuite/ganache

### 설치
```
npm install -g ganache
```

### 실행

주요 옵션
* --chain.chainId
* -i, --chain.networkId  
* -m, --wallet.mnemonic
* -k, --chain.hardfork
* --database.dbPath
* -g, --miner.defaultGasPrice

* -h, --server.host
* -p, --server.port, --port
```
ganache -i 5666 --chain.chainId 4693 -m "fire entire drive car hole credit stumble endless empty rice wash banner" -p 7545 -g "0x6FC23AC00" --database.dbPath "d:\ganache4693"  
```