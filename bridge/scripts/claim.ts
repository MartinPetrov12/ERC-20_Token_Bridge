import { BridgeTransactionMetadata, getBridgeTransactionMetadata } from "./interfaces/BridgeTransactionMetadata";
import { constructTransaction, processTransaction } from "./interfaces/TransactionMetadata";

export const claim = async (tokenAddress: string, amount: number, network: string) => {
    const bridgeTransactionMetadata: BridgeTransactionMetadata = await getBridgeTransactionMetadata(network);
    const transaction = await constructTransaction(
        await bridgeTransactionMetadata.bridgeContract.populateTransaction.claim(tokenAddress, amount),
        bridgeTransactionMetadata
    );
    const transactionReceipt = await processTransaction(transaction, bridgeTransactionMetadata);

    if (transactionReceipt.status != 1) {
        throw Error("Funds were not claimed");
    } else {
        console.log(amount + " of tokens with address " + tokenAddress + " were claimed.");
    }   
}

/**
 * The function returns the amount of tokens a user can claim for a token.
 * 
 * @param tokenAddress - the address of the token 
 * @param userAddress - the address of the user
 * @param network - the network
 */
export const getToBeClaimed = async (tokenAddress: string, userAddress: string, network: string) => {
    const bridgeTransactionMetadata: BridgeTransactionMetadata = await getBridgeTransactionMetadata(network);
    const toClaim = await bridgeTransactionMetadata.bridgeContract.getTokensToClaim(userAddress, tokenAddress);
    console.log("User with address " + userAddress + " has " + toClaim + " tokens from token with address " + tokenAddress + " to claim");
}

export default claim;