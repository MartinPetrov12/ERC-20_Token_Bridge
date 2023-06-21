import { Contract } from "ethers";
import BridgeArtifact from "../artifacts/contracts/Bridge.sol/Bridge.json";
import { constructTransaction, getProvider, getWallet }  from './utils'

export const release = async (bridgeNetwork: string, bridgeAddress: string, tokenAddress: string, amount: number ) => {
    const provider = await getProvider(bridgeNetwork);
    const account = await getWallet(bridgeNetwork, provider);
    const bridgeContract = new Contract(bridgeAddress, BridgeArtifact.abi, provider);

    const transaction = await constructTransaction(await bridgeContract.populateTransaction.release(tokenAddress, amount), account, bridgeNetwork);
    
    const approveTxSigned = await account.signTransaction(transaction);

    const submittedTx = await provider.sendTransaction(approveTxSigned);

    const approveReceipt = await submittedTx.wait();
    if (approveReceipt.status != 1) {
        throw Error("Funds were not released");
    } else {
        console.log(amount + " of tokens from token with address " + bridgeAddress + " were released.");
    }   
}

export default release;