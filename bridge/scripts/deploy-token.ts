import { Contract } from "ethers";
import GenericTokenArtifact from "../artifacts/contracts/tokens/GenericToken.sol/GenericToken.json";
import BridgeArtifact from "../artifacts/contracts/Bridge.sol/Bridge.json";
import { ethers } from "hardhat"
import { constructTransaction, getProvider, getWallet } from "./utils"
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
     
    const transaction = await constructTransaction(await tokenContract.populateTransaction.mint(receiverAddress, amount), account, bridgeNetwork);
    
    const approveTxSigned = await account.signTransaction(transaction);
    
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
     
    const transaction = await constructTransaction(await tokenContract.populateTransaction.approve(spender, amount), account, bridgeNetwork);
    
    const approveTxSigned = await account.signTransaction(transaction);

    const submittedTx = await provider.sendTransaction(approveTxSigned);
    
    const approveReceipt = await submittedTx.wait();
    if (approveReceipt.status != 1) {
        throw Error("Tokens were not approved");
    } else {
        console.log(amount + " tokens from tokenContract " + tokenAddress + " were approved to " + spender);
    }    
}

export const checkTokenBalance = async (bridgeNetwork: string, userAddress: string, tokenAddress: string ) => {
    const provider = await getProvider(bridgeNetwork);
     
    const tokenContract = new Contract(tokenAddress, GenericTokenArtifact.abi, provider);
     
    const balance = await tokenContract.balanceOf(userAddress);
    console.log("User with address " + userAddress + " has "+ balance + " tokens from token with address " + tokenAddress);
 
}

export const getClaim = async (bridgeNetwork: string, bridgeAddress: string, userAddress: string, tokenAddress: string ) => {
    const provider = await getProvider(bridgeNetwork);
     
    const tokenContract = new Contract(bridgeAddress, BridgeArtifact.abi, provider);
     
    const toClaim = await tokenContract.getTokensToClaim(userAddress, tokenAddress);
    console.log("User with address " + userAddress + " has "+ toClaim + " tokens from token with address " + tokenAddress + " to claim");
 
}

export const getTokenAllowance = async (bridgeNetwork: string, owner: string, spender: string, tokenAddress: string ) => {
    const provider = await getProvider(bridgeNetwork);
     
    const tokenContract = new Contract(tokenAddress, GenericTokenArtifact.abi, provider);
     
    const allowance = await tokenContract.allowance(owner, spender);
    console.log("Owner: " + owner +", Spender: " + spender);
    console.log("Token address : " + tokenAddress +", Allowance: " + allowance);
}

export default {tokenDeploy, tokenMint, tokenApprove, checkTokenBalance, getTokenAllowance, getClaim};