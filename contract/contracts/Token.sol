// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.13;
import "./IERC20.sol";

contract Token is IERC20 {
    mapping(address => uint256) private _balances;  // 주소별 잔액

    constructor() {  // 생성자
        _balances[msg.sender] = 10000;  // 컨트랙트 배포에게 10000 지급
    }

    function balanceOf(address account) public view returns (uint256)
    {  // 잔액 조회
        return _balances[account];
    }

    function transfer(address to, uint256 amount) public returns (bool) {  // 이체
        require(to != address(0), "ERC20: transfer to the zero address");
        address from = msg.sender;

        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        _balances[from] = fromBalance - amount;
        _balances[to] += amount;

        emit Transfer(from, to, amount);  // Transfer 이벤트(로그)
        return true;
    }
}