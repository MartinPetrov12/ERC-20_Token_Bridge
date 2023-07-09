import mongoose from 'mongoose';

export const EventSchema = new mongoose.Schema({
    network: { type: String, required: true},
    operation: { type: String, required: true},
    userAddress: {type: String, required: true},
    tokenAddress: { type: String, required: true},
    amount: { type: Number, required: true},
});

export const EventModel = mongoose.model('Event', EventSchema);

export const getEvents = () => EventModel.find();

export const saveEvent = (network: string, operation: string, userAddress: string,
     tokenAddress: string, amount: number) => new EventModel({network, operation, userAddress, tokenAddress, amount}).save().then((event) => event.toObject());