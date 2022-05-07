// npm install web3
import Web3 from 'web3';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const token = require('./contract/Token.json');

const web3 = new Web3();

// Function Selector
const functionSelector = web3.eth.abi.encodeFunctionSignature({
    name: 'transfer',
    type: 'function',
    inputs: [{
        type: 'address',
        name: 'to'
    },{
        type: 'uint256',
        name: 'value'
    }]
});
console.log('Function Selector : transfer(address,uint256)');
console.log(functionSelector);
const transferSelector = functionSelector;
// 0xa9059cbb

// Argument Encoding
const argumentEncoding = web3.eth.abi.encodeParameters(
    ['address', 'uint256'], ['0x911d6b77014fa58afd85be49e5148cbeaa3fee39', 1000]);
console.log('Argument Encoding : ("0x911d6b77014fa58afd85be49e5148cbeaa3fee39", 1000)');
console.log(argumentEncoding);
// 0x
// 000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee39
// 00000000000000000000000000000000000000000000000000000000000003e8

// ABI Encoding : transfer('0x911d6b77014fa58afd85be49e5148cbeaa3fee39', 1000)
const abiEncoding = web3.eth.abi.encodeFunctionCall({
    name: 'transfer',
    type: 'function',
    inputs: [{
        type: 'address',
        name: 'to'
    },{
        type: 'uint256',
        name: 'value'
    }]
}, ['0x911D6B77014FA58aFD85BE49e5148CBEAA3FeE39', 1000]);
console.log('ABI Encoding : transfer("0x911d6b77014fa58afd85be49e5148cbeaa3fee39", 1000)')
console.log(abiEncoding);

// 0xa9059cbb
// 000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee39
// 00000000000000000000000000000000000000000000000000000000000003e8

// ABI encoding /w Contract
const tokenContract = new web3.eth.Contract(token.abi);
const abiEncodingWithContract = tokenContract.methods.transfer("0x911D6B77014FA58aFD85BE49e5148CBEAA3FeE39", 1000).encodeABI();
console.log('ABI Encoding with contract : transfer("0x911d6b77014fa58afd85be49e5148cbeaa3fee39", 1000)')
console.log(abiEncodingWithContract);
// 0xa9059cbb
// 000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee39
// 00000000000000000000000000000000000000000000000000000000000003e8

//// Type Encoding
console.log('uint8, 255')
console.log(web3.eth.abi.encodeParameter('uint8', 255));
// 0x00000000000000000000000000000000000000000000000000000000000000ff
console.log('uint256, 255')
console.log(web3.eth.abi.encodeParameter('uint256', 255));
// 0x00000000000000000000000000000000000000000000000000000000000000ff
console.log('int256, 255')
console.log(web3.eth.abi.encodeParameter('int256', 255));
// 0x00000000000000000000000000000000000000000000000000000000000000ff
console.log('int256, -1')
console.log(web3.eth.abi.encodeParameter('int256', -1));
// 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
console.log('bool, false')
console.log(web3.eth.abi.encodeParameter('bool', false));
// 0x0000000000000000000000000000000000000000000000000000000000000000
console.log('bool, true')
console.log(web3.eth.abi.encodeParameter('bool', true));
// 0x0000000000000000000000000000000000000000000000000000000000000001
console.log('address, "0x911D6B77014FA58aFD85BE49e5148CBEAA3FeE39"')
console.log(web3.eth.abi.encodeParameter('address', "0x911D6B77014FA58aFD85BE49e5148CBEAA3FeE39"));
// 0x000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee39
console.log('bytes1, "0xab"')
console.log(web3.eth.abi.encodeParameter('bytes1', '0xab'));
// 0xab00000000000000000000000000000000000000000000000000000000000000
console.log('bytes32, "0xabcdef"')
console.log(web3.eth.abi.encodeParameter('bytes32', '0xabcdef'));
// 0xabcdef0000000000000000000000000000000000000000000000000000000000
console.log('uint[3], [1,2,3]')
console.log(web3.eth.abi.encodeParameter('uint[3]', [1,2,3]));
// 0x
// 0000000000000000000000000000000000000000000000000000000000000001
// 0000000000000000000000000000000000000000000000000000000000000002
// 0000000000000000000000000000000000000000000000000000000000000003
console.log('bytes, "0x616263"')
console.log(web3.eth.abi.encodeParameter('bytes', '0x616263'));
// 0x
// 0000000000000000000000000000000000000000000000000000000000000020
// 0000000000000000000000000000000000000000000000000000000000000003
// 6162630000000000000000000000000000000000000000000000000000000000
console.log('string, "abc"')
console.log(web3.eth.abi.encodeParameter('string', "abc"));
// 0x
// 0000000000000000000000000000000000000000000000000000000000000020
// 0000000000000000000000000000000000000000000000000000000000000003
// 6162630000000000000000000000000000000000000000000000000000000000
console.log('bytes, convert "abc" to bytes')
console.log(web3.eth.abi.encodeParameter('bytes', Buffer.from('abc', 'utf-8')));
// 0x
// 0000000000000000000000000000000000000000000000000000000000000020
// 0000000000000000000000000000000000000000000000000000000000000003
// 6162630000000000000000000000000000000000000000000000000000000000
console.log('uint256[], [1,2,3]')
console.log(web3.eth.abi.encodeParameter('uint256[]', [1,2,3]));
// 0x
// 0000000000000000000000000000000000000000000000000000000000000020
// 0000000000000000000000000000000000000000000000000000000000000003
// 0000000000000000000000000000000000000000000000000000000000000001
// 0000000000000000000000000000000000000000000000000000000000000002
// 0000000000000000000000000000000000000000000000000000000000000003


