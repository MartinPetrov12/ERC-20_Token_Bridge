import { BigNumber, Contract } from "ethers";
import BridgeArtifact from "../artifacts/contracts/Bridge.sol/Bridge.json";
import { getProvider, getWallet }  from './utils'
import { token } from "../typechain-types/@openzeppelin/contracts";

export const setTokenRelease = async (bridgeNetwork: string, bridgeAddress: string, tokenAddress: string, user: string, amount: number ) => {
    const provider = await getProvider(bridgeNetwork);
    const account = await getWallet(bridgeNetwork, provider);
    const bridgeContract = new Contract(bridgeAddress, BridgeArtifact.abi, provider);

    const testTx = await bridgeContract.populateTransaction.setTokensToRelease(user, tokenAddress, amount);
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
        throw Error("Error while setting tokens to release.");
    } else {
        const availableTokensToRelease = await bridgeContract.getTokensToRelease(user, tokenAddress);
        console.log("User with address " + user + " can now release " + availableTokensToRelease + " tokens for token with address " + tokenAddress);
    }   
}

export default setTokenRelease;