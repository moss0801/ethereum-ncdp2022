// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;
import "./Add.sol";
import "./Sub.sol";

contract Calc {
    // a + b - c
    function calc(uint a, uint b, uint c) public pure returns(uint) {
        Add addContract = Add(address(0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8));
        uint sum = addContract.add(a, b);

        Sub subContract = Sub(address(0xd9145CCE52D386f254917e481eB44e9943F39138));
        return subContract.sub(sum, c);
    }
}