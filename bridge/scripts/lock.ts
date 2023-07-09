import { BigNumber } from "ethers";
import { BridgeTransactionMetadata, getBridgeTransactionMetadata } from "./interfaces/BridgeTransactionMetadata";
import { constructTransaction, processTransaction } from "./interfaces/TransactionMetadata";

// The fee required by the bridge for locking a token is equal to 200_000 gwei.
const lockTransactionFee = 200_000_000_000_000

/**
 * The function locks an amount of tokens in the bridge. In order to do that,
 * a value of 200_000 gwei needs to be sent with the transaction. That is the 
 * fee taken by the bridge. 
 * 
 * @param tokenAddress - the address of the token to be locked
 * @param amount - the amount of tokens to be locked
 * @param network - the network the tokens are going to be locked on
 */
export const lock = async (tokenAddress: string, amount: number, network: string) => {
    const bridgeTransactionMetadata: BridgeTransactionMetadata = await getBridgeTransactionMetadata(network);

    const transaction = await constructTransaction(
        await bridgeTransactionMetadata.bridgeContract.populateTransaction.lock(tokenAddress, amount), 
        bridgeTransactionMetadata
    );
    transaction.value = BigNumber.from(lockTransactionFee);
    
    const transactionReceipt = await processTransaction(transaction, bridgeTransactionMetadata);
    
    if (transactionReceipt.status != 1) {
        throw Error("Funds were not locked.");
    } else {
        console.log(amount + " tokens have been locked, address of the token: " + tokenAddress + ".");
    }   
}
