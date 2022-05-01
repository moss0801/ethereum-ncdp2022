// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

contract Counter {
  uint _count;

  function count() public view returns(uint) {
    return _count;
  }

  function up() public {
    _count++;
  }
}