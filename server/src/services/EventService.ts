import {Event} from 'ethers';
import dotenv from 'dotenv';
import { getTokenAddressFromWrapped, saveEvent } from '../../database/events';
import { addLockedAmount, addTokenWrappedAddress, decreaseClaimAmount, decreaseReleaseAndLockAmounts, increaseReleaseAmount } from '../../database/bridgedToken';
import { addTokensToClaim, addTokensToRelease} from '../../../bridge/scripts/mappingsSetter'

dotenv.config({ path: '.env.dev' });

export async function parseEvent(event: Event, network: string) {
    if(event.event == "TokenLocked") {
      await processLockEvent(event, network);
    } else if(event.event == "TokenClaimed") {
      await processClaimEvent(event, network);
    } else if(event.event == "TokenReleased") {
      await processReleaseEvent(event, network);
    } else if(event.event == "TokenBurned") {
      await processBurnEvent(event, network);
    } else if(event.event == "WrappedTokenAdded") {
      await processWrappedTokenEvent(event, network);
    }
}

async function processLockEvent(event: Event, network: string) {
    console.log("Locked funds");
    const tokenAddress = event.args[0];
    const userAddress = event.args[1]
    const amount = event.args[2];

    if(network == "sepolia") {
      await addTokensToClaim(tokenAddress, userAddress, amount, "maticmum");
    } else if(network == "maticmum") {
      await addTokensToClaim(tokenAddress, userAddress, amount, "sepolia");
    }

    await saveEvent(network, "TokenLocked", userAddress, tokenAddress, amount);
    await addLockedAmount(userAddress, tokenAddress, amount, network);
  }
  
  async function processClaimEvent(event: Event, network: string) {
    const tokenAddress = event.args[0];
    const userAddress = event.args[1]
    const amount = event.args[2];
    console.log("User: " + userAddress + " claimed " + amount + " tokens, address of token: " + tokenAddress)
    await saveEvent(network, "TokenClaimed", userAddress, tokenAddress, amount);
    await decreaseClaimAmount(userAddress, tokenAddress, amount, network)
  }
  
  async function processReleaseEvent(event: Event, network: string) {
    const tokenAddress = event.args[0];
    const userAddress = event.args[1]
    const amount = event.args[2];
    console.log("Released tokens");
    await saveEvent(network, "TokenReleased", userAddress, tokenAddress, amount);
    await decreaseReleaseAndLockAmounts(userAddress, tokenAddress, amount, network);
  }
  
  async function processBurnEvent(event: Event, network: string) {
    console.log("Burned tokens");
    const wrappedTokenAddress = event.args[0];
    const userAddress = event.args[1]
    const amount = event.args[2];
    
    const tokenAddress = await getTokenAddressFromWrapped(wrappedTokenAddress, network);

    if(network == "sepolia") {
      await addTokensToRelease(tokenAddress, userAddress, amount, "maticmum");
    } else if(network == "maticmum") {
      await addTokensToRelease(tokenAddress, userAddress, amount, "sepolia");
    }
  
    await saveEvent(network, "TokenBurned", userAddress, wrappedTokenAddress, amount);
    await increaseReleaseAmount(userAddress, wrappedTokenAddress, amount, network)
  }
  
  async function processWrappedTokenEvent(event: Event, network: string) {
    const originalTokenAddress = event.args[0];
    const wrappedTokenAddress = event.args[1];
    await addTokenWrappedAddress(originalTokenAddress, wrappedTokenAddress)
  }