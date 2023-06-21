import { Contract, Wallet, providers, BigNumber } from "ethers";
import GenericTokenArtifact from "../artifacts/contracts/tokens/GenericToken.sol/GenericToken.json";
import { ethers } from "hardhat"
import { getProvider, getWallet } from "./utils"
import 'dotenv';

export const tokenDeploy = async (tokenName: string, tokenSymbol: string) => {

    const tokenFactory = await ethers.getContractFactory("GenericToken")
    const tokenContract = await tokenFactory.deploy(tokenName, tokenSymbol.toUpperCase());

    await tokenContract.deployed();

    console.log(
        `Token deployed to ${tokenContract.address}`
    );
}

export const tokenMint = async (bridgeNetwork: string, receiverAddress: string, tokenAddress: string, amount: number) => {
    const provider = await getProvider(bridgeNetwork);
     
    const account = await getWallet(bridgeNetwork, provider);
     
    const tokenContract = new Contract(tokenAddress, GenericTokenArtifact.abi, provider);
     
    const testTx = await tokenContract.populateTransaction.approve(receiverAddress, amount);
    
    testTx.nonce = await account.getTransactionCount();
    if(bridgeNetwork == "mumbai") {
        testTx.chainId = 80001
    }
    testTx.gasLimit = BigNumber.from(3000000);
    testTx.gasPrice = BigNumber.from(5000000000);
    const approveTxSigned = await account.signTransaction(testTx);
    
    const submittedTx = await provider.sendTransaction(approveTxSigned);
    
    const approveReceipt = await submittedTx.wait();
    if (approveReceipt.status != 1) {
        throw Error("Tokens were not minted");
    } else {
        console.log(amount + " tokens from tokenContract " + tokenAddress + " were minted to " + receiverAddress);
    }    

}

export const tokenApprove = async (bridgeNetwork: string, spender: string, tokenAddress: string, amount: number) => {
    const provider = await getProvider(bridgeNetwork);
     
    const account = await getWallet(bridgeNetwork, provider);
     
    const tokenContract = new Contract(tokenAddress, GenericTokenArtifact.abi, provider);
     
    const testTx = await tokenContract.populateTransaction.approve(spender, amount);
    
    testTx.nonce = await account.getTransactionCount();
    if(bridgeNetwork == "mumbai") {
        testTx.chainId = 80001
    }
    testTx.gasLimit = BigNumber.from(3000000);
    testTx.gasPrice = BigNumber.from(5000000000);
    const approveTxSigned = await account.signTransaction(testTx);
    
    const submittedTx = await provider.sendTransaction(approveTxSigned);
    
    const approveReceipt = await submittedTx.wait();
    if (approveReceipt.status != 1) {
        throw Error("Tokens were not approved");
    } else {
        console.log(amount + " tokens from tokenContract " + tokenAddress + " were approved to " + spender);
    }    
}

export default {tokenDeploy, tokenMint};