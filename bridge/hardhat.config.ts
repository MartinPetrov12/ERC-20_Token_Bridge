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
  const { bridgeDeploy } = await importScript("./scripts/deploy");
  await bridgeDeploy(hre.network.name);
});

task("deploy-token", "Deploys a token instance")
  .addParam("tokenName", "Name of the token")
  .addParam("tokenSymbol", "Symbol of the token")
  .setAction(async (taskArgs) => {
    const { tokenDeploy } = await importScript("./scripts/deploy-token");
    await tokenDeploy(taskArgs.tokenName, taskArgs.tokenSymbol);
  })

task("lock-token", "Locks an amount of tokens in a bridge")
  .addParam("bridgeAddress", "The address of the bridge")
  .addParam("tokenAddress", "The address of the token to lock")
  .addParam("amount", "The amount to be locked")
  .setAction(async (taskArgs, hre) => {
    const { lock } = await importScript("./scripts/lock");
    await lock(hre.network.name, taskArgs.bridgeAddress, taskArgs.tokenAddress, taskArgs.amount)
});

task("mint-tokens", "Mints tokens to a wallet")
  .addParam("receiver", "The address to mint the tokens to")
  .addParam("tokenAddress", "The address of the token to lock")
  .addParam("amount", "The amount to be locked")
  .setAction(async (taskArgs, hre) => {
    const { tokenMint } = await importScript("./scripts/deploy-token")
    await tokenMint(hre.network.name, taskArgs.receiver, taskArgs.tokenAddress, taskArgs.amount);
  })

task("approve-tokens", "Approve tokens for a spender")
  .addParam("spender", "The address to mint the tokens to")
  .addParam("tokenAddress", "The address of the token to lock")
  .addParam("amount", "The amount to be locked")
  .setAction(async (taskArgs, hre) => {
    const {tokenApprove} = await importScript("./scripts/deploy-token");
    await tokenApprove(hre.network.name, taskArgs.spender, taskArgs.tokenAddress, taskArgs.amount);
  })

task("token-balance", "Checks users balance for a token")
  .addParam("userAddress", "The address of the user")
  .addParam("tokenAddress", "The address of the token")
  .setAction(async (taskArgs, hre) => {
    const {checkTokenBalance} = await importScript("./scripts/deploy-token");
    await checkTokenBalance(hre.network.name, taskArgs.userAddress, taskArgs.tokenAddress);
});

task("get-allowance", "Get token allowance")
  .addParam("owner", "Owner of the token")
  .addParam("spender", "Spender of the token")
  .addParam("tokenAddress" , "The address of the token")
  .setAction(async (taskArgs, hre) => {
    const { getTokenAllowance } = await importScript("./scripts/deploy-token");
    await getTokenAllowance(hre.network.name, taskArgs.owner, taskArgs.spender, taskArgs.tokenAddress);
  });

task("add-token-release", "Adds an amount of tokens to be released for a user")
.addParam("bridgeAddress", "The address of the bridge")
.addParam("tokenAddress", "The address of the token to release")
.addParam("userAddress", "The address of the user")
.addParam("amount", "Amount of tokens to be added")
.setAction(async (taskArgs, hre) => {
  const {addTokensToRelease} = await importScript("./scripts/mappingsSetter");
  await addTokensToRelease(hre.network.name, taskArgs.bridgeAddress, taskArgs.tokenAddress, taskArgs.userAddress, taskArgs.amount);
});

task("release", "Release an amount of tokens")
  .addParam("bridgeAddress", "The address of the bridge")
  .addParam("tokenAddress", "The address of the token to lock")
  .addParam("amount", "Amount of tokens to be added")
  .setAction(async (taskArgs, hre) => {
    const {release} = await importScript("./scripts/release");
    await release(hre.network.name, taskArgs.bridgeAddress, taskArgs.tokenAddress, taskArgs.amount);
});

task("add-token-claim", "Adds an amount of tokens to be claimed for a user")
.addParam("bridgeAddress", "The address of the bridge")
.addParam("tokenAddress", "The address of the token to claim")
.addParam("userAddress", "The address of the user")
.addParam("amount", "Amount of tokens to be added")
.setAction(async (taskArgs, hre) => {
  const { addTokensToClaim } = await importScript("./scripts/mappingsSetter");
  await addTokensToClaim(hre.network.name, taskArgs.bridgeAddress, taskArgs.tokenAddress, taskArgs.userAddress, taskArgs.amount);
});

task("claim", "Claim an amount of tokens")
  .addParam("bridgeAddress", "The address of the bridge")
  .addParam("tokenAddress", "The address of the token to claim")
  .addParam("amount", "Amount of tokens to be added")
  .setAction(async (taskArgs, hre) => {
    const { claim } = await importScript("./scripts/claim");
    await claim(hre.network.name, taskArgs.bridgeAddress, taskArgs.tokenAddress, taskArgs.amount);
});

task("get-claim", "")
  .addParam("bridgeAddress")
  .addParam("userAddress")
  .addParam("tokenAddress")
  .setAction(async (taskArgs, hre) => {
    const { getClaim } = await importScript("./scripts/deploy-token");
    await getClaim(hre.network.name, taskArgs.bridgeAddress, taskArgs.userAddress, taskArgs.tokenAddress);
});

task("burn-tokens", "Burn an amount of wrapped tokens")
  .addParam("bridgeAddress", "The address of the bridge")
  .addParam("tokenAddress", "The address of the token to be burnt")
  .addParam("amount", "Amount of tokens to burn")
  .setAction(async (taskArgs, hre) => {
    const { burn } = await importScript("./scripts/burn");
    await burn(hre.network.name, taskArgs.bridgeAddress, taskArgs.tokenAddress, taskArgs.amount);
});
  

const importScript = async (module: any) => {
  return await import(module);
};

export default config;