// Example 1
console.log('Example 1 : baz(uint32,bool) => baz(69,true)')
console.log(web3.eth.abi.encodeParameters(['uint32','bool'], [69, true]));
// 0x
// 0000000000000000000000000000000000000000000000000000000000000045
// 0000000000000000000000000000000000000000000000000000000000000001

// Example 2
console.log('Example 2 : bar(bytes3[2]) => bar(["abc", "def"])')
console.log(web3.eth.abi.encodeParameters(['bytes3[2]'], [["0x616263", "0x646566"]]));
// 0x
// 6162630000000000000000000000000000000000000000000000000000000000
// 6465660000000000000000000000000000000000000000000000000000000000

// Example 3
console.log('Example 3 : sam(string, bool, uint[]) => sam("dave", true, [1,2,3])')
console.log(web3.eth.abi.encodeParameters(['string','bool','uint[]'], ["dave", true, [1,2,3]]));
// 0x
// 0000000000000000000000000000000000000000000000000000000000000060
// 0000000000000000000000000000000000000000000000000000000000000001
// 00000000000000000000000000000000000000000000000000000000000000a0
// 0000000000000000000000000000000000000000000000000000000000000004
// 6461766500000000000000000000000000000000000000000000000000000000
// 0000000000000000000000000000000000000000000000000000000000000003
// 0000000000000000000000000000000000000000000000000000000000000001
// 0000000000000000000000000000000000000000000000000000000000000002
// 0000000000000000000000000000000000000000000000000000000000000003

// Example 4
console.log('Example 4 : transfer(address, uint256) => transfer("0x911d6b77014fa58afd85be49e5148cbeaa3fee39", 1000)');
console.log(web3.eth.abi.encodeParameters(['address','uint256'], ["0x911d6b77014fa58afd85be49e5148cbeaa3fee39", 1000]));
// 0x
// 000000000000000000000000911d6b77014fa58afd85be49e5148cbeaa3fee39
// 00000000000000000000000000000000000000000000000000000000000003e8

// Example 5
console.log('Example 5 : transfer(address, uint256) => transfer("0xCCFABb539c00b027C4aDa322D6BAcb6A1DAf99f0", 2000)');
console.log(web3.eth.abi.encodeParameters(['address','uint256'], ["0xCCFABb539c00b027C4aDa322D6BAcb6A1DAf99f0", 2000]));

// Example 6
console.log('Example 6 : transfer(address, uint256) => transfer("0x06B90a7D72E2988ba2711d22e91eb324686104A1", 3000)');
console.log(web3.eth.abi.encodeParameters(['address','uint256'], ["0x06B90a7D72E2988ba2711d22e91eb324686104A1", 3000]));

// Example 7
console.log('Example 7 : transfer(address, uint256) => transfer("0x9eC7ECE7CD21fcCAb59c3B0bB1FF2b4103091cC2", 4000)');
console.log(web3.eth.abi.encodeParameters(['address','uint256'], ["0x9eC7ECE7CD21fcCAb59c3B0bB1FF2b4103091cC2", 4000]));