import { BigNumber, Contract } from "ethers";
import BridgeArtifact from "../artifacts/contracts/Bridge.sol/Bridge.json";
import { constructTransaction, getProvider, getWallet }  from './utils'

export const lock = async (bridgeNetwork: string, bridgeAddress: string, tokenAddress: string, amount: number ) => {
    const provider = await getProvider(bridgeNetwork);
    const account = await getWallet(bridgeNetwork, provider);
    const bridgeContract = new Contract(bridgeAddress, BridgeArtifact.abi, provider);

    const transaction = await constructTransaction(await bridgeContract.populateTransaction.lock(tokenAddress, amount), account, bridgeNetwork);
    transaction.value = BigNumber.from(200_000_000_000_000);
    
    const approveTxSigned = await account.signTransaction(transaction);

    const submittedTx = await provider.sendTransaction(approveTxSigned);

    const approveReceipt = await submittedTx.wait();
    if (approveReceipt.status != 1) {
        throw Error("Funds were not locked");
    } else {
        console.log("Funds were locked");
    }   
}

export default lock;