import dotenv from 'dotenv';
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
dotenv.config({ path: '.env.dev' });

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    sepolia: {
      url: process.env.INFURA_SEPOLIA_URL,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY || '']
    }, 
    mumbai: {
      url: process.env.ALCHEMY_MUMBAI_URL,
      accounts: [process.env.MUMBAI_PRIVATE_KEY || '']
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API
  }
};

task("deploy", "Deploys a bridge instance", async function (taskArgs, hre) {
  const { bridgeDeploy } = await importDeploymentScript("./scripts/deploy");
  await bridgeDeploy();
});

const importDeploymentScript = async (module: any) => {
  return await import(module);
};

export default config;
