import { Contract, ethers } from "ethers";
import dotenv from 'dotenv'
import BridgeArtifact from '../../bridge/artifacts/contracts/Bridge.sol/Bridge.json';
import fs from 'fs';

dotenv.config({ path: '.env.dev' });

export async function getContract(network: string) {
    const provider = await getProvider(network);
    if(network == 'sepolia') {
        const contract = new Contract(process.env.SEPOLIA_BRIDGE_ADDRESS, BridgeArtifact.abi, provider);
        return contract
    } else if(network == 'maticmum') {
        return new Contract(process.env.MUMBAI_BRIDGE_ADDRESS, BridgeArtifact.abi, provider);
    }
    
}
  
export async function getProvider(network: string) {
    if(network == 'sepolia') {
        return new ethers.providers.InfuraProvider('sepolia', process.env.INFURA_SEPOLIA_API);
    } else if(network == 'maticmum') {
        return new ethers.providers.AlchemyProvider('maticmum', process.env.ALCHEMY_MUMBAI_API);
    } else throw Error("The network" + network + " is not supported by the backend");
}

export function getLastProcessedBlock(filePath: string): number {
    if (fs.existsSync(filePath)) {
      const lastProcessedMumbaiBlock = parseInt(fs.readFileSync(filePath).toString());
      return lastProcessedMumbaiBlock;
    } else return 0;
  }
  
export async function updateLastProcessedBlock(filePath: string, lastProcessedBlock: number) {
    fs.writeFile(filePath, lastProcessedBlock.toString(), { }, (err) => {});
}
