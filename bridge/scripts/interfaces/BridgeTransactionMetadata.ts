import {Contract} from 'ethers'
import { getProvider, getWallet } from '../utils';
import BridgeArtifact from '../../artifacts/contracts/Bridge.sol/Bridge.json'
import { TransactionMetadata, getContractAddress } from './TransactionMetadata';

export interface BridgeTransactionMetadata extends TransactionMetadata {
    bridgeContract: Contract,
}

export const getBridgeTransactionMetadata = async (network: string): Promise<BridgeTransactionMetadata> => {
    const provider = await getProvider(network);
    const account = await getWallet(network, provider);
    const bridgeContract = new Contract(getContractAddress(network), BridgeArtifact.abi, provider);
    return {
        provider: provider,
        account: account,
        bridgeContract: bridgeContract,
        network: network
    }
}