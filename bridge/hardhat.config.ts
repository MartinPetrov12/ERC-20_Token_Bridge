import dotenv from 'dotenv';
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { HardhatRuntimeEnvironment } from 'hardhat/types';
dotenv.config({ path: '.env.dev' });

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    sepolia: {
      url: process.env.INFURA_SEPOLIA_URL,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY || '']
    }, 
    maticmum: {
      url: process.env.ALCHEMY_MUMBAI_URL,
      accounts: [process.env.MUMBAI_PRIVATE_KEY || '']
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API
  }
};

task("deploy-bridge", "Deploys a bridge instance", async function (taskArgs, hre) {
  const { bridgeDeploy } = await importScript("./scripts/deploy-bridge");
  await bridgeDeploy(hre.network.name);
});

task("deploy-token", "Deploys a token instance")
  .addParam("tokenName", "Name of the token")
  .addParam("tokenSymbol", "Symbol of the token")
  .setAction(async (taskArgs, hre) => {
    const { tokenDeploy } = await importScript("./scripts/deploy-token");
    await tokenDeploy(taskArgs.tokenName, taskArgs.tokenSymbol, hre.network.name);
  })

task("lock-tokens", "Locks an amount of tokens in a bridge")
  .addParam("tokenAddress", "The address of the token to lock")
  .addParam("amount", "The amount to be locked")
  .setAction(async (taskArgs, hre) => {
    const { lock } = await importScript("./scripts/lock");
    await lock(taskArgs.tokenAddress, taskArgs.amount, hre.network.name)
});

task("mint-tokens", "Mints tokens to a wallet")
  .addParam("tokenAddress", "The address of the token to lock")
  .addParam("receiver", "The address to mint the tokens to")
  .addParam("amount", "The amount to be locked")
  .setAction(async (taskArgs, hre) => {
    const { tokenMint } = await importScript("./scripts/tokenUtils")
    await tokenMint(taskArgs.tokenAddress, taskArgs.receiver, taskArgs.amount, hre.network.name);
});

task("approve-tokens", "Approve tokens for a spender")
  .addParam("tokenAddress", "The address of the token to lock")
  .addParam("spender", "The address to mint the tokens to")
  .addParam("amount", "The amount to be locked")
  .setAction(async (taskArgs, hre) => {
    const {tokenApprove} = await importScript("./scripts/tokenUtils");
    await tokenApprove(taskArgs.tokenAddress, taskArgs.spender, taskArgs.amount, hre.network.name);
});

task("token-balance", "Checks users balance for a token")
  .addParam("tokenAddress", "The address of the token")
  .addParam("userAddress", "The address of the user")
  .setAction(async (taskArgs, hre) => {
    const {checkTokenBalance} = await importScript("./scripts/tokenUtils");
    await checkTokenBalance(taskArgs.tokenAddress, taskArgs.userAddress, hre.network.name);
});

task("get-allowance", "Get token allowance")
  .addParam("tokenAddress" , "The address of the token")  
  .addParam("owner", "Owner of the token")
  .addParam("spender", "Spender of the token")
  .setAction(async (taskArgs, hre) => {
    const { getTokenAllowance } = await importScript("./scripts/tokenUtils.ts");
    await getTokenAllowance(taskArgs.tokenAddress,taskArgs.owner, taskArgs.spender, hre.network.name);
  });

task("add-token-release", "Adds an amount of tokens to be released for a user")
.addParam("tokenAddress", "The address of the token to release")
.addParam("userAddress", "The address of the user")
.addParam("amount", "Amount of tokens to be added")
.setAction(async (taskArgs, hre) => {
  const {addTokensToRelease} = await importScript("./scripts/mappingsSetter");
  await addTokensToRelease(taskArgs.tokenAddress, taskArgs.userAddress, taskArgs.amount, hre.network.name);
});

task("release", "Release an amount of tokens")
  .addParam("tokenAddress", "The address of the token to release")
  .addParam("amount", "Amount of tokens to be released")
  .setAction(async (taskArgs, hre) => {
    const { release } = await importScript("./scripts/release");
    await release(taskArgs.tokenAddress, taskArgs.amount, hre.network.name);
});

task("add-token-claim", "Adds an amount of tokens to be claimed for a user")
.addParam("tokenAddress", "The address of the token to claim")
.addParam("userAddress", "The address of the user")
.addParam("amount", "Amount of tokens to be added")
.setAction(async (taskArgs, hre) => {
  const { addTokensToClaim } = await importScript("./scripts/mappingsSetter");
  await addTokensToClaim(taskArgs.tokenAddress, taskArgs.userAddress, taskArgs.amount, hre.network.name);
});

task("claim", "Claim an amount of tokens")
  .addParam("tokenAddress", "The address of the token to claim")
  .addParam("amount", "Amount of tokens to be added")
  .setAction(async (taskArgs, hre) => {
    const { claim } = await importScript("./scripts/claim");
    await claim(taskArgs.tokenAddress, taskArgs.amount, hre.network.name);
});

task("get-to-be-claimed", "Returns the amount of tokens the user is available to claim for a specific token")
  .addParam("tokenAddress", "The address of the token")
  .addParam("userAddress", "The address of the user")
  .setAction(async (taskArgs, hre) => {
    const { getToBeClaimed } = await importScript("./scripts/claim");
    await getToBeClaimed(taskArgs.tokenAddress, taskArgs.userAddress, hre.network.name);
});

task("burn-tokens", "Burn an amount of wrapped tokens")
  .addParam("tokenAddress", "The address of the token to be burnt")
  .addParam("amount", "Amount of tokens to burn")
  .setAction(async (taskArgs, hre) => {
    const { burn } = await importScript("./scripts/burn");
    await burn(taskArgs.tokenAddress, taskArgs.amount, hre.network.name);
});
  

const importScript = async (module: any) => {
  return await import(module);
};

export default config;
