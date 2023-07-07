import { ethers } from "hardhat"
import { populateDeploymentContract } from "./utils";

export const bridgeDeploy = async (network: string) => {
    const bridgeFactory = await ethers.getContractFactory("Bridge")
    const bridgeContract = await bridgeFactory.deploy(populateDeploymentContract(network));

    await bridgeContract.deployed();

    console.log(
        `Bridge deployed to ${bridgeContract.address}`
    );
}

export default bridgeDeploy;


