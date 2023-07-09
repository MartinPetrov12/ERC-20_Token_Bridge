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

export default claim;