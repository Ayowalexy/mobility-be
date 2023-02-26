import mongoose from "mongoose";
const Schema = mongoose.Schema;


const transactionsSchema = new Schema({
    reference: String,
    amount: Number,
    name: String,
    type: {
        type: String,
        default: 'debit',
        enum: ['debit', 'credit', 'charge']
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'success', 'failed']
    }
}, { timestamps: true})


const Transaction = mongoose.model('transactions', transactionsSchema);

export default Transaction