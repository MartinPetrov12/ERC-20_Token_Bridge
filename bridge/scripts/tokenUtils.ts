import { Contract } from "ethers";
import GenericTokenArtifact from "../artifacts/contracts/tokens/GenericToken.sol/GenericToken.json";
import BridgeArtifact from "../artifacts/contracts/Bridge.sol/Bridge.json";
import { TokenTransactionMetadata, getTokenTransactionMetadata } from "./interfaces/TokenTransactionMetadata";
import { constructTransaction, processTransaction } from "./interfaces/TransactionMetadata";
import { getProvider } from "./utils";

/**
 * The function mints an amount of tokens to a user. 
 * 
 * @param tokenAddress - the address of the token to be minted
 * @param receiverAddress - the address of the user receiving the tokens
 * @param amount - the amount of tokens to be minted
 * @param network - the network the tokens are going to be minted on
 */
export const tokenMint = async (tokenAddress: string, receiverAddress: string,  amount: number, network: string) => {
    const tokenTransactionMetadata: TokenTransactionMetadata = await getTokenTransactionMetadata(network);
    const transaction = await constructTransaction(
        await tokenTransactionMetadata.tokenContract.populateTransaction.mint(receiverAddress, amount),
        tokenTransactionMetadata
    );
    const transactionReceipt = await processTransaction(transaction, tokenTransactionMetadata);
    
    if (transactionReceipt.status != 1) {
        throw Error("Tokens were not minted");
    } else {
        console.log(amount + " tokens from tokenContract " + tokenAddress + " were minted to " + receiverAddress + " on the " + network + " network.");
    }    
}

/**
 * The function approoves a spender to control an amount of tokens for another user.
 * 
 * @param tokenAddress - the address of the token to be approved 
 * @param spender - the address of the spender
 * @param amount - the amount of tokens to be approved 
 * @param network - the network the tokens are going to be approved on
 */
export const tokenApprove = async (tokenAddress: string, spender: string, amount: number, network: string) => {
    const tokenTransactionMetadata: TokenTransactionMetadata = await getTokenTransactionMetadata(network);
    const transaction = await constructTransaction(
        await tokenTransactionMetadata.tokenContract.populateTransaction.approve(spender, amount),
        tokenTransactionMetadata
    );
    const transactionReceipt = await processTransaction(transaction, tokenTransactionMetadata);
    
    if (transactionReceipt.status != 1) {
        throw Error("Tokens were not approved");
    } else {
        console.log(amount + " tokens from tokenContract " + tokenAddress + " were approved to " + spender + " on the " + network + " network.");
    }    
}

/**
 * Returns the user's balance for a token.
 * 
 * @param tokenAddress - the address of the user
 * @param userAddress - the address of the token
 * @param network - the network
 */
export const checkTokenBalance = async (tokenAddress: string, userAddress: string, network: string ) => {
    const provider = await getProvider(network);
    const tokenContract = new Contract(tokenAddress, GenericTokenArtifact.abi, provider);
    const balance = await tokenContract.balanceOf(userAddress);
    console.log("User with address " + userAddress + " has "+ balance + " tokens from token with address " + tokenAddress);
}

/**
 * The function returns the amount of tokens a user can claim for a token.
 * 
 * @param tokenAddress - the address of the token 
 * @param userAddress - the address of the user
 * @param network - the network
 */
export const getToBeClaimed = async (tokenAddress: string, userAddress: string, network: string) => {
    const provider = await getProvider(network);
    const tokenContract = new Contract(network, BridgeArtifact.abi, provider);
    const toClaim = await tokenContract.getTokensToClaim(userAddress, tokenAddress);
    console.log("User with address " + userAddress + " has " + toClaim + " tokens from token with address " + tokenAddress + " to claim");
}

/**
 * The function returns the amount of tokens a spender has been allowed to operate with.
 * 
 * @param owner - the owner's address
 * @param spender - the spender's address
 * @param tokenAddress - the address of the token
 * @param network - the network
 */
export const getTokenAllowance = async (tokenAddress: string, owner: string, spender: string, network: string) => {
    const provider = await getProvider(network);
    const tokenContract = new Contract(tokenAddress, GenericTokenArtifact.abi, provider);
    const allowance = await tokenContract.allowance(owner, spender);
    console.log("Owner: " + owner + ", Spender: " + spender);
    console.log("Token address : " + tokenAddress +", Allowance: " + allowance);
}