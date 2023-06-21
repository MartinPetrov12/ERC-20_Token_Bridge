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
  .addParam("bridgenetwork", "The network of the bridge")
  .addParam("bridgeaddress", "The address of the bridge")
  .addParam("tokenaddress", "The address of the token to lock")
  .addParam("amount", "The amount to be locked")
  .setAction(async (taskArgs) => {
    const { lock } = await importScript("./scripts/lock");
    await lock(taskArgs.bridgenetwork, taskArgs.bridgeaddress, taskArgs.tokenaddress, taskArgs.amount)
});

task("mint-tokens", "Mints tokens to a wallet")
  .addParam("bridgenetwork", "The network of the bridge")
  .addParam("receiver", "The address to mint the tokens to")
  .addParam("tokenaddress", "The address of the token to lock")
  .addParam("amount", "The amount to be locked")
  .setAction(async (taskArgs) => {
    const { tokenMint } = await importScript("./scripts/deploy-token")
    await tokenMint(taskArgs.bridgenetwork, taskArgs.receiver, taskArgs.tokenaddress, taskArgs.amount);
  })

task("approve-tokens", "Approve tokens for a spender")
  .addParam("bridgenetwork", "The network of the bridge")
  .addParam("spender", "The address to mint the tokens to")
  .addParam("tokenaddress", "The address of the token to lock")
  .addParam("amount", "The amount to be locked")
  .setAction(async (taskArgs) => {
    const {tokenApprove} = await importScript("./scripts/deploy-token");
    await tokenApprove(taskArgs.bridgenetwork, taskArgs.spender, taskArgs.tokenaddress, taskArgs.amount);
  })

const importScript = async (module: any) => {
  return await import(module);
};

export default config;
