// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ITasteMinter {
    function mint(address to, uint256 amount) external;
}

/**
 * @title DailyEpochRewards
 * @notice Daily 10,000 $TASTE mining emission contract on Avalanche C-Chain.
 * @dev Includes manualDistributeEpoch for Admin 1-click Hackathon PoC distribution.
 */
contract DailyEpochRewards is Ownable, ReentrancyGuard {
    ITasteMinter public tasteToken;
    uint256 public constant DAILY_EMISSION = 10_000 * 10**18; // 10,000 $TASTE

    mapping(uint256 => bool) public epochSettled;
    mapping(uint256 => uint256) public epochTotalDistributed;
    mapping(address => bool) public isDistributor;

    event EpochDistributed(
        uint256 indexed epochDate,
        uint256 totalAmount,
        uint256 recipientCount
    );
    event RewardClaimed(
        address indexed recipient,
        uint256 amount,
        bytes32 claimRef
    );
    event DistributorUpdated(address indexed distributor, bool enabled);
    event TasteTokenUpdated(address indexed newToken);

    modifier onlyDistributorOrOwner() {
        require(msg.sender == owner() || isDistributor[msg.sender], "DailyEpochRewards: not authorized");
        _;
    }

    constructor(address initialOwner, address _tasteToken) Ownable(initialOwner) {
        require(_tasteToken != address(0), "DailyEpochRewards: invalid token");
        tasteToken = ITasteMinter(_tasteToken);
        isDistributor[initialOwner] = true;
    }

    function setDistributor(address distributor, bool enabled) external onlyOwner {
        require(distributor != address(0), "DailyEpochRewards: invalid address");
        isDistributor[distributor] = enabled;
        emit DistributorUpdated(distributor, enabled);
    }

    function setTasteToken(address _tasteToken) external onlyOwner {
        require(_tasteToken != address(0), "DailyEpochRewards: invalid token");
        tasteToken = ITasteMinter(_tasteToken);
        emit TasteTokenUpdated(_tasteToken);
    }

    /**
     * @notice Admin 1-Click Manual Token Distribution for Hackathon PoC Demo.
     * @param epochDate YYYYMMDD representation of the epoch date (e.g., 20261016).
     * @param recipients Array of diner addresses who submitted verified reviews.
     * @param amounts Pro-rata $TASTE token amounts to distribute.
     */
    function manualDistributeEpoch(
        uint256 epochDate,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyDistributorOrOwner nonReentrant {
        require(!epochSettled[epochDate], "DailyEpochRewards: epoch already settled");
        require(recipients.length > 0, "DailyEpochRewards: empty recipients array");
        require(recipients.length == amounts.length, "DailyEpochRewards: array length mismatch");

        uint256 totalDistributed = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "DailyEpochRewards: zero address recipient");
            if (amounts[i] > 0) {
                tasteToken.mint(recipients[i], amounts[i]);
                totalDistributed += amounts[i];
            }
        }

        epochSettled[epochDate] = true;
        epochTotalDistributed[epochDate] = totalDistributed;

        emit EpochDistributed(epochDate, totalDistributed, recipients.length);
    }

    /**
     * @notice Asynchronous claim function when a diner claims DB accumulated rewards.
     * @param recipient Customer wallet address.
     * @param amount Accumulated $TASTE amount to mint.
     * @param claimRef Unique claim reference ID from the PostgreSQL database.
     */
    function distributeClaim(
        address recipient,
        uint256 amount,
        bytes32 claimRef
    ) external onlyDistributorOrOwner nonReentrant {
        require(recipient != address(0), "DailyEpochRewards: invalid recipient");
        require(amount > 0, "DailyEpochRewards: zero claim amount");

        tasteToken.mint(recipient, amount);

        emit RewardClaimed(recipient, amount, claimRef);
    }
}
