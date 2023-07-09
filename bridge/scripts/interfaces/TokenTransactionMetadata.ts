import { BigNumber, Contract, PopulatedTransaction } from 'ethers'
import { TransactionMetadata, getContractAddress } from './TransactionMetadata';
import { getProvider, getWallet } from '../utils';
import GenericTokenArtifact from '../../artifacts/contracts/tokens/GenericToken.sol/GenericToken.json';

export interface TokenTransactionMetadata extends TransactionMetadata {
    tokenContract: Contract,
}

export const getTokenTransactionMetadata = async (network: string): Promise<TokenTransactionMetadata> => {
    const provider = await getProvider(network);
    const account = await getWallet(network, provider);
    const tokenContract = new Contract(getContractAddress(network), GenericTokenArtifact.abi, provider);
    return {
        provider,
        account,
        tokenContract,
        network
    }
}