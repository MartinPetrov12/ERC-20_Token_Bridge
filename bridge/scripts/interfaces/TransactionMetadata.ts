import { BigNumber, PopulatedTransaction, Wallet, providers } from "ethers";

export interface TransactionMetadata{
    provider: providers.UrlJsonRpcProvider,
    account: Wallet,
    network: string
}

export const getContractAddress = (network: string): string => {
    if(network == 'sepolia') {
        return process.env.SEPOLIA_BRIDGE_ADDRESS || '';
    } else if(network == 'maticmum') {
        return process.env.MUMBAI_BRIDGE_ADDRESS || '';
    } else throw Error('The ' + network + ' is not supported.');
}

export async function constructTransaction(transaction: PopulatedTransaction, transactionMetadata: TransactionMetadata): Promise<PopulatedTransaction> {
    transaction.nonce = await transactionMetadata.account.getTransactionCount();
    transaction.gasPrice = BigNumber.from(Number(process.env.GAS_PRICE));
    if(transactionMetadata.network == "maticmum") {
        transaction.chainId = Number(process.env.MUMBAI_CHAIN_ID);
        transaction.gasLimit = BigNumber.from(Number(process.env.MUMBAI_GAS_LIMIT));
    } else if(transactionMetadata.network == "sepolia") {
        transaction.chainId = Number(process.env.SEPOLIA_CHAIN_ID);
        transaction.gasLimit = BigNumber.from(Number(process.env.SEPOLIA_GAS_LIMIT));
    }
    return transaction;
}

export const processTransaction = async (transaction: PopulatedTransaction, transactionMetadata: TransactionMetadata): Promise<providers.TransactionReceipt> => {
    const approveTxSigned = await transactionMetadata.account.signTransaction(transaction);

    const submittedTx = await transactionMetadata.provider.sendTransaction(approveTxSigned);

    const approveReceipt = await submittedTx.wait();

    return approveReceipt;
}
