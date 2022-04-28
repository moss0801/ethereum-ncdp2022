import Web3 from 'web3';

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

(async () => {
    const bytecode = "0x608060405234801561001057600080fd5b506127106000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555061067c806100656000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806370a082311461003b578063a9059cbb1461006b575b600080fd5b61005560048036038101906100509190610355565b61009b565b604051610062919061039b565b60405180910390f35b610085600480360381019061008091906103e2565b6100e3565b604051610092919061043d565b60405180910390f35b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b60008073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603610153576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161014a906104db565b60405180910390fd5b600033905060008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050838110156101de576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101d59061056d565b60405180910390fd5b83816101ea91906105bc565b6000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550836000808773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461027a91906105f0565b925050819055508473ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef866040516102de919061039b565b60405180910390a360019250505092915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610322826102f7565b9050919050565b61033281610317565b811461033d57600080fd5b50565b60008135905061034f81610329565b92915050565b60006020828403121561036b5761036a6102f2565b5b600061037984828501610340565b91505092915050565b6000819050919050565b61039581610382565b82525050565b60006020820190506103b0600083018461038c565b92915050565b6103bf81610382565b81146103ca57600080fd5b50565b6000813590506103dc816103b6565b92915050565b600080604083850312156103f9576103f86102f2565b5b600061040785828601610340565b9250506020610418858286016103cd565b9150509250929050565b60008115159050919050565b61043781610422565b82525050565b6000602082019050610452600083018461042e565b92915050565b600082825260208201905092915050565b7f45524332303a207472616e7366657220746f20746865207a65726f206164647260008201527f6573730000000000000000000000000000000000000000000000000000000000602082015250565b60006104c5602383610458565b91506104d082610469565b604082019050919050565b600060208201905081810360008301526104f4816104b8565b9050919050565b7f45524332303a207472616e7366657220616d6f756e742065786365656473206260008201527f616c616e63650000000000000000000000000000000000000000000000000000602082015250565b6000610557602683610458565b9150610562826104fb565b604082019050919050565b600060208201905081810360008301526105868161054a565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006105c782610382565b91506105d283610382565b9250828210156105e5576105e461058d565b5b828203905092915050565b60006105fb82610382565b915061060683610382565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0382111561063b5761063a61058d565b5b82820190509291505056fea2646970667358221220a1d5cf32f5a4750bfedb554f14e17971a4b56b2272dd29d702bc4a408c0c930064736f6c634300080d0033";
    const result = await web3.eth.estimateGas({
        to: null,
        data: bytecode
    });

    console.log(result);
})();
