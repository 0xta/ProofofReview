// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MerchantEscrow
 * @notice AVAX bounty escrow contract allowing restaurant merchants to deposit rewards for verified diner visits.
 */
contract MerchantEscrow is Ownable, ReentrancyGuard {
    struct BountyCampaign {
        bytes32 placeHash;
        address payable merchant;
        uint256 totalBudget;
        uint256 remainingBudget;
        uint256 rewardPerVisit;
        uint256 minSpendThb;
        uint256 expirationTime;
        uint256 totalClaims;
        bool isActive;
    }

    uint256 public nextBountyId = 1;
    mapping(uint256 => BountyCampaign) public bounties;
    mapping(bytes32 => uint256[]) public placeBounties;
    mapping(address => bool) public isRelayer;

    // Events
    event BountyCreated(
        uint256 indexed bountyId,
        bytes32 indexed placeHash,
        address indexed merchant,
        uint256 totalBudget,
        uint256 rewardPerVisit,
        uint256 minSpendThb,
        uint256 expirationTime
    );
    event BountyClaimed(
        uint256 indexed bountyId,
        bytes32 indexed placeHash,
        address indexed diner,
        bytes32 reviewId,
        uint256 rewardAmount
    );
    event BountyRefunded(
        uint256 indexed bountyId,
        address indexed merchant,
        uint256 refundedAmount
    );
    event RelayerUpdated(address indexed relayer, bool enabled);

    modifier onlyRelayerOrOwner() {
        require(msg.sender == owner() || isRelayer[msg.sender], "MerchantEscrow: caller not authorized");
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {
        isRelayer[initialOwner] = true;
    }

    function setRelayer(address relayer, bool enabled) external onlyOwner {
        require(relayer != address(0), "MerchantEscrow: invalid address");
        isRelayer[relayer] = enabled;
        emit RelayerUpdated(relayer, enabled);
    }

    /**
     * @notice Merchants fund a new visit bounty escrow in Fuji AVAX.
     */
    function createBounty(
        bytes32 placeHash,
        uint256 rewardPerVisit,
        uint256 minSpendThb,
        uint256 durationSeconds
    ) external payable nonReentrant returns (uint256 bountyId) {
        require(msg.value > 0, "MerchantEscrow: deposit must be greater than zero");
        require(rewardPerVisit > 0, "MerchantEscrow: rewardPerVisit must be > 0");
        require(msg.value >= rewardPerVisit, "MerchantEscrow: deposit < rewardPerVisit");
        require(durationSeconds >= 3600, "MerchantEscrow: duration must be >= 1 hour");

        bountyId = nextBountyId++;
        uint256 expiration = block.timestamp + durationSeconds;

        bounties[bountyId] = BountyCampaign({
            placeHash: placeHash,
            merchant: payable(msg.sender),
            totalBudget: msg.value,
            remainingBudget: msg.value,
            rewardPerVisit: rewardPerVisit,
            minSpendThb: minSpendThb,
            expirationTime: expiration,
            totalClaims: 0,
            isActive: true
        });

        placeBounties[placeHash].push(bountyId);

        emit BountyCreated(
            bountyId,
            placeHash,
            msg.sender,
            msg.value,
            rewardPerVisit,
            minSpendThb,
            expiration
        );
    }

    /**
     * @notice Authorized relayer dispenses bounty reward to diner upon verified review.
     */
    function claimBounty(
        uint256 bountyId,
        address payable diner,
        bytes32 reviewId
    ) external onlyRelayerOrOwner nonReentrant {
        BountyCampaign storage bounty = bounties[bountyId];
        require(bounty.isActive, "MerchantEscrow: bounty not active");
        require(block.timestamp <= bounty.expirationTime, "MerchantEscrow: bounty expired");
        require(bounty.remainingBudget >= bounty.rewardPerVisit, "MerchantEscrow: insufficient budget");
        require(diner != address(0), "MerchantEscrow: invalid diner");

        uint256 payout = bounty.rewardPerVisit;
        bounty.remainingBudget -= payout;
        bounty.totalClaims += 1;

        if (bounty.remainingBudget < bounty.rewardPerVisit) {
            bounty.isActive = false;
        }

        (bool success, ) = diner.call{value: payout}("");
        require(success, "MerchantEscrow: AVAX transfer failed");

        emit BountyClaimed(bountyId, bounty.placeHash, diner, reviewId, payout);
    }

    /**
     * @notice Merchants can refund unspent escrow budget after expiration or cancellation.
     */
    function refundBounty(uint256 bountyId) external nonReentrant {
        BountyCampaign storage bounty = bounties[bountyId];
        require(msg.sender == bounty.merchant || msg.sender == owner(), "MerchantEscrow: not merchant or owner");
        require(bounty.remainingBudget > 0, "MerchantEscrow: no funds remaining");

        uint256 refundAmount = bounty.remainingBudget;
        bounty.remainingBudget = 0;
        bounty.isActive = false;

        (bool success, ) = bounty.merchant.call{value: refundAmount}("");
        require(success, "MerchantEscrow: refund failed");

        emit BountyRefunded(bountyId, bounty.merchant, refundAmount);
    }

    function getPlaceBounties(bytes32 placeHash) external view returns (uint256[] memory) {
        return placeBounties[placeHash];
    }
}
