import { BridgeTransactionMetadata, getBridgeTransactionMetadata } from "./interfaces/BridgeTransactionMetadata";
import { constructTransaction, processTransaction } from "./interfaces/TransactionMetadata";

/**
 * The function releases an amount of user's locked tokens.
 * 
 * @param tokenAddress - the address of the token
 * @param amount - the amount to be released
 * @param network - the network
 */
export const release = async (tokenAddress: string, amount: number, network: string) => {
    const bridgeTransactionMetadata: BridgeTransactionMetadata = await getBridgeTransactionMetadata(network);
    const transaction = await constructTransaction(
        await bridgeTransactionMetadata.bridgeContract.populateTransaction.release(tokenAddress, amount),
        bridgeTransactionMetadata
    );
    const transactionReceipt = await processTransaction(transaction, bridgeTransactionMetadata);
    
    if (transactionReceipt.status != 1) {
        throw Error("Funds were not released");
    } else {
        console.log(amount + " of tokens from token with address " + tokenAddress + " were released.");
    }   
}

export default release;