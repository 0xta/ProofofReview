// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TasteToken ($TASTE)
 * @notice Protocol utility & reward token for TasteChain BKK on Avalanche C-Chain.
 * @dev Supports authorized minting by owner/distributors and burnable functionality.
 */
contract TasteToken is ERC20, ERC20Burnable, Ownable {
    mapping(address => bool) public isMinter;

    event MinterUpdated(address indexed account, bool enabled);

    modifier onlyMinterOrOwner() {
        require(msg.sender == owner() || isMinter[msg.sender], "TasteToken: caller is not minter or owner");
        _;
    }

    constructor(address initialOwner) ERC20("TasteChain BKK Token", "TASTE") Ownable(initialOwner) {
        // Initial mint for hackathon liquidity / seed pool
        _mint(initialOwner, 1_000_000 * 10**decimals());
    }

    function setMinter(address account, bool enabled) external onlyOwner {
        require(account != address(0), "TasteToken: invalid address");
        isMinter[account] = enabled;
        emit MinterUpdated(account, enabled);
    }

    function mint(address to, uint256 amount) external onlyMinterOrOwner {
        _mint(to, amount);
    }
}
