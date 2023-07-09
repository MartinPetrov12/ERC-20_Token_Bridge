import { constructTransaction, processTransaction } from "./interfaces/TransactionMetadata";
import { BridgeTransactionMetadata, getBridgeTransactionMetadata } from "./interfaces/BridgeTransactionMetadata";

/**
 * The function burns an amount of user's wrapped tokens.
 * 
 * @param tokenAddress - the address of the token to be burned
 * @param amount - the amount to be burned
 * @param network - the network
 */
export const burn = async (tokenAddress: string, amount: number, network: string) => {
    const bridgeTransactionMetadata: BridgeTransactionMetadata = await getBridgeTransactionMetadata(network);
    const transaction = await constructTransaction(
        await bridgeTransactionMetadata.bridgeContract.populateTransaction.burn(tokenAddress, amount),
        bridgeTransactionMetadata
    );
    const transactionReceipt = await processTransaction(transaction, bridgeTransactionMetadata);

    if (transactionReceipt.status != 1) {
        throw Error("Funds were not burnt");
    } else {
        console.log("Funds were burnt");
    }   
}

export default burn;