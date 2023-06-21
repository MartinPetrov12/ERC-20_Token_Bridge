import { BigNumber, Contract } from "ethers";
import BridgeArtifact from "../artifacts/contracts/Bridge.sol/Bridge.json";
import { getProvider, getWallet }  from './utils'

export const release = async (bridgeNetwork: string, bridgeAddress: string, tokenAddress: string, amount: number ) => {
    const provider = await getProvider(bridgeNetwork);
    const account = await getWallet(bridgeNetwork, provider);
    const bridgeContract = new Contract(bridgeAddress, BridgeArtifact.abi, provider);

    const testTx = await bridgeContract.populateTransaction.release(tokenAddress, amount);
    testTx.nonce = await account.getTransactionCount();
    if(bridgeNetwork == "mumbai") {
        testTx.chainId = 80001
    }
    testTx.gasLimit = BigNumber.from(3000000);
    testTx.gasPrice = BigNumber.from(5000000000);
    const approveTxSigned = await account.signTransaction(testTx);

    const submittedTx = await provider.sendTransaction(approveTxSigned);

    const approveReceipt = await submittedTx.wait();
    if (approveReceipt.status != 1) {
        throw Error("Funds were not released");
    } else {
        console.log(amount + " of tokens from token with address " + bridgeAddress + " were released.");
    }   
}

export default release;