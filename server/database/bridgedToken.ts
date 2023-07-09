import mongoose from 'mongoose';

const BridgedTokenSchema = new mongoose.Schema({
    userAddress: { type: String, default: null},
    nativeAddress: {type: String, default: null},
    wrappedAddress: {type: String, default: null},
    lockedAmount: { type: Number, default: 0},
    toBeClaimedAmount: { type: Number, default: 0},
    toBeReleasedAmount: { type: Number, default: 0},
    nativeNetwork: { type: String, defaukt: null},
});

export const BridgedTokenModel = mongoose.model('BridgedToken', BridgedTokenSchema);

export const addBridgedToken = (userAddress: string, nativeAddress: string, wrappedAddress: string,
    lockedAmount: number, toBeClaimedAmount: number, toBeReleasedAmount: number, nativeNetwork: string,) => new BridgedTokenModel({
        userAddress, nativeAddress, wrappedAddress, lockedAmount, toBeClaimedAmount, toBeReleasedAmount, nativeNetwork
    }).save().then((bridgedToken) => bridgedToken.toObject());

export const addLockedAmount = async (userAddress: string, tokenAddress: string, amount: number, network: string) => {
    try {
        const filter = {
          userAddress: userAddress,
          nativeAddress: tokenAddress,
          nativeNetwork: network
        };
    
        const update = {
          $inc: {
            lockedAmount: amount,
            toBeClaimedAmount: amount
          }
        };
    
        const options = {
          upsert: true,
          new: true // Return the updated document
        };
    
        const updatedBridgedToken = await BridgedTokenModel.findOneAndUpdate(filter, update, options);
        return updatedBridgedToken;
      } catch (error) {
        console.error('Error:', error);
      }
}

export const decreaseClaimAmount = async (userAddress: string, wrappedTokenAddress: string, amount: number, network: string) => {
    try {
        const filter = {
          userAddress: userAddress,
          wrappedAddress: wrappedTokenAddress,
          nativeNetwork: network
        };
    
        const update = {
          $inc: {
            toBeClaimedAmount: -amount
          }
        };
    
        const options = {
          upsert: true,
          new: true // Return the updated document
        };
    
        const updatedBridgedToken = await BridgedTokenModel.findOneAndUpdate(filter, update, options);
        return updatedBridgedToken;
      } catch (error) {
        console.error('Error:', error);
      }
}

export const decreaseReleaseAndLockAmounts = async (userAddress: string, tokenAddress: string, amount: number, network: string) => {
    try {
        const filter = {
          userAddress: userAddress,
          nativeAddress: tokenAddress,
          nativeNetwork: network
        };
    
        const update = {
          $inc: {
            toBeReleasedAmount: -amount,
            lockedAmount: -amount
          }
        };
    
        const options = {
          upsert: true,
          new: true // Return the updated document
        };
    
        const updatedBridgedToken = await BridgedTokenModel.findOneAndUpdate(filter, update, options);
        return updatedBridgedToken;
      } catch (error) {
        console.error('Error:', error);
      }
}

export const increaseReleaseAmount = async (userAddress: string, wrappedTokenAddress: string, amount: number, network: string) => {
    try {
        const filter = {
          userAddress: userAddress,
          wrappedAddress: wrappedTokenAddress,
          nativeNetwork: network
        };
    
        const update = {
          $inc: {
            toBeReleasedAmount: amount
          }
        };
    
        const options = {
          upsert: true,
          new: true // Return the updated document
        };
    
        const updatedBridgedToken = await BridgedTokenModel.findOneAndUpdate(filter, update, options);
        return updatedBridgedToken;
      } catch (error) {
        console.error('Error:', error);
      }
}

export const getTokensToBeClaimed = async () => {
    const filter = { toBeClaimedAmount: {$gt: 0}}
    return await BridgedTokenModel.find(filter)
}

export const getTokensToBeReleased = async () => {
    const filter = { toBeReleasedAmount: {$gt: 0}}
    return await BridgedTokenModel.find(filter)
}

export const getBridgedTokens = async () => {
    const filter: { nativeAddress: { $ne: null },  wrappedAddress: { $ne: null} } = {
        nativeAddress: { $ne: null },
        wrappedAddress: { $ne: null}
    }
    return await BridgedTokenModel.find(filter)
}

export const getBridgedTokensByUserAddress = async (userAddress: string) => {
    const filter: { userAddress: string, nativeAddress: { $ne: null },  wrappedAddress: { $ne: null} } = {
        userAddress: userAddress,
        nativeAddress: { $ne: null },
        wrappedAddress: { $ne: null}
    }
    return await BridgedTokenModel.find(filter)
}

export const addTokenWrappedAddress = async(originalTokenAddress: string, wrappedTokenAddress: string) => {
  const filter = {
    nativeAddress: { $eq: originalTokenAddress }
  };

  const update = {
    $set: { wrappedAddress: wrappedTokenAddress}
  };

  return await BridgedTokenModel.updateMany(filter, update); 
}
