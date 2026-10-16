// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProofOfReview
 * @notice On-chain registry for verified gastronomy reviews on Avalanche C-Chain.
 * @dev Enforces 2-Option verification (Receipt Slip OCR & Dynamic Shop QR), Pioneer 2x status, and anti-replay.
 */
contract ProofOfReview is Ownable {
    struct ReviewRecord {
        bytes32 placeHash;
        address reviewer;
        uint8 rating;          // 1 to 5
        uint8 verificationTier; // 1 = Receipt Slip OCR, 2 = In-Store Shop QR
        uint256 timestamp;
        bool isPioneer;
        uint8 pioneerSlot;     // 1, 2, 3 or 0 if not pioneer
        bytes32 slipRefHash;   // SHA-256 hash of receipt slip reference
    }

    // Storage
    mapping(bytes32 => ReviewRecord) public reviews;
    mapping(bytes32 => uint8) public placeReviewCount;
    mapping(bytes32 => bool) public usedSlipHashes;
    mapping(address => bool) public isRecorder;

    // Events
    event ReviewRecorded(
        bytes32 indexed reviewId,
        bytes32 indexed placeHash,
        address indexed reviewer,
        uint8 rating,
        uint8 verificationTier,
        bool isPioneer,
        uint8 pioneerSlot,
        uint256 timestamp
    );
    event RecorderUpdated(address indexed recorder, bool enabled);

    modifier onlyRecorderOrOwner() {
        require(msg.sender == owner() || isRecorder[msg.sender], "ProofOfReview: caller not authorized");
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {
        isRecorder[initialOwner] = true;
    }

    function setRecorder(address recorder, bool enabled) external onlyOwner {
        require(recorder != address(0), "ProofOfReview: invalid address");
        isRecorder[recorder] = enabled;
        emit RecorderUpdated(recorder, enabled);
    }

    /**
     * @notice Records a verified review on Avalanche C-Chain.
     * @param placeHash Keccak256 hash of the unique venue place_id.
     * @param reviewer Wallet address of the diner submitting the review.
     * @param rating Star rating from 1 to 5.
     * @param verificationTier 1 for Receipt Slip OCR, 2 for Shop QR check-in.
     * @param slipRefHash SHA-256 hash of receipt slip (or bytes32(0) if Option 2).
     */
    function recordReview(
        bytes32 placeHash,
        address reviewer,
        uint8 rating,
        uint8 verificationTier,
        bytes32 slipRefHash
    ) external onlyRecorderOrOwner returns (bytes32 reviewId, bool isPioneer, uint8 pioneerSlot) {
        require(reviewer != address(0), "ProofOfReview: invalid reviewer");
        require(rating >= 1 && rating <= 5, "ProofOfReview: rating out of bounds");
        require(verificationTier == 1 || verificationTier == 2, "ProofOfReview: invalid tier");

        // Anti-replay check for Option 1 (Receipt Slip)
        if (verificationTier == 1 && slipRefHash != bytes32(0)) {
            require(!usedSlipHashes[slipRefHash], "ProofOfReview: receipt slip already used");
            usedSlipHashes[slipRefHash] = true;
        }

        // Increment place reviews & compute Pioneer status
        placeReviewCount[placeHash] += 1;
        uint8 currentCount = placeReviewCount[placeHash];

        if (currentCount <= 3) {
            isPioneer = true;
            pioneerSlot = currentCount;
        } else {
            isPioneer = false;
            pioneerSlot = 0;
        }

        // Generate deterministic review ID
        reviewId = keccak256(
            abi.encodePacked(placeHash, reviewer, block.timestamp, currentCount)
        );

        reviews[reviewId] = ReviewRecord({
            placeHash: placeHash,
            reviewer: reviewer,
            rating: rating,
            verificationTier: verificationTier,
            timestamp: block.timestamp,
            isPioneer: isPioneer,
            pioneerSlot: pioneerSlot,
            slipRefHash: slipRefHash
        });

        emit ReviewRecorded(
            reviewId,
            placeHash,
            reviewer,
            rating,
            verificationTier,
            isPioneer,
            pioneerSlot,
            block.timestamp
        );

        return (reviewId, isPioneer, pioneerSlot);
    }

    function isSlipUsed(bytes32 slipHash) external view returns (bool) {
        return usedSlipHashes[slipHash];
    }

    function getReview(bytes32 reviewId) external view returns (ReviewRecord memory) {
        return reviews[reviewId];
    }
}
