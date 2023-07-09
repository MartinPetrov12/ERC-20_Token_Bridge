import { ethers } from "hardhat"
import { populateDeploymentContract } from "./utils";

/**
 * Deploys an instance of the Bridge contract on the desired network.
 * @param network - the network to deploy the bridge contract on
 */
export const bridgeDeploy = async (network: string) => {
    const bridgeFactory = await ethers.getContractFactory("Bridge")
    const bridgeContract = await bridgeFactory.deploy(populateDeploymentContract(network));
    await bridgeContract.deployed();
    console.log(
        `Bridge deployed to ${bridgeContract.address} on the ${network} network`
    );
}
