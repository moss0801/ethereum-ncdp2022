import Web3 from "web3";

(async () => {
    const web3 = new Web3();
    console.log(web3.utils.sha3("test"));

})();