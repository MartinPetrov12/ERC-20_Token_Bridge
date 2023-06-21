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

task("deploy-bridge", "Deploys a bridge instance", async function (taskArgs, hre) {
  const { bridgeDeploy } = await importScript("./scripts/deploy");
  await bridgeDeploy();
});

task("deploy-token", "Deploys a token instance")
  .addParam("tokenName", "Name of the token")
  .addParam("tokenSymbol", "Symbol of the token")
  .setAction(async (taskArgs) => {
    const { tokenDeploy } = await importScript("./scripts/deploy-token");
    await tokenDeploy(taskArgs.tokenName, taskArgs.tokenSymbol);
  })

task("lock", "Locks an amount of tokens in a bridge")
  .addParam("bridgeNetwork", "The network of the bridge")
  .addParam("bridgeAddress", "The address of the bridge")
  .addParam("tokenAddress", "The address of the token to lock")
  .addParam("amount", "The amount to be locked")
  .setAction(async (taskArgs) => {
    const { lock } = await importScript("./scripts/lock");
    await lock(taskArgs.bridgeNetwork, taskArgs.bridgeAddress, taskArgs.tokenAddress, taskArgs.amount)
});

task("mint-tokens", "Mints tokens to a wallet")
  .addParam("bridgeNetwork", "The network of the bridge")
  .addParam("receiver", "The address to mint the tokens to")
  .addParam("tokenAddress", "The address of the token to lock")
  .addParam("amount", "The amount to be locked")
  .setAction(async (taskArgs) => {
    const { tokenMint } = await importScript("./scripts/deploy-token")
    await tokenMint(taskArgs.bridgeNetwork, taskArgs.receiver, taskArgs.tokenAddress, taskArgs.amount);
  })

task("approve-tokens", "Approve tokens for a spender")
  .addParam("bridgeNetwork", "The network of the bridge")
  .addParam("spender", "The address to mint the tokens to")
  .addParam("tokenAddress", "The address of the token to lock")
  .addParam("amount", "The amount to be locked")
  .setAction(async (taskArgs) => {
    const {tokenApprove} = await importScript("./scripts/deploy-token");
    await tokenApprove(taskArgs.bridgeNetwork, taskArgs.spender, taskArgs.tokenAddress, taskArgs.amount);
  })

task("token-balance", "Checks users balance for a token")
  .addParam("bridgeNetwork", "The network of the bridge")
  .addParam("userAddress", "The address of the user")
  .addParam("tokenAddress", "The address of the token to lock")
  .setAction(async (taskArgs) => {
    const {checkTokenBalance} = await importScript("./scripts/deploy-token");
    await checkTokenBalance(taskArgs.bridgeNetwork, taskArgs.userAddress, taskArgs.tokenAddress);
  });

const importScript = async (module: any) => {
  return await import(module);
};

export default config;
