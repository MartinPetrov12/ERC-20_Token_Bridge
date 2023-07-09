import { Contract } from 'ethers'
import { TransactionMetadata } from './TransactionMetadata';
import { getProvider, getWallet } from '../utils';
import GenericTokenArtifact from '../../artifacts/contracts/tokens/GenericToken.sol/GenericToken.json';

export interface TokenTransactionMetadata extends TransactionMetadata {
    tokenContract: Contract,
}

export const getTokenTransactionMetadata = async (tokenAddress: string, network: string): Promise<TokenTransactionMetadata> => {
    const provider = await getProvider(network);
    const account = await getWallet(network, provider);
    const tokenContract = new Contract(tokenAddress, GenericTokenArtifact.abi, provider);
    return {
        provider: provider,
        account: account,
        tokenContract: tokenContract,
        network: network
    }
}