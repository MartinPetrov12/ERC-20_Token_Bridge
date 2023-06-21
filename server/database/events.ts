import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
    network: { type: String, required: true},
    operation: { type: String, required: true},
    amount: { type: Number, required: true},
    tokenAddress: { type: String, required: true}
});

export const eventModel = mongoose.model('Event', EventSchema);

export const getEvents = () => eventModel.find();