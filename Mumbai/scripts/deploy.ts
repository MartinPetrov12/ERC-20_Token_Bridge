import { ethers } from "hardhat"

export const bridgeDeploy = async () => {
    const bridgeFactory = await ethers.getContractFactory("Bridge")
    const bridgeContract = await bridgeFactory.deploy({
        gasLimit: 10000000,
        gasPrice: 130000000000
    });

    await bridgeContract.deployed();

    console.log(
        `Bridge deployed to ${bridgeContract.address}`
    );
}

export default bridgeDeploy;