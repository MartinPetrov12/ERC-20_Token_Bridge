import { ethers } from "hardhat"
import { populateDeploymentContract } from "./utils";

/**
 * Deploys an instance of the Generic Token contract on the desired network.
 * @param tokenName - the name of the token
 * @param tokenSymbol - the symbol of the token
 * @param network - the network the token is deployed on
 */
export const tokenDeploy = async (tokenName: string, tokenSymbol: string, network: string) => {
    const tokenFactory = await ethers.getContractFactory("GenericToken")
    const tokenContract = await tokenFactory.deploy(tokenName, tokenSymbol.toUpperCase(), populateDeploymentContract(network));
    await tokenContract.deployed();
    console.log(
        `ERC-20 Token deployed to ${tokenContract.address} on the ${network} network.\nName: ${tokenName}, Symbol: ${tokenSymbol}`
    );
}
