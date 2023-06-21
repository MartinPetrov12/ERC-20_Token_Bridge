import { BigNumber, Contract } from "ethers";
import BridgeArtifact from "../artifacts/contracts/Bridge.sol/Bridge.json";
import { getProvider, getWallet, constructTransaction }  from './utils'

export const addTokensToRelease = async (bridgeNetwork: string, bridgeAddress: string, tokenAddress: string, user: string, amount: number) => {
    const provider = await getProvider(bridgeNetwork);
    const account = await getWallet(bridgeNetwork, provider);
    const bridgeContract = new Contract(bridgeAddress, BridgeArtifact.abi, provider);

    const transaction = await constructTransaction(await bridgeContract.populateTransaction.addTokensToRelease(user, tokenAddress, amount), account, bridgeNetwork);
    
    const approveTxSigned = await account.signTransaction(transaction);

    const submittedTx = await provider.sendTransaction(approveTxSigned);

    const approveReceipt = await submittedTx.wait();
    if (approveReceipt.status != 1) {
        throw Error("Error while setting tokens to release.");
    } else {
        const availableTokensToRelease = await bridgeContract.getTokensToRelease(user, tokenAddress);
        console.log("User with address " + user + " can now release " + availableTokensToRelease + " tokens for token with address " + tokenAddress);
    }   
}

export const addTokensToClaim = async (bridgeNetwork: string, bridgeAddress: string, tokenAddress: string, user: string, amount: number) => {
    const provider = await getProvider(bridgeNetwork);
    const account = await getWallet(bridgeNetwork, provider);
    const bridgeContract = new Contract(bridgeAddress, BridgeArtifact.abi, provider);

    const detailedTransaction = await constructTransaction(await bridgeContract.populateTransaction.addTokensToClaim(user, tokenAddress, amount), account, bridgeNetwork);
    const approveTxSigned = await account.signTransaction(detailedTransaction);
    const submittedTx = await provider.sendTransaction(approveTxSigned);
    const approveReceipt = await submittedTx.wait();
    if (approveReceipt.status != 1) {
        throw Error("Error while setting tokens to claim.");
    } else {
        const availableTokensToClaim = await bridgeContract.getTokensToClaim(user, tokenAddress);
        console.log("User with address " + user + " can now claim " + availableTokensToClaim + " tokens for token with address " + tokenAddress);
    }   
}

export default { addTokensToRelease, addTokensToClaim };
