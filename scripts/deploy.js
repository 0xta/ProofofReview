import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("====================================================");
  console.log("🚀 DEPLOYING TASTECHAIN BKK SMART CONTRACTS");
  console.log(`📡 Network: ${hre.network.name} (Chain ID: ${hre.network.config.chainId || 31337})`);
  console.log("====================================================\n");

  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer account available. Check FAUCET_PRIVATE_KEY or Hardhat network accounts.");
  }

  const deployerBalance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Deployer Address: ${deployer.address}`);
  console.log(`Deployer Balance: ${hre.ethers.formatEther(deployerBalance)} AVAX\n`);

  // 1. Deploy TasteToken
  console.log("1. Deploying TasteToken ($TASTE)...");
  const TasteToken = await hre.ethers.getContractFactory("TasteToken");
  const tasteToken = await TasteToken.deploy(deployer.address);
  await tasteToken.waitForDeployment();
  const tasteTokenAddress = await tasteToken.getAddress();
  console.log(`   ✅ TasteToken deployed at: ${tasteTokenAddress}`);

  // 2. Deploy ProofOfReview
  console.log("2. Deploying ProofOfReview Registry...");
  const ProofOfReview = await hre.ethers.getContractFactory("ProofOfReview");
  const proofOfReview = await ProofOfReview.deploy(deployer.address);
  await proofOfReview.waitForDeployment();
  const proofOfReviewAddress = await proofOfReview.getAddress();
  console.log(`   ✅ ProofOfReview deployed at: ${proofOfReviewAddress}`);

  // 3. Deploy MerchantEscrow
  console.log("3. Deploying MerchantEscrow (AVAX Bounties)...");
  const MerchantEscrow = await hre.ethers.getContractFactory("MerchantEscrow");
  const merchantEscrow = await MerchantEscrow.deploy(deployer.address);
  await merchantEscrow.waitForDeployment();
  const merchantEscrowAddress = await merchantEscrow.getAddress();
  console.log(`   ✅ MerchantEscrow deployed at: ${merchantEscrowAddress}`);

  // 4. Deploy MerchantPromotions
  console.log("4. Deploying MerchantPromotions (80/20 Deflationary Burn)...");
  const MerchantPromotions = await hre.ethers.getContractFactory("MerchantPromotions");
  const merchantPromotions = await MerchantPromotions.deploy(deployer.address, tasteTokenAddress);
  await merchantPromotions.waitForDeployment();
  const merchantPromotionsAddress = await merchantPromotions.getAddress();
  console.log(`   ✅ MerchantPromotions deployed at: ${merchantPromotionsAddress}`);

  // 5. Deploy DailyEpochRewards
  console.log("5. Deploying DailyEpochRewards (10k $TASTE Mining & 1-Click PoC)...");
  const DailyEpochRewards = await hre.ethers.getContractFactory("DailyEpochRewards");
  const dailyEpochRewards = await DailyEpochRewards.deploy(deployer.address, tasteTokenAddress);
  await dailyEpochRewards.waitForDeployment();
  const dailyEpochRewardsAddress = await dailyEpochRewards.getAddress();
  console.log(`   ✅ DailyEpochRewards deployed at: ${dailyEpochRewardsAddress}`);

  // 6. Wire Permissions
  console.log("\n6. Configuring Contract Roles & Permissions...");
  const minterTx = await tasteToken.setMinter(dailyEpochRewardsAddress, true);
  await minterTx.wait();
  console.log("   ✅ DailyEpochRewards granted MINTER role on TasteToken");

  const recorderTx = await proofOfReview.setRecorder(deployer.address, true);
  await recorderTx.wait();
  console.log("   ✅ Deployer granted RECORDER role on ProofOfReview");

  const relayerTx = await merchantEscrow.setRelayer(deployer.address, true);
  await relayerTx.wait();
  console.log("   ✅ Deployer granted RELAYER role on MerchantEscrow");

  // 7. Save Artifacts for Frontend
  const deployedConfig = {
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {
      TasteToken: tasteTokenAddress,
      ProofOfReview: proofOfReviewAddress,
      MerchantEscrow: merchantEscrowAddress,
      MerchantPromotions: merchantPromotionsAddress,
      DailyEpochRewards: dailyEpochRewardsAddress,
    },
  };

  const outputDir = path.resolve(process.cwd(), "src/data");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "contracts.json");
  fs.writeFileSync(outputPath, JSON.stringify(deployedConfig, null, 2));
  console.log(`\n📄 Deployment configuration saved to: ${outputPath}`);

  console.log("\n====================================================");
  console.log("🎉 ALL SMART CONTRACTS DEPLOYED & WIRED SUCCESSFULLY!");
  console.log("====================================================\n");

  return deployedConfig;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
