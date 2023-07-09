import { BridgeTransactionMetadata, getBridgeTransactionMetadata } from "./interfaces/BridgeTransactionMetadata";
import { constructTransaction, processTransaction } from "./interfaces/TransactionMetadata";

/**
 * The function adds an amount of tokens to be released for a user.
 * 
 * @param tokenAddress - the address of the token
 * @param user - the address of the user
 * @param amount - the amount to be added
 * @param network
 */
export const addTokensToRelease = async (tokenAddress: string, user: string, amount: number, network: string) => {
    const bridgeTransactionMetadata: BridgeTransactionMetadata = await getBridgeTransactionMetadata(network);
    const transaction = await constructTransaction(
        await bridgeTransactionMetadata.bridgeContract.populateTransaction.addTokensToRelease(user, tokenAddress, amount),
        bridgeTransactionMetadata
    );
    const transactionReceipt = await processTransaction(transaction, bridgeTransactionMetadata);
    
    if (transactionReceipt.status != 1) {
        throw Error("Error while setting tokens to release.");
    } else {
        const availableTokensToRelease = await bridgeTransactionMetadata.bridgeContract.getTokensToRelease(user, tokenAddress);
        console.log("User with address " + user + " can now release " + availableTokensToRelease + " tokens for token with address " + tokenAddress);
    }   
}

/**
 * The function adds an amount of tokens to be claimed by a user.
 * 
 * @param tokenAddress - the address of the token
 * @param user - the address of the user
 * @param amount - the amount to be added
 * @param network
 */
export const addTokensToClaim = async (tokenAddress: string, user: string, amount: number, network: string) => {
    const bridgeTransactionMetadata: BridgeTransactionMetadata = await getBridgeTransactionMetadata(network);
    const transaction = await constructTransaction(
        await bridgeTransactionMetadata.bridgeContract.populateTransaction.addTokensToClaim(user, tokenAddress, amount),
        bridgeTransactionMetadata
    );
    const transactionReceipt = await processTransaction(transaction, bridgeTransactionMetadata);

    if (transactionReceipt.status != 1) {
        throw Error("Error while setting tokens to claim.");
    } else {
        const availableTokensToClaim = await bridgeTransactionMetadata.bridgeContract.getTokensToClaim(user, tokenAddress);
        console.log("Network: " + network + ", User with address " + user + " can now claim " + availableTokensToClaim + " tokens for token with address " + tokenAddress);
    }   
}

export default { addTokensToRelease, addTokensToClaim };
