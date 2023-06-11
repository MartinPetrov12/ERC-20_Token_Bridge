import { ethers } from "hardhat"

export const bridgeDeploy = async () => {
    const bridgeFactory = await ethers.getContractFactory("Bridge")
    const bridgeContract = await bridgeFactory.deploy();

    await bridgeContract.deployed();

    console.log(
        `Bridge deployed to ${bridgeContract.address}`
    );
}

export default bridgeDeploy;