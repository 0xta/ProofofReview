import deployedConfig from '@/data/contracts.json';

export const CONTRACT_ADDRESSES = {
  TasteToken:
    process.env.NEXT_PUBLIC_TASTE_TOKEN_ADDRESS ||
    deployedConfig.contracts.TasteToken ||
    '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  ProofOfReview:
    process.env.NEXT_PUBLIC_PROOF_OF_REVIEW_ADDRESS ||
    deployedConfig.contracts.ProofOfReview ||
    '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  MerchantEscrow:
    process.env.NEXT_PUBLIC_MERCHANT_ESCROW_ADDRESS ||
    deployedConfig.contracts.MerchantEscrow ||
    '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  MerchantPromotions:
    process.env.NEXT_PUBLIC_MERCHANT_PROMOTIONS_ADDRESS ||
    deployedConfig.contracts.MerchantPromotions ||
    '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  DailyEpochRewards:
    process.env.NEXT_PUBLIC_DAILY_EPOCH_REWARDS_ADDRESS ||
    deployedConfig.contracts.DailyEpochRewards ||
    '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
};

export const TASTE_TOKEN_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'function mint(address to, uint256 amount)',
  'function burn(uint256 amount)',
  'function burnFrom(address account, uint256 amount)',
  'function isMinter(address account) view returns (bool)',
];

export const PROOF_OF_REVIEW_ABI = [
  'function recordReview(bytes32 placeHash, address reviewer, uint8 rating, uint8 verificationTier, bytes32 slipRefHash) returns (bytes32 reviewId, bool isPioneer, uint8 pioneerSlot)',
  'function placeReviewCount(bytes32 placeHash) view returns (uint8)',
  'function isSlipUsed(bytes32 slipHash) view returns (bool)',
  'function getReview(bytes32 reviewId) view returns (tuple(bytes32 placeHash, address reviewer, uint8 rating, uint8 verificationTier, uint256 timestamp, bool isPioneer, uint8 pioneerSlot, bytes32 slipRefHash))',
];

export const MERCHANT_ESCROW_ABI = [
  'function createBounty(bytes32 placeHash, uint256 rewardPerVisit, uint256 minSpendThb, uint256 durationSeconds) payable returns (uint256 bountyId)',
  'function claimBounty(uint256 bountyId, address diner, bytes32 reviewId)',
  'function refundBounty(uint256 bountyId)',
  'function bounties(uint256 bountyId) view returns (tuple(bytes32 placeHash, address merchant, uint256 totalBudget, uint256 remainingBudget, uint256 rewardPerVisit, uint256 minSpendThb, uint256 expirationTime, uint256 totalClaims, bool isActive))',
  'function getPlaceBounties(bytes32 placeHash) view returns (uint256[])',
];

export const MERCHANT_PROMOTIONS_ABI = [
  'function createPromotion(bytes32 placeHash, uint256 costInTaste, uint16 discountPercent, uint256 maxRedemptions) returns (uint256 promoId)',
  'function redeemPromotion(uint256 promoId) returns (bytes32 redemptionCode)',
  'function promotions(uint256 promoId) view returns (tuple(bytes32 placeHash, address merchant, uint256 costInTaste, uint16 discountPercent, uint256 maxRedemptions, uint256 totalRedeemed, bool isActive))',
  'function getPlacePromotions(bytes32 placeHash) view returns (uint256[])',
];

export const DAILY_EPOCH_REWARDS_ABI = [
  'function manualDistributeEpoch(uint256 epochDate, address[] recipients, uint256[] amounts)',
  'function distributeClaim(address recipient, uint256 amount, bytes32 claimRef)',
  'function epochSettled(uint256 epochDate) view returns (bool)',
  'function DAILY_EMISSION() view returns (uint256)',
];
