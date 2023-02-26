import User from "../models/usermodel.js";
import Card from "../models/cardModel.js";
import asyncHandler from "express-async-handler";
import crypto from 'crypto'
import dotenv from "dotenv";
import { fundAccountSchema, resolveSchema, sendMoneySchema } from "../utils/schema.js";
import axios from "axios";
import Transaction from "../models/transactionsModel.js";

import sendTransaactionEmail from "../utils/sendTransactionemail.js";


dotenv.config();

const PAYSTACK_SK = process.env.PAYSTACK_SK


const verifyCardTokenization = asyncHandler(async (req, res) => {

    const hash = crypto.createHmac('sha512', PAYSTACK_SK).update(JSON.stringify(req.body)).digest('hex');
    if (hash === req.headers['x-paystack-signature']) {
        const event = req.body;
        const data = req.body;
        const amount = data?.data?.amount;
        const email = data.data.customer.email;
        const authorization = data.data.authorization
        const reference = data.data.reference;
        const type = data.data.source.entry_point;
        const user = await User.findOne({ email }).populate('cards')

        if (data.event === 'charge.success' && amount === 10000 && type !== 'charge') {
            const userCards = user.cards;
            const hasUserAddedCard = userCards.some(ele => ele.cards.bin === authorization.bin);
            if (!hasUserAddedCard) {
                const newCard = new Card({ cards: authorization });
                await newCard.save();
                const newTransaction = new Transaction({
                    reference,
                    amount,
                    name: user.firstName.concat(' ', user.lastName),
                    type: 'credit',
                    status: 'success'
                })
                await newTransaction.save()
                user.transactions.push(newTransaction)
                user.cards.push(newCard);
                await user.save()
            }
        } else if (data.event === 'charge.success' && type === 'charge') {
            await Transaction.findOneAndUpdate({ reference }, { status: 'success' });
            user.accountBalance = user.accountBalance + amount;
            await user.save();
            const name = user.firstName.concat(' ', user.lastName);
            await sendTransaactionEmail(user.email, name, amount, 'fund');
        }
    }

    res.sendStatus(200)

})


const fundAccount = asyncHandler(async (req, res) => {

    const { error, value } = fundAccountSchema.validate(req.body);

    if (error) {
        return res
            .status(401)
            .json(
                {
                    status: "error",
                    message: "invalid request",
                    meta: {
                        error: error.message
                    }
                })
    }

    try {
        const data = { ...value, amount: Number(value.amount) * 100 }
        const response = await axios('https://api.paystack.co/transaction/charge_authorization', {
            method: 'POST',
            data: data,
            headers: {
                "Content-Type": 'application/json',
                "Authorization": `Bearer ${PAYSTACK_SK}`
            }
        })

        const user = await User.findById(req.user._id);
        const reference = response.data.data.reference;
        const amount = Number(response.data.data.amount) / 100;


        const newTransaction = new Transaction({
            reference,
            amount,
            name: user.firstName.concat(' ', user.lastName),
            type: 'credit',
            status: 'pending'
        })
        await newTransaction.save();
        user.transactions.push(newTransaction);
        await user.save();

        res
            .status(201)
            .json(
                {
                    status: "success",
                    message: "charge attempted",
                    meta: {}
                })

    } catch (e) {
        res
            .status(401)
            .json(
                {
                    status: "error",
                    message: "",
                    meta: { error: "provider not available" }
                })
    }


})

const getAllUserTransactions = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('transactions');
    res
        .status(201)
        .json(
            {
                status: "success",
                message: "all transactions",
                data: user.transactions,
                meta: {}
            })

})

const resolveAccount = asyncHandler(async (req, res) => {
    const { error, value } = resolveSchema.validate(req.body);

    if (error) {
        return res
            .status(401)
            .json(
                {
                    status: "error",
                    message: "invalid request",
                    meta: {
                        error: error.message
                    }
                })
    }
    const user = await User.findOne({ accountNumber: value.accountNumber })
    if (user) {
        const data = {
            name: user.firstName.concat(' ', user.lastName),
            accountNumber: user.accountNumber,
            type: 'intra transfer'
        }

        res
            .status(202)
            .json(
                {
                    status: "success",
                    message: "account resolved successfully",
                    data: data,
                    meta: {}
                })
    } else {
        res
            .status(401)
            .json(
                {
                    status: "error",
                    message: "",
                    meta: { error: "cannot resolve account" }
                })
    }
})

const sendFund = asyncHandler(async (req, res) => {
    const { error, value } = sendMoneySchema.validate(req.body);

    if (error) {
        return res
            .status(401)
            .json(
                {
                    status: "error",
                    message: "invalid request",
                    meta: {
                        error: error.message
                    }
                })
    }

    const user = await User.findById(req.user._id);
    if (Number(value.amount) < user.accountBalance) {
        const receiver = await User.findOne({ accountNumber: value.accountNumber });
        receiver.accountBalance = Number(receiver.accountBalance) + Number(value.amount);

        const receiverName = receiver.firstName.concat(' ', receiver.lastName);
        const senderName = user.firstName.concat(' ', user.lastName);

        await sendTransaactionEmail(receiver.email, receiverName, value.amount, 'credit', senderName);

        user.accountBalance = Number(user.accountBalance) - Number(value.amount);

        const newTransaction = new Transaction({
            reference: Math.random().toString(),
            amount: value.amount,
            name: receiverName,
            type: 'debit',
            status: 'success'
        })

        const newTransactionReceiver = new Transaction({
            reference: Math.random().toString(),
            amount: value.amount,
            name: senderName,
            type: 'credit',
            status: 'success'
        })

        await newTransaction.save();
        await newTransactionReceiver.save();

        user.transactions.push(newTransaction);
        receiver.transactions.push(newTransactionReceiver);


        await receiver.save();
        await user.save()
        await sendTransaactionEmail(user.email, senderName, value.amount, 'debit', senderName);
        res
            .status(201)
            .json(
                {
                    status: "success",
                    message: `You just sent ${value.amount} to ${receiverName}`,
                    meta: {}
                })

    } else {
        return res
            .status(401)
            .json(
                {
                    status: "error",
                    message: "invalid request",
                    meta: {
                        error: 'insufficient balance'
                    }
                })
    }
})


const getUserCards = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('cards');
    res
        .status(201)
        .json(
            {
                status: "success",
                message: 'All user cards',
                data: user.cards,
                meta: {}
            })


})

export {
    verifyCardTokenization,
    fundAccount,
    getAllUserTransactions,
    resolveAccount,
    sendFund,
    getUserCards
}