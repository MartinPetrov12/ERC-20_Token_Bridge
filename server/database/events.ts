import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
    network: { type: String, required: true},
    operation: { type: String, required: true},
    userAddress: {type: String, required: true},
    tokenAddress: { type: String, required: true},
    amount: { type: Number, required: true},
    wrappedAddress: { type: String }
});

export const EventModel = mongoose.model('Event', EventSchema);

export const getEvents = () => EventModel.find();

export const saveEvent = (network: string, operation: string, userAddress: string,
     tokenAddress: string, amount: number) => new EventModel({network, operation, userAddress, tokenAddress, amount}).save().then((event) => event.toObject());

export const getTokenAddressFromWrapped = async (wrappedTokenAddress: string, network: string): Promise<string> => {
    const filter: { network: string,  wrappedAddress: string } = {
        network: network,
        wrappedAddress: wrappedTokenAddress
    }
    const result = await EventModel.findOne(filter);
    if(result == null) throw Error("There is no generic token for the wrapped token.")
    else return result.tokenAddress;
}     
