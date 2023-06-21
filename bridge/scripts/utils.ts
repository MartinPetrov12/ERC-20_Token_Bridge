import { Wallet, providers } from "ethers";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.dev' });

export const getProvider = async (bridgeNetwork: string) => {

    if(bridgeNetwork.toLowerCase() == "sepolia") {
        return new providers.InfuraProvider("sepolia", process.env.INFURA_SEPOLIA_URL);
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