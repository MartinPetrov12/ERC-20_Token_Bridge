import { BigNumber, Wallet, providers, Overrides } from "ethers";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.dev' });

export const getProvider = async (bridgeNetwork: string) => {

    if(bridgeNetwork.toLowerCase() == "sepolia") {
        return new providers.InfuraProvider('sepolia', process.env.INFURA_SEPOLIA_API);
    } else if(bridgeNetwork.toLowerCase() == "maticmum") {
        const provider = new providers.AlchemyProvider('maticmum', process.env.ALCHEMY_MUMBAI_API);
        return provider;
    } else {
       throw Error("Network " + bridgeNetwork + " is not supported.");
    }
}

export const getWallet = async (bridgeNetwork: string, provider: providers.UrlJsonRpcProvider) => {
    if(bridgeNetwork.toLowerCase() == "sepolia") {
        return new Wallet(process.env.SEPOLIA_PRIVATE_KEY || '', provider);
    } else if(bridgeNetwork.toLowerCase() == "maticmum") {
        return new Wallet(process.env.MUMBAI_PRIVATE_KEY || '', provider);
    } else {
       throw Error("Network " + bridgeNetwork + " is not supported.");
    }
}

export function populateDeploymentContract(network: string): (Overrides) | undefined {
    if(network == "maticmum") {
        return {
            gasLimit: BigNumber.from(Number(process.env.MUMBAI_GAS_LIMIT)),
            gasPrice: BigNumber.from(Number(process.env.GAS_PRICE)),            
        };
    } else if(network == "sepolia") {
        return {
            gasLimit: BigNumber.from(Number(process.env.SEPOLIA_GAS_LIMIT)),
            gasPrice: BigNumber.from(Number(process.env.GAS_PRICE)),
        };
    } else throw Error("Network " + network + " is not supported.");
}