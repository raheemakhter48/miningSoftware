// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MiningToken is ERC20, Ownable {
    uint256 public faucetAmount = 100 * 10**18;
    mapping(address => uint256) public lastClaimed;

    constructor() ERC20("MiningToken", "MINE") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10**18); // Mint 1,000,000 tokens to deployer
    }

    function faucet() external {
        require(block.timestamp - lastClaimed[msg.sender] > 1 hours, "Faucet: Wait 1 hour between claims");
        lastClaimed[msg.sender] = block.timestamp;
        _mint(msg.sender, faucetAmount);
    }

    function setFaucetAmount(uint256 amount) external onlyOwner {
        faucetAmount = amount;
    }
} 