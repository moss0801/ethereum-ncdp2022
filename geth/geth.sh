$ geth \
  --datadir data \
  --networkid 5666 \
  --nodiscover \
  --ipcdisable \
  --http --http.port 7545 \
  --http.api personal,eth,net,web3 \
  --http.corsdomain '*' \
  console



# 컴파일
truffle compile
# 테스트
truffle test
# 배포
truffle migrate
