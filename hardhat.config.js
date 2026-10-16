import "@nomicfoundation/hardhat-ethers";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const accounts = [];
if (process.env.FAUCET_PRIVATE_KEY && process.env.FAUCET_PRIVATE_KEY.startsWith("0x")) {
  accounts.push(process.env.FAUCET_PRIVATE_KEY);
}

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    fuji: {
      url: process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: accounts.length > 0 ? accounts : undefined,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
