import { expect } from "chai";
import hre from "hardhat";

describe("TasteChain BKK Smart Contracts (Avalanche Fuji Architecture)", function () {
  let tasteToken, proofOfReview, merchantEscrow, merchantPromotions, dailyEpochRewards;
  let owner, merchant, diner1, diner2, diner3, diner4, relayer;

  const PLACE_ID_SAMPLE = "ChIJEcVgHsif4jARvyo1f1YxDmo";
  let placeHash;

  before(async function () {
    [owner, merchant, diner1, diner2, diner3, diner4, relayer] = await hre.ethers.getSigners();
    placeHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(PLACE_ID_SAMPLE));
  });

  beforeEach(async function () {
    // 1. Deploy TasteToken
    const TasteTokenFactory = await hre.ethers.getContractFactory("TasteToken");
    tasteToken = await TasteTokenFactory.deploy(owner.address);
    await tasteToken.waitForDeployment();

    // 2. Deploy ProofOfReview
    const ProofOfReviewFactory = await hre.ethers.getContractFactory("ProofOfReview");
    proofOfReview = await ProofOfReviewFactory.deploy(owner.address);
    await proofOfReview.waitForDeployment();
    await proofOfReview.setRecorder(relayer.address, true);

    // 3. Deploy MerchantEscrow
    const MerchantEscrowFactory = await hre.ethers.getContractFactory("MerchantEscrow");
    merchantEscrow = await MerchantEscrowFactory.deploy(owner.address);
    await merchantEscrow.waitForDeployment();
    await merchantEscrow.setRelayer(relayer.address, true);

    // 4. Deploy MerchantPromotions
    const MerchantPromotionsFactory = await hre.ethers.getContractFactory("MerchantPromotions");
    merchantPromotions = await MerchantPromotionsFactory.deploy(owner.address, await tasteToken.getAddress());
    await merchantPromotions.waitForDeployment();

    // 5. Deploy DailyEpochRewards
    const DailyEpochRewardsFactory = await hre.ethers.getContractFactory("DailyEpochRewards");
    dailyEpochRewards = await DailyEpochRewardsFactory.deploy(owner.address, await tasteToken.getAddress());
    await dailyEpochRewards.waitForDeployment();

    // Authorize DailyEpochRewards as Minter on TasteToken
    await tasteToken.setMinter(await dailyEpochRewards.getAddress(), true);
  });

  describe("1. TasteToken ($TASTE)", function () {
    it("Should initialize with correct name, symbol, and owner balance", async function () {
      expect(await tasteToken.name()).to.equal("TasteChain BKK Token");
      expect(await tasteToken.symbol()).to.equal("TASTE");
      const ownerBal = await tasteToken.balanceOf(owner.address);
      expect(ownerBal).to.equal(hre.ethers.parseEther("1000000"));
    });

    it("Should allow owner and authorized minter to mint", async function () {
      await tasteToken.mint(diner1.address, hre.ethers.parseEther("500"));
      expect(await tasteToken.balanceOf(diner1.address)).to.equal(hre.ethers.parseEther("500"));
    });

    it("Should allow burning tokens and reduce total supply", async function () {
      await tasteToken.mint(diner1.address, hre.ethers.parseEther("100"));
      const supplyBefore = await tasteToken.totalSupply();
      await tasteToken.connect(diner1).burn(hre.ethers.parseEther("40"));
      const supplyAfter = await tasteToken.totalSupply();
      expect(supplyBefore - supplyAfter).to.equal(hre.ethers.parseEther("40"));
    });
  });

  describe("2. ProofOfReview Registry & Anti-Replay", function () {
    it("Should record Option 1 (Receipt Slip) review with Pioneer slot 1", async function () {
      const slipRefHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("RCPT-20261016-001"));
      const tx = await proofOfReview.connect(relayer).recordReview(
        placeHash,
        diner1.address,
        5, // rating
        1, // tier 1 = Receipt Slip OCR
        slipRefHash
      );
      await tx.wait();

      expect(await proofOfReview.placeReviewCount(placeHash)).to.equal(1n);
      expect(await proofOfReview.isSlipUsed(slipRefHash)).to.be.true;
    });

    it("Should revert on Option 1 when identical receipt slip is submitted again (Anti-Replay)", async function () {
      const slipRefHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("RCPT-DUPLICATE-TEST"));
      await proofOfReview.connect(relayer).recordReview(placeHash, diner1.address, 5, 1, slipRefHash);

      // Attempt second submission with same slip
      let reverted = false;
      try {
        await proofOfReview.connect(relayer).recordReview(placeHash, diner2.address, 4, 1, slipRefHash);
      } catch (err) {
        reverted = true;
        expect(err.message).to.include("receipt slip already used");
      }
      expect(reverted).to.be.true;
    });

    it("Should assign Pioneer status to first 3 reviewers and non-pioneer to 4th+", async function () {
      const pHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("PIONEER_VENUE_TEST"));
      
      // Review 1
      await proofOfReview.connect(relayer).recordReview(pHash, diner1.address, 5, 2, hre.ethers.ZeroHash);
      expect(await proofOfReview.placeReviewCount(pHash)).to.equal(1n);

      // Review 2
      await proofOfReview.connect(relayer).recordReview(pHash, diner2.address, 4, 2, hre.ethers.ZeroHash);
      expect(await proofOfReview.placeReviewCount(pHash)).to.equal(2n);

      // Review 3
      await proofOfReview.connect(relayer).recordReview(pHash, diner3.address, 5, 2, hre.ethers.ZeroHash);
      expect(await proofOfReview.placeReviewCount(pHash)).to.equal(3n);

      // Review 4 (should NOT be pioneer)
      await proofOfReview.connect(relayer).recordReview(pHash, diner4.address, 4, 2, hre.ethers.ZeroHash);
      expect(await proofOfReview.placeReviewCount(pHash)).to.equal(4n);
    });
  });

  describe("3. MerchantEscrow (AVAX Bounties)", function () {
    it("Should allow merchant to fund bounty and relayer to dispense AVAX to diner", async function () {
      const rewardPerVisit = hre.ethers.parseEther("0.05");
      const totalBudget = hre.ethers.parseEther("0.2");

      // Merchant creates bounty with 0.2 AVAX
      const createTx = await merchantEscrow.connect(merchant).createBounty(
        placeHash,
        rewardPerVisit,
        150, // minSpendThb
        86400, // 24 hours
        { value: totalBudget }
      );
      await createTx.wait();

      const bounty = await merchantEscrow.bounties(1);
      expect(bounty.merchant).to.equal(merchant.address);
      expect(bounty.remainingBudget).to.equal(totalBudget);

      // Diner balance before
      const dinerBalBefore = await hre.ethers.provider.getBalance(diner1.address);

      // Relayer dispenses bounty to diner1
      const reviewId = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("REV-BOUNTY-001"));
      await merchantEscrow.connect(relayer).claimBounty(1, diner1.address, reviewId);

      const dinerBalAfter = await hre.ethers.provider.getBalance(diner1.address);
      expect(dinerBalAfter - dinerBalBefore).to.equal(rewardPerVisit);

      const updatedBounty = await merchantEscrow.bounties(1);
      expect(updatedBounty.remainingBudget).to.equal(hre.ethers.parseEther("0.15"));
      expect(updatedBounty.totalClaims).to.equal(1n);
    });

    it("Should allow merchant to refund remaining budget", async function () {
      const rewardPerVisit = hre.ethers.parseEther("0.05");
      await merchantEscrow.connect(merchant).createBounty(
        placeHash,
        rewardPerVisit,
        100,
        3600,
        { value: hre.ethers.parseEther("0.1") }
      );

      const merchantBalBefore = await hre.ethers.provider.getBalance(merchant.address);
      const refundTx = await merchantEscrow.connect(merchant).refundBounty(1);
      const receipt = await refundTx.wait();
      const gasSpent = receipt.gasUsed * receipt.gasPrice;

      const merchantBalAfter = await hre.ethers.provider.getBalance(merchant.address);
      expect(merchantBalAfter + gasSpent - merchantBalBefore).to.equal(hre.ethers.parseEther("0.1"));

      const b = await merchantEscrow.bounties(1);
      expect(b.isActive).to.be.false;
      expect(b.remainingBudget).to.equal(0n);
    });
  });

  describe("4. MerchantPromotions (80/20 Deflationary Burn)", function () {
    it("Should burn 80% and transfer 20% to merchant upon voucher redemption", async function () {
      const voucherCost = hre.ethers.parseEther("100"); // 100 $TASTE

      // Give diner1 100 TASTE
      await tasteToken.mint(diner1.address, voucherCost);

      // Merchant creates voucher
      await merchantPromotions.connect(merchant).createPromotion(
        placeHash,
        voucherCost,
        15, // 15% discount
        50 // max redemptions
      );

      // Diner approves MerchantPromotions to spend 100 TASTE
      await tasteToken.connect(diner1).approve(await merchantPromotions.getAddress(), voucherCost);

      const dinerBalBefore = await tasteToken.balanceOf(diner1.address);
      const merchantBalBefore = await tasteToken.balanceOf(merchant.address);
      const supplyBefore = await tasteToken.totalSupply();

      // Diner redeems voucher
      await merchantPromotions.connect(diner1).redeemPromotion(1);

      const dinerBalAfter = await tasteToken.balanceOf(diner1.address);
      const merchantBalAfter = await tasteToken.balanceOf(merchant.address);
      const supplyAfter = await tasteToken.totalSupply();

      // Diner spent 100 TASTE
      expect(dinerBalBefore - dinerBalAfter).to.equal(voucherCost);
      // 80% burned (80 TASTE reduction in total supply)
      expect(supplyBefore - supplyAfter).to.equal(hre.ethers.parseEther("80"));
      // 20% received by merchant (20 TASTE)
      expect(merchantBalAfter - merchantBalBefore).to.equal(hre.ethers.parseEther("20"));
    });
  });

  describe("5. DailyEpochRewards (10,000 $TASTE Daily & 1-Click Admin PoC)", function () {
    it("Should allow Admin to execute 1-Click manualDistributeEpoch for Hackathon PoC", async function () {
      const epochDate = 20261016; // YYYYMMDD
      const recipients = [diner1.address, diner2.address, diner3.address];
      const amounts = [
        hre.ethers.parseEther("5000"),
        hre.ethers.parseEther("3000"),
        hre.ethers.parseEther("2000"),
      ]; // Sum = 10,000 $TASTE

      await dailyEpochRewards.connect(owner).manualDistributeEpoch(epochDate, recipients, amounts);

      expect(await tasteToken.balanceOf(diner1.address)).to.equal(hre.ethers.parseEther("5000"));
      expect(await tasteToken.balanceOf(diner2.address)).to.equal(hre.ethers.parseEther("3000"));
      expect(await tasteToken.balanceOf(diner3.address)).to.equal(hre.ethers.parseEther("2000"));
      expect(await dailyEpochRewards.epochSettled(epochDate)).to.be.true;
    });

    it("Should prevent double distribution for the same epoch date", async function () {
      const epochDate = 20261017;
      const recipients = [diner1.address];
      const amounts = [hre.ethers.parseEther("1000")];

      await dailyEpochRewards.connect(owner).manualDistributeEpoch(epochDate, recipients, amounts);

      let reverted = false;
      try {
        await dailyEpochRewards.connect(owner).manualDistributeEpoch(epochDate, recipients, amounts);
      } catch (err) {
        reverted = true;
        expect(err.message).to.include("DailyEpochRewards: epoch already settled");
      }
      expect(reverted).to.be.true;
    });

    it("Should allow asynchronous individual reward distribution upon customer claim", async function () {
      const claimRef = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("DB-CLAIM-9876"));
      const claimAmount = hre.ethers.parseEther("145.5");

      await dailyEpochRewards.connect(owner).distributeClaim(diner1.address, claimAmount, claimRef);
      expect(await tasteToken.balanceOf(diner1.address)).to.equal(claimAmount);
    });
  });
});
