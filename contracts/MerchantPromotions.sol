// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ITasteToken {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function burn(uint256 amount) external;
}

/**
 * @title MerchantPromotions
 * @notice Voucher redemption engine with Tokenomist 80/20 deflationary burn model.
 * @dev 80% of $TASTE voucher cost is burned, 20% sent to the merchant.
 */
contract MerchantPromotions is Ownable, ReentrancyGuard {
    struct Promotion {
        bytes32 placeHash;
        address merchant;
        uint256 costInTaste;
        uint16 discountPercent; // e.g. 15 for 15%
        uint256 maxRedemptions;
        uint256 totalRedeemed;
        bool isActive;
    }

    ITasteToken public tasteToken;
    uint256 public nextPromoId = 1;

    mapping(uint256 => Promotion) public promotions;
    mapping(bytes32 => uint256[]) public placePromotions;

    event PromotionCreated(
        uint256 indexed promoId,
        bytes32 indexed placeHash,
        address indexed merchant,
        uint256 costInTaste,
        uint16 discountPercent,
        uint256 maxRedemptions
    );
    event PromotionRedeemed(
        uint256 indexed promoId,
        bytes32 indexed placeHash,
        address indexed diner,
        address merchant,
        uint256 totalCost,
        uint256 burnedAmount,
        uint256 merchantPayout,
        bytes32 redemptionCode
    );
    event TasteTokenUpdated(address indexed newToken);

    constructor(address initialOwner, address _tasteToken) Ownable(initialOwner) {
        require(_tasteToken != address(0), "MerchantPromotions: invalid token");
        tasteToken = ITasteToken(_tasteToken);
    }

    function setTasteToken(address _tasteToken) external onlyOwner {
        require(_tasteToken != address(0), "MerchantPromotions: invalid token");
        tasteToken = ITasteToken(_tasteToken);
        emit TasteTokenUpdated(_tasteToken);
    }

    /**
     * @notice Merchant creates a new promotion voucher accepting $TASTE.
     */
    function createPromotion(
        bytes32 placeHash,
        uint256 costInTaste,
        uint16 discountPercent,
        uint256 maxRedemptions
    ) external returns (uint256 promoId) {
        require(costInTaste > 0, "MerchantPromotions: cost must be > 0");
        require(maxRedemptions > 0, "MerchantPromotions: max redemptions must be > 0");

        promoId = nextPromoId++;

        promotions[promoId] = Promotion({
            placeHash: placeHash,
            merchant: msg.sender,
            costInTaste: costInTaste,
            discountPercent: discountPercent,
            maxRedemptions: maxRedemptions,
            totalRedeemed: 0,
            isActive: true
        });

        placePromotions[placeHash].push(promoId);

        emit PromotionCreated(
            promoId,
            placeHash,
            msg.sender,
            costInTaste,
            discountPercent,
            maxRedemptions
        );
    }

    /**
     * @notice Diner redeems promotion with $TASTE tokens (80% burn, 20% to merchant).
     */
    function redeemPromotion(uint256 promoId) external nonReentrant returns (bytes32 redemptionCode) {
        Promotion storage promo = promotions[promoId];
        require(promo.isActive, "MerchantPromotions: promo not active");
        require(promo.totalRedeemed < promo.maxRedemptions, "MerchantPromotions: promo sold out");

        promo.totalRedeemed += 1;
        if (promo.totalRedeemed >= promo.maxRedemptions) {
            promo.isActive = false;
        }

        uint256 totalCost = promo.costInTaste;
        // 80/20 Burn architecture
        uint256 burnAmount = (totalCost * 80) / 100;
        uint256 merchantPayout = totalCost - burnAmount;

        // Pull tokens from diner into this contract
        require(
            tasteToken.transferFrom(msg.sender, address(this), totalCost),
            "MerchantPromotions: token transfer failed"
        );

        // Burn 80%
        tasteToken.burn(burnAmount);

        // Transfer 20% to merchant
        require(
            tasteToken.transfer(promo.merchant, merchantPayout),
            "MerchantPromotions: merchant payout failed"
        );

        // Generate cryptographic redemption receipt
        redemptionCode = keccak256(
            abi.encodePacked(promoId, msg.sender, block.timestamp, promo.totalRedeemed)
        );

        emit PromotionRedeemed(
            promoId,
            promo.placeHash,
            msg.sender,
            promo.merchant,
            totalCost,
            burnAmount,
            merchantPayout,
            redemptionCode
        );

        return redemptionCode;
    }

    function getPlacePromotions(bytes32 placeHash) external view returns (uint256[] memory) {
        return placePromotions[placeHash];
    }
}
