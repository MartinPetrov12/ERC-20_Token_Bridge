import { BigNumber, PopulatedTransaction, Wallet, providers } from "ethers";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.dev' });

export const getProvider = async (bridgeNetwork: string) => {

    if(bridgeNetwork.toLowerCase() == "sepolia") {
        return new providers.InfuraProvider("sepolia", process.env.INFURA_SEPOLIA_API);
    } else if(bridgeNetwork.toLowerCase() == "mumbai") {
        const provider = new providers.AlchemyProvider('maticmum', process.env.ALCHEMY_MUMBAI_API);
        return provider;
    } else {
       throw Error("Network " + bridgeNetwork + " is not supported.");
    }
}

export const getWallet = async (bridgeNetwork: string, provider: providers.UrlJsonRpcProvider) => {
    if(bridgeNetwork.toLowerCase() == "sepolia") {
        return new Wallet(process.env.SEPOLIA_PRIVATE_KEY || '', provider);
    } else if(bridgeNetwork.toLowerCase() == "mumbai") {
        return new Wallet(process.env.MUMBAI_PRIVATE_KEY || '', provider);
    } else {
       throw Error("Network " + bridgeNetwork + " is not supported.");
    }
}

export async function constructTransaction(transaction: PopulatedTransaction, account: Wallet, bridgeNetwork: string): Promise<PopulatedTransaction> {
    transaction.nonce = await account.getTransactionCount();
    transaction.gasLimit = BigNumber.from(Number(process.env.GAS_LIMIT));
    transaction.gasPrice = BigNumber.from(Number(process.env.GAS_PRICE));
    if(bridgeNetwork == "mumbai") {
        transaction.chainId = Number(process.env.MUMBAI_CHAIN_ID);
    } else if(bridgeNetwork == "sepolia") {
        transaction.chainId = Number(process.env.SEPOLIA_CHAIN_ID);
    }
    return transaction;
}